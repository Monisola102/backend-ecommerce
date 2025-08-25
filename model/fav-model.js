import mongoose from "mongoose";

const { Schema, model } = mongoose;

const FavoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    size: { type: String, default: "" },
  },
  { timestamps: true }
);

const FavModel = model("Favorite", FavoriteSchema);
export default FavModel;