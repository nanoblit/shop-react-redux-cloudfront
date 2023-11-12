const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const csv = require("csv-parser");
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");

const s3Client = new S3Client({ region: "eu-north-1" });
const sqsClient = new SQSClient({ region: "eu-north-1" });

function getSendMessageCommand(product) {
  return new SendMessageCommand({
    QueueUrl:
      "https://sqs.eu-north-1.amazonaws.com/565131416501/products-dev-CatalogItemsQueue-YP9zvOsX60Vf",
    MessageBody: product,
  });
}

function sendToSqs(products) {
  for (const product of products) {
    const productJson = JSON.stringify(product);
    console.log(product);
    sqsClient
      .send(getSendMessageCommand(productJson))
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
}

module.exports.handler = async (event) => {
  const { s3 } = event.Records[0];
  const bucket = s3.bucket.name;
  const key = s3.object.key;

  if (!key.startsWith("uploaded/")) {
    console.log('Skipped. Object not in the "uploaded" folder.');
    return;
  }

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const stream = response.Body;

    const productsData = stream.pipe(csv());

    for await (const product of productsData) {
      const productJson = JSON.stringify(product);
      const response = await sqsClient.send(getSendMessageCommand(productJson));
      console.log(response);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
