import express from "express";
import { addFavorite, removeFavorite, getFavorites } from "../controller/like-controller.js";
import { protect } from "../middleware/authMiddleware.js";
const route = express.Router();
route.get("/favorites", protect, getFavorites);
route.post("/add-favorite", protect, addFavorite);
route.delete("/remove-favorite", protect, removeFavorite);
export default route;
