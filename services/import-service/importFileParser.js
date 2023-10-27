const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const csv = require("csv-parser");

const client = new S3Client({ region: "eu-north-1" });

module.exports.handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;

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
    const response = await client.send(command);
    const stream = response.Body;

    stream
      .pipe(csv())
      .on("data", (data) => console.log("Line:", data))
      .on("end", () => console.log("End of stream"));
  } catch (error) {
    console.log(error);
    const message = `Error getting object ${key} from bucket ${bucket}`;
    console.log(message);
    throw new Error(message);
  }
};
