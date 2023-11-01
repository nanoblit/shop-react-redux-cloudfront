"use strict";

const { headers } = require("./shared/consts");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

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
  try {
    console.log(event);

    const newProduct = event.body;

    const isProductValid = validateProduct(newProduct);

    if (!isProductValid) {
      console.error(newProduct);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "The sent product is invalid" }),
      };
    }

    const { title, description, price, count } = newProduct;

    const productId = getRandomNumber();

    const productTableItem = { id: productId, title, description, price };
    const stockTableItem = {
      id: getRandomNumber(),
      product_id: productId,
      count,
    };

    await docClient.send(getProductPutCommand(productTableItem));
    await docClient.send(getStockPutCommand(stockTableItem));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ ...productTableItem, count }),
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
