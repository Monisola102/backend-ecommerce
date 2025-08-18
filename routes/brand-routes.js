import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brand-controller.js";

const router = express.Router();

router.post("/", protect, adminOnly, createBrand); 
router.get("/", getBrands);
router.put("/:id", protect, adminOnly, updateBrand);
router.delete("/:id", protect, adminOnly, deleteBrand);

export default router;
