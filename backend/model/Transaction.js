import mongoose from "mongoose";

// Define Transaction Schema

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String },
    customerName: { type: String, required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: String, required: true }, // Store as string if currency format
    date: { type: Date, required: true }
});


export default mongoose.model('Transaction', transactionSchema);;
