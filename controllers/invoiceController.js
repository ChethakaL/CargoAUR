// invoiceController.js
const Invoice = require('../models/invoiceModel');

// Calculate the total price based on cargo items and rate
function calculateTotalPrice(cargoItems, rate) {
    let total = 0;
    cargoItems.forEach((cargo) => {
      const { width, height, length } = cargo;
      total += width * height * length * rate;
    });
    return total;
  }
  
  exports.generateInvoice = async (req, res) => {
    try {
      const {
        invoiceID,
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
        return { ...cargo, price: itemPrice };
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