const express = require("express");
const connectToDb = require("./config/connectToDb");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();

// Connection To Db
connectToDb();

// Init App
const app = express();

// Middlewares
app.use(express.json());

// Security Headers (helmet)
app.use(helmet());

// Prevent Http Param Pollution
app.use(hpp());

// Prevent XSS(Cross Site Scripting) Attacks
app.use(xss());

// Rate Limiting
app.use(rateLimiting({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max:200,
}));

// Cors Policy
app.use(cors({
  origin: ["https://parisian-makeup-inventory-app-api.onrender.com"]
}));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/products", require("./routes/productsRoute"));
app.use("/api/sellingorders", require("./routes/sellingorderRoute"));
app.use("/api/orders", require("./routes/ordersRoute"));
app.use("/api/quantityinstock",require("./routes/quantityinstockRoute"))
app.use("/api/orderitems",require("./routes/orderitemRoute"))
app.use("/api/sellingorderitems", require("./routes/sellingitemRoute"))
// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
