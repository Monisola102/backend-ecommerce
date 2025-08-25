import asyncHandler from "express-async-handler";
import UserModel from "../model/user-model.js";
import Product from "../model/product-model.js";

export const addFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const user = await UserModel.findById(req.user._id);

  // check if this product+size combo already exists
  if (!user.favorites.some(fav => fav.product.toString() === productId && fav.size === (size || ""))) {
    user.favorites.push({ product: productId, size: size || "" });
    await user.save();
  }

  // populate product info for response
  await user.populate("favorites.product");

  res.status(200).json({
    message: "Added to favorites",
    favorites: user.favorites,
  });
});


export const removeFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await UserModel.findById(req.user._id);

  user.favorites = user.favorites.filter(
    (id) => id.toString() !== productId
  );
  await user.save();

  res.status(200).json({
    message: "Removed from favorites",
    favorites: user.favorites,
  });
});


export const getFavorites = asyncHandler(async (req, res) => {
  console.log("Fetching favorites for user:", req.user._id); 
  const user = await UserModel.findById(req.user._id).populate("favorites");

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
