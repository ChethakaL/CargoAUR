// invoiceModel.js
const mongoose = require('mongoose');

const cargoSchema = new mongoose.Schema({
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceID: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date, // Use Date type for creationDate
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientAddress: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shippingName: {
    type: String,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  cargoItems: [cargoSchema],
  rate: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Other fields...
});

module.exports = mongoose.model('Invoice', invoiceSchema);
