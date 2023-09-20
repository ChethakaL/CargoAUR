const express = require("express");
const connectDB = require("./db");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require('cors');

// Routes
const userRouter = require("./routes/userRoute");
const invoiceRouter = require('./routes/invoiceRoute');
// Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB()

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.189:4001', 'http://192.168.1.189:3000'],
}));




app.get("/", (req, res) => {
    res.send('API is running');
});

// Routes
app.use('/api/user', userRouter);
app.use('/api/invoice', invoiceRouter);


// Error
app.use(notFound)
app.use(errorHandler)


// Set the listening port
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
