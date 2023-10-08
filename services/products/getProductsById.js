"use strict";

const products = require("./shared/products");
const { headers } = require("./shared/consts");

module.exports.handler = async (event) => {
  const idOfProductToReturn = event.pathParameters.productId;

  const product = products.find(({ id }) => id === idOfProductToReturn);

  if (product) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ message: "Product not found" }),
  };
};
