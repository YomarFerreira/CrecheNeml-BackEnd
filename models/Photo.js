const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
    name: { type: String, required: false },
    base64Data: { type: String, required: true },
});

module.exports = mongoose.model("Photo", PhotoSchema);