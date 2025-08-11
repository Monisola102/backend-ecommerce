import express from "express"

import { createProduct, getProducts,getSingleProduct, updateProduct, deleteProduct } from "../controller/product-controller.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const route = express.Router();

route.post('/create', protect, adminOnly, upload.single("image"),createProduct);
route.get("/", getProducts);
route.get("/admin/products", protect, adminOnly, getProducts);
route.get("/:id", getSingleProduct)
route.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
route.delete("/:id", protect, adminOnly, deleteProduct);
export default route;