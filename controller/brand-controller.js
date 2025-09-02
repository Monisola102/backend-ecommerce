import asyncHandler from "express-async-handler";
import BrandModel from "../model/brand-model.js";
import { saveImage } from "../utils/saveImage.js";
import cloudinary from "../utils/cloudinary.js";
export const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const brandExists = await BrandModel.findOne({ name });
  if (brandExists) {
    res.status(400);
    throw new Error("Brand already exists");
  }

  let logo, logoPublicId;

  if (req.file) {
    try {
      const result = await saveImage(req.file, "brands");
      logo = result.secure_url;
      logoPublicId = result.public_id;
    } catch (error) {
      res.status(500);
      throw new Error("Logo upload failed");
    }
  }

  const brand = await BrandModel.create({
    name,
    logo,
    logoPublicId,
    createdBy: req.user._id,
  });

  res.status(201).json(brand);
});

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await BrandModel.find({});
  res.json(brands);
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }
  brand.name = req.body.name || brand.name;
  if (req.file) {
    if (brand.logoPublicId) {
      await cloudinary.uploader.destroy(brand.logoPublicId);
    }

    try {
      const result = await saveImage(req.file, "brands");
      brand.logo = result.secure_url;
      brand.logoPublicId = result.public_id;
    } catch (error) {
      res.status(500);
      throw new Error("Logo upload failed");
    }
  }

  const updatedBrand = await brand.save();

  res.status(200).json({
    message: "Brand updated successfully",
    data: updatedBrand,
  });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  await brand.deleteOne();
  res.json({ message: "Brand deleted successfully" });
});
