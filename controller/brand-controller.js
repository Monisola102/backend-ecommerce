import asyncHandler from "express-async-handler";
import BrandModel from "../model/brand-model.js";

// Create brand
export const createBrand = asyncHandler(async (req, res) => {
  const { name, logo } = req.body;

  const brandExists = await BrandModel.findOne({ name });
  if (brandExists) {
    res.status(400);
    throw new Error("Brand already exists");
  }

  const brand = await BrandModel.create({
    name,
    logo,
    createdBy: req.user._id,
  });

  res.status(201).json(brand);
});

// Get all brands
export const getBrands = asyncHandler(async (req, res) => {
  const brands = await BrandModel.find({});
  res.json(brands);
});

// Update brand
export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  brand.name = req.body.name || brand.name;
  brand.logo = req.body.logo || brand.logo;

  const updatedBrand = await brand.save();
  res.json(updatedBrand);
});

// Delete brand
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  await brand.deleteOne();
  res.json({ message: "Brand deleted successfully" });
});
