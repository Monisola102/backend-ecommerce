import asyncHandler from "express-async-handler";
import FavModel from "../model/fav-model.js";
export const addFavorite = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;

  const exists = await FavModel.findOne({
    user: req.user._id,
    product: productId,
    size: size || "",
  });

  if (exists) {
    return res.status(200).json({
      message: "Already in favorites",
      favorite: exists,
    });
  }

  const favorite = await FavModel.create({
    user: req.user._id,
    product: productId,
    size: size || "",
  });

  await favorite.populate("product");

  res.status(201).json({
    message: "Added to favorites",
    favorite,
  });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  console.log('params', req.params, 'query', req.query);
  const { productId} = req.params;
const {size} = req.query;

  const deleted = await FavModel.findOneAndDelete({
    user: req.user._id,
    product: productId,
    size: size || "",
  });

if (!deleted) {
    return res.status(404).json({ message: "Favorite not found" });
  }

  res.status(200).json({
    message: "Removed from favorites",
    favorite: deleted,
  });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await FavModel.find({ user: req.user._id }).populate({
    path: "product",
    populate: { path: "brand", select: "name" }, 
  });

  res.status(200).json({
    message: "Fetched favorites",
    favorites: favorites || [],
  });
});

