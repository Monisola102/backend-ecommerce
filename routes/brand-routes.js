import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createBrand, updateBrand, getBrands, deleteBrand } from "../controller/brand-controller.js";
import upload from "../middleware/uploadMiddleware.js";

const route = express.Router();

route.post("/createbrand", protect, adminOnly, upload.single("logo"),createBrand); 
route.get("/", getBrands);
route.put("/:id", protect, adminOnly, upload.single("logo"), updateBrand);
route.delete("/:id", protect, adminOnly, deleteBrand);

export default route;
