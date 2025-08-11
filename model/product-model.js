import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    brand: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    image: {
      type: String, 
    },
    imagePublicId: {
      type: String, 
    },
    category: {
      type: String,
      enum: [
        "women",
        "men",
        "kids",
        "sale",
        "new",
        "trends",
        "accessories",
        "spring",
        "recommended",
      ],
      required: [true, "Product category is required"],
    },
    sizes: [
      {
        size: {
          type: String,
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProductsModel = model("Product", ProductSchema);

export default ProductsModel;
