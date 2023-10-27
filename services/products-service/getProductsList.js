"use strict";

const { headers } = require("./shared/consts");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });

const productsParams = {
  TableName: "CloudX_Products",
};

function getStockParams(productId) {
  return {
    TableName: "CloudX_Stocks",
    FilterExpression: "product_id = :productId",
    ExpressionAttributeValues: { ":productId": { N: `${productId}` } },
  };
}

module.exports.handler = async (event) => {
  try {
    console.log(event);

    const productsWithStocks = [];

    const productsCommand = new ScanCommand(productsParams);
    const products = (await client.send(productsCommand)).Items.map((product) =>
      unmarshall(product)
    );

    for (const product of products) {
      const stocksCommand = new ScanCommand(getStockParams(product.id));
      const dynamoDbStock = (await client.send(stocksCommand)).Items[0];
      const { count } = unmarshall(dynamoDbStock);

      const wholeProduct = { ...product, count };

      productsWithStocks.push(wholeProduct);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(productsWithStocks),
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
