"use strict";

const { headers } = require("./shared/consts");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });

function getProductScanCommand(productId) {
  return new ScanCommand({
    TableName: "CloudX_Products",
    FilterExpression: "id = :productId",
    ExpressionAttributeValues: { ":productId": { N: `${productId}` } },
  });
}

function getStockScanCommand(productId) {
  return new ScanCommand({
    TableName: "CloudX_Stocks",
    FilterExpression: "product_id = :productId",
    ExpressionAttributeValues: { ":productId": { N: `${productId}` } },
  });
}

module.exports.handler = async (event) => {
  try {
    console.log(event);

    const idOfProductToReturn = event.pathParameters.productId;

    const productsCommand = getProductScanCommand(idOfProductToReturn);
    const dynamoDbProducts = (await client.send(productsCommand)).Items;

    if (!dynamoDbProducts) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const product = unmarshall(dynamoDbProducts[0]);

    const stocksCommand = getStockScanCommand(idOfProductToReturn);
    const dynamoDbStock = (await client.send(stocksCommand)).Items[0];

    const { count } = unmarshall(dynamoDbStock);

    const wholeProduct = { ...product, count };

    if (product) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(wholeProduct),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Server error" }),
    };
  }
};
