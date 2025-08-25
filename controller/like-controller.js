import asyncHandler from "express-async-handler";
import UserModel from "../model/user-model.js";

// Add favorite
export const addFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const user = await UserModel.findById(req.user._id);

  if (!user.favorites) user.favorites = [];

  // Normalize existing favorites (convert strings to objects)
  const normalizedFavorites = user.favorites.map(fav =>
    typeof fav === "string" ? { product: fav, size: "" } : fav
  );

  // Prevent duplicate product+size
  const exists = normalizedFavorites.some(
    fav => fav.product.toString() === productId && fav.size === (size || "")
  );

  if (!exists) {
    normalizedFavorites.push({ product: productId, size: size || "" });
  }

  user.favorites = normalizedFavorites;
  await user.save();

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

  if (!user.favorites) user.favorites = [];

  // Remove by productId and optional size
  user.favorites = user.favorites.filter(
    fav =>
      !(fav.product.toString() === productId && fav.size === (size || ""))
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
  const user = await UserModel.findById(req.user._id).populate(
    "favorites.product"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "Fetched favorites",
    favorites: user.favorites,
  });
});
