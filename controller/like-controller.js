import asyncHandler from "express-async-handler";
import UserModel from "../model/user-model.js";
import Product from "../model/product-model.js";

export const addFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body; // include size if provided
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if product is already in favorites with the same size
  const alreadyFavorite = user.favorites.some(
    (fav) => fav.product.toString() === productId && fav.size === size
  );

  if (!alreadyFavorite) {
    user.favorites.push({ product: productId, size });
    await user.save();
  }

  res.status(200).json({
    message: "Added to favorites",
    favorites: user.favorites,
  });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // If size is passed, remove only that size; otherwise remove all sizes of that product
  user.favorites = user.favorites.filter(
    (fav) =>
      !(fav.product.toString() === productId && (!size || fav.size === size))
  );

  await user.save();

  res.status(200).json({
    message: "Removed from favorites",
    favorites: user.favorites,
  });
});

export const getFavorites = asyncHandler(async (req, res) => {
  console.log("Fetching favorites for user:", req.user._id);
  const user = await UserModel.findById(req.user._id).populate(
    "favorites.product"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  console.log("Favorites returned:", user.favorites);

  res.status(200).json({
    message: "Fetched favorites",
    favorites: user.favorites,
  });
});
