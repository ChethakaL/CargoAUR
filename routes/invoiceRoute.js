// invoiceRoute.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Generate and save the invoice
router.post('/create', invoiceController.generateInvoice);

// Retrieve cargo item prices
router.get('/cargo-prices', invoiceController.getCargoItemPrices);

// Retrieve invoice details based on the scanned QR code
router.get('/get-invoice/:id', invoiceController.getInvoiceDetails);

// Retrieve Excel Sheet
router.get('/generateExcel/:year/:month', invoiceController.generateExcelReport);

//Total Earnings Route
router.get('/total-earnings', invoiceController.getTotalEarnings);

//Monthly Earnings Route
router.get('/current-month-earnings', invoiceController.getCurrentMonthEarnings);

module.exports = router;
