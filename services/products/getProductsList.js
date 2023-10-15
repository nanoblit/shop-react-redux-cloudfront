"use strict";

const products = require("./shared/products");
const { headers } = require("./shared/consts");

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(products),
  };
};
