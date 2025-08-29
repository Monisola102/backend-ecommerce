import express from "express";
import { getCart, addToCart, subtractFromCart, deleteFromCart, clearCart } from "../controller/carts-controller.js";
import { protect } from "../middleware/authMiddleware.js";

const route = express.Router();

route.get("/getCart", protect, getCart);
route.post("/add", protect, addToCart);
route.patch("/subtract", protect, subtractFromCart);
route.delete("/clearCart", protect, clearCart);
route.delete("/delete/:productId", protect, deleteFromCart);

export default route;
