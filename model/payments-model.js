import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PaymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },

  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },

  amount: { type: Number, required: true },

  method: {
    type: String,
    enum: ["visa", "mastercard", "verve", "paypal", "bank_transfer", "ussd"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});

const PaymentModel = model("Payment", PaymentSchema);

export default PaymentModel;
