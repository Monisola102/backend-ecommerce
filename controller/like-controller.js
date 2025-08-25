import asyncHandler from "express-async-handler";
import UserModel from "../model/user-model.js";
import Product from "../model/product-model.js";

// Add favorite
export const addFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const user = await UserModel.findById(req.user._id);

  if (!user) throw new Error("User not found");

  // normalize old string favorites
  user.favorites = user.favorites.map(fav => {
    if (typeof fav === "string") return { product: fav, size: "" };
    return fav;
  });

  // check if product+size already exists
  const exists = user.favorites.some(
    fav => fav.product.toString() === productId && fav.size === (size || "")
  );

  if (!exists) {
    user.favorites.push({ product: productId, size: size || "" });
    await user.save();
  }

  await user.populate("favorites.product");

  res.status(200).json({
    message: "Added to favorites",
    favorites: user.favorites,
  });
});

// Remove favorite
export const removeFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const user = await UserModel.findById(req.user._id);

  if (!user) throw new Error("User not found");

  // normalize old string favorites
  user.favorites = user.favorites.map(fav => {
    if (typeof fav === "string") return { product: fav, size: "" };
    return fav;
  });

  user.favorites = user.favorites.filter(
    fav => !(fav.product.toString() === productId && fav.size === (size || ""))
  );

  await user.save();
  await user.populate("favorites.product");

  res.status(200).json({
    message: "Removed from favorites",
    favorites: user.favorites,
  });
});

// Get favorites
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).populate("favorites.product");

  if (!user) throw new Error("User not found");

  // normalize old string favorites
  user.favorites = user.favorites.map(fav => {
    if (typeof fav === "string") return { product: fav, size: "" };
    return fav;
  });

  res.status(200).json({
    message: "Fetched favorites",
    favorites: user.favorites,
  });
});
