const { MongoClient } = require("mongodb");

const host = process.env.MONGO_HOST || "localhost";
const port = process.env.MONGO_PORT || "27017";
const dbName = process.env.DB_ITEM_NAME || "item";
const username = process.env.MONGO_USERNAME || "root";
const password = process.env.MONGO_PASSWORD || "password";

// Build a connection URI based on whether authentication is provided
let uri;
if (username && password) {
  // Use authentication
  uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`;
} else {
  // No authentication
  uri = `mongodb://${host}:${port}/${dbName}`;
}

let db;
let client;

async function connect() {
  console.log("Connecting to database");

  client = new MongoClient(uri);

  await client.connect();
  db = client.db(dbName);
  console.log("Database connected");
}

function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connect() first.");
  }
  return db;
}

async function disconnect() {
  if (client) {
    await client.close();
    console.log("Database connection closed");
  }
}

module.exports = { connect, getDb, disconnect };
