require("dotenv").config();
const aws = require("aws-sdk");

aws.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const docClient = new aws.DynamoDB.DocumentClient();

const productsTableName = "CloudX_Products";
const stocksTableName = "CloudX_Stocks";

const products = [
  {
    description: "Short Product Description1",
    id: 2347,
    price: 24,
    title: "ProductOne",
  },
  {
    description: "Short Product Description7",
    id: 3450,
    price: 15,
    title: "ProductTitle",
  },
  {
    description: "Short Product Description2",
    id: 8037,
    price: 23,
    title: "Product",
  },
  {
    description: "Short Product Description4",
    id: 4389,
    price: 15,
    title: "ProductTest",
  },
  {
    description: "Short Product Descriptio1",
    id: 8934,
    price: 23,
    title: "Product2",
  },
  {
    description: "Short Product Description7",
    id: 7859,
    price: 15,
    title: "ProductName",
  },
];

const stocks = [
  {
    id: 2085,
    product_id: 2347,
    count: 3,
  },
  {
    id: 8127,
    product_id: 3450,
    count: 2,
  },
  {
    id: 2089,
    product_id: 8037,
    count: 0,
  },
  {
    id: 8092,
    product_id: 4389,
    count: 10,
  },
  {
    id: 2094,
    product_id: 8934,
    count: 8,
  },
  {
    id: 3975,
    product_id: 7859,
    count: 1,
  },
];

const fillTable = (tableName, items) => {
  items.forEach((product) => {
    const params = {
      TableName: tableName,
      Item: product,
    };

    docClient.put(params, (err, data) => {
      if (err) {
        console.error("Error:", err);
      } else {
        console.log("Successfully added item:", params.Item.id);
      }
    });
  });
};

fillTable(productsTableName, products);
fillTable(stocksTableName, stocks);
