import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import multer from "multer";
import Transaction from "./model/Transaction.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import moment from "moment/moment.js";

import { fileURLToPath } from "url";

// Manually define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allows all origins (*)

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// CSV Upload Endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const results = [];
  
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("headers", (headers) => {
          console.log("CSV Headers:", headers);
        })
        .on("data", (row) => {
            console.log("Raw Row Keys:", Object.keys(row)); // ✅ Log to verify headers

            const normalizeKey = (key) =>
              key.toLowerCase().replace(/\s+/g, "").trim();
          
            const normalizedRow = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[normalizeKey(key)] = row[key].trim();
            });
          
            console.log("Normalized Row:", normalizedRow); // ✅ Log after normalizing
          
  
            const transaction = {
                transactionId: normalizedRow["transactionid"],
                customerName: normalizedRow["customername"],
                product: normalizedRow["product"],
                quantity: parseInt(normalizedRow["quantity"], 10),
                price: normalizedRow["price"],
                date: new Date(moment(normalizedRow["date"], "M/D/YY").toDate()),
              };
            
              console.log("Mapped Transaction:", transaction);
            
              if (
                !transaction.transactionId ||
                !transaction.customerName ||
                !transaction.product ||
                isNaN(transaction.quantity) ||
                !transaction.price ||
                isNaN(transaction.date.getTime()) 
              ) {
                console.error("🚨 Missing or Invalid Data:", transaction);
                return;
              }
            
              results.push(transaction);
            
        })
        .on("end", async () => {
          try {
            if (results.length === 0) {
              console.error("🚨 No valid transactions to insert!");
              return res.status(400).json({ error: "No valid transactions found" });
            }
            
            const result = await Transaction.insertMany(results);
            console.log("✅ Inserted Data:", result);
            res
              .status(201)
              .json({ message: "CSV processed successfully", data: result });
          } catch (error) {
            console.error("🚨 Error inserting data:", error);
            res.status(500).json({ error: "Failed to insert data" });
          }
        });
    } catch (error) {
      console.error("🚨 CSV Parsing Error:", error);
      res.status(500).json({ error: "Error processing CSV" });
    }
  });
  
  

// API Endpoints
app.get("/transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.get("/customers", async (req, res) => {
  const customers = await Transaction.distinct("customerName");
  res.json(customers);
});

app.get("/products", async (req, res) => {
  const products = await Transaction.distinct("product");
  res.json(products);
});

app.get("/total-sales", async (req, res) => {
  const sales = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: { $multiply: ["$quantity", { $toDouble: "$price" }] },
        },
      },
    },
  ]);
  res.json(sales[0]?.totalSales || 0);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
