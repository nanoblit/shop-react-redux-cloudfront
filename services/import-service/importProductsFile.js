const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { headers } = require("./shared/consts");

const s3Client = new S3Client({ region: "eu-north-1" });

module.exports.handler = async (event) => {
  const fileName = event.queryStringParameters.name;

  const params = {
    Bucket: "import-my-store-app",
    Key: `uploaded/${fileName}`,
    ContentType: "text/csv",
  };

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(params),
      {
        expiresIn: 3600,
      }
    );

    console.log(signedUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
      headers,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Server error" }),
    };
  }
};
