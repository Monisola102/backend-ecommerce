import express from "express"

import { createProduct, getProducts,getSingleProduct, updateProduct, deleteProduct, addReview,updateReview, deleteReview, getReviews } from "../controller/product-controller.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const route = express.Router();

route.post('/create', protect, adminOnly, upload.single("image"),createProduct);
route.get("/", getProducts);
route.get("/admin/products", protect, adminOnly, getProducts);
route.get("/:id", getSingleProduct)
route.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
route.delete("/:id", protect, adminOnly, deleteProduct);
route.post("/:id/reviews", protect, addReview);
route.put("/:id/reviews", protect,updateReview);
route.get("/:id/reviews", getReviews); // fetch all reviews for a product
route.delete("/:id/reviews/:reviewId", protect, deleteReview);

export default route;