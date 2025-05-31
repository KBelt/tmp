const { getDb } = require("../database/database");

class Item {
  constructor({ name, message }) {
    this.name = name;
    this.message = message;
  }

  static async find(query) {
    const db = getDb();
    return db.collection("item").find(query).toArray();
  }
}

module.exports = Item;
