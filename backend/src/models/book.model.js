const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  username: String,
  password: String,
});

const Book = mongoose.model("Book", bookSchema, "books");

module.exports = Book;
