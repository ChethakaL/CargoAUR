const Invoice = require('../models/invoiceModel');
const ExcelJS = require('exceljs');


// Calculate the total price based on cargo items and rate
function calculateTotalPrice(cargoItems, rate) {
  let total = 0;
  cargoItems.forEach((cargo) => {
    const { width, height, length } = cargo;
    total += width * height * length * rate;
  });
  return parseFloat(total.toFixed(2));
}

exports.generateInvoice = async (req, res) => {
  try {
    // Find the latest invoice to get its invoice number
    const latestInvoice = await Invoice.findOne({}, 'invoiceID')
      .sort({ _id: -1 }) // Sort by _id in descending order to get the latest invoice
      .limit(1); // Retrieve only the latest invoice

    let lastInvoiceNumber = 1; // Default to 1 if no invoices exist yet

    if (latestInvoice) {
      // Extract the last invoice number
      const lastInvoiceID = latestInvoice.invoiceID;
      const lastDigit = parseInt(lastInvoiceID.slice(-1));
      lastInvoiceNumber = (lastDigit + 1) % 10; // Calculate the next digit
    }

    // Now, you have the last invoice number, and you can use it to generate the new invoiceID
    const invoiceID = `INV-${lastInvoiceNumber}`;

    const {
      creationDate,
      clientName,
      clientAddress,
      description,
      shippingName,
      shippingAddress,
      cargoItems,
      rate,
    } = req.body;

    // Calculate the total price based on cargo items and rate
    const totalPrice = calculateTotalPrice(cargoItems, rate);

    // Calculate and set the price for each cargo item
    const cargoItemsWithPrice = cargoItems.map((cargo) => {
      const { width, height, length } = cargo;
      const itemPrice = width * height * length * rate;
      return { ...cargo, price: parseFloat(itemPrice.toFixed(2)) };
    });

    const newInvoice = new Invoice({
      invoiceID,
      creationDate,
      clientName,
      clientAddress,
      description,
      shippingName,
      shippingAddress,
      cargoItems: cargoItemsWithPrice, // Use the modified cargo items with price
      rate,
      price: totalPrice,
      // Other fields...
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getCargoItemPrices = async (req, res) => {
  try {
    const latestInvoice = await Invoice.findOne({}, 'cargoItems')
      .sort({ _id: -1 }) // Sort by _id in descending order to get the latest invoice
      .limit(1); // Retrieve only the latest invoice

    if (!latestInvoice) {
      return res.status(404).json({ message: 'No invoices found' });
    }

    const cargoItemPrices = latestInvoice.cargoItems.map((cargoItem) => ({
      width: cargoItem.width,
      height: cargoItem.height,
      length: cargoItem.length,
      price: cargoItem.price,
    }));

    res.status(200).json(cargoItemPrices);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getInvoiceDetails = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Find the invoice by invoiceId
    const invoice = await Invoice.findOne({ invoiceID: invoiceId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// Creating an Excel Sheet
exports.generateExcelReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    // Fetch invoices for the selected month and year from MongoDB
    const invoices = await Invoice.find({
      creationDate: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
      },
    });

    // Initialize exceljs workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');

    // Define columns
    worksheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 15 },
      { header: 'Invoice ID', key: 'invoiceID', width: 15 },
      { header: 'No. of Items', key: 'numItems', width: 15 },
      { header: 'Total Price', key: 'totalPrice', width: 15 },
    ];

    // Add rows
    invoices.forEach((invoice) => {
      worksheet.addRow({
        clientName: invoice.clientName,
        invoiceID: invoice.invoiceID,
        numItems: invoice.cargoItems.length,
        totalPrice: invoice.price,
      });
    });

    // Generate Excel
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'invoices.xlsx'
    );
    res.status(200).end(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Calculating Total Earnings Function
exports.getTotalEarnings = async (req, res) => {
  try {
    const totalEarnings = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$price"
          }
        }
      }
    ]);
    res.status(200).json(totalEarnings[0]?.total || 0);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

//Calcuating Monthly Earning Function
exports.getCurrentMonthEarnings = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const currentMonthEarnings = await Invoice.aggregate([
      {
        $match: {
          creationDate: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$price"
          }
        }
      }
    ]);
    res.status(200).json(currentMonthEarnings[0]?.total || 0);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};