const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "eu-north-1" });
const snsClient = new SNSClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

function getProductPutCommand(productData) {
  return new PutCommand({
    TableName: "CloudX_Products",
    Item: productData,
  });
}

function getStockPutCommand(stockData) {
  return new PutCommand({
    TableName: "CloudX_Stocks",
    Item: stockData,
  });
}

function getPublishCommand(message) {
  return new PublishCommand({
    Message: message,
    TopicArn:
      "arn:aws:sns:eu-north-1:565131416501:products-dev-CreateProductTopic-egh392aL52iF",
  });
}

function validateProduct(product) {
  return Object.entries(product).every(([key, value]) => {
    switch (key) {
      case "title":
        return typeof value === "string";
      case "description":
        return typeof value === "string";
      case "price":
        return Number.isInteger(value) && value >= 0;
      case "count":
        return Number.isInteger(value) && value >= 0;
      default:
        return false;
    }
  });
}

function getRandomNumber() {
  return Math.floor(Math.random() * 1000000000);
}

module.exports.handler = async (event) => {
  const productTitles = [];
  const batchItemFailures = [];
  const sqsBatchResponse = {};
  const productTableItems = [];
  const stockTableItems = [];

  for (record of event.Records) {
    try {
      let product = JSON.parse(record.body);

      product = {
        ...product,
        price: Number(product.price),
        count: Number(product.count),
      };

      if (!validateProduct(product)) {
        throw new Error("Product is incorrect");
      }

      if (productTitles.includes(product.title)) {
        continue;
      }

      const { title, description, price, count } = product;

      const productId = getRandomNumber();

      const productTableItem = { id: productId, title, description, price };
      const stockTableItem = {
        id: getRandomNumber(),
        product_id: productId,
        count,
      };

      await docClient.send(getProductPutCommand(productTableItem));
      await docClient.send(getStockPutCommand(stockTableItem));

      productTableItems.push(productTableItem);
      stockTableItems.push(stockTableItem);
    } catch (error) {
      batchItemFailures.push({ itemIdentifier: record.messageId });
      console.error(error);
      console.log("Body:");
      console.log(record.body);
    }
  }

  const message = `Added items to Product Table:\n${JSON.stringify(
    productTableItems
  )}\nAdded items to Stock Table:\n${JSON.stringify(stockTableItems)}`;

  try {
    await snsClient.send(getPublishCommand(message));
  } catch (error) {
    console.error(error);
    throw error;
  }

  sqsBatchResponse.batchItemFailures = batchItemFailures;

  return sqsBatchResponse;
};
