import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BrandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
    },
    logo: {
      type: String, 
      required: false,
    },
    logoPublicId: {
      type: String, 
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
  },
  { timestamps: true }
);

const BrandModel = model("Brand", BrandSchema);

export default BrandModel;
