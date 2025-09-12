import ProductsModel from "../model/product-model.js";
import BrandModel from "../model/brand-model.js";
import asyncHandler from "express-async-handler";
import { saveImage } from "../utils/saveImage.js";
import cloudinary from "../utils/cloudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, price, category, inStock, sizes } =
    req.body;

  if (!sizes) {
    res.status(400);
    throw new Error("Sizes are required");
  }

  let parsedSizes;
  try {
    parsedSizes = JSON.parse(sizes);
  } catch {
    res.status(400);
    throw new Error("Invalid sizes format. Must be a valid JSON array.");
  }
  const brandDoc = await BrandModel.findOne({ name: brand });
  if (!brandDoc) {
    res.status(400);
    throw new Error("Brand does not exist. Please create it first.");
  }

  let image, imagePublicId;

  if (req.file) {
    try {
      const result = await saveImage(req.file, "products");
      image = result.secure_url;
      imagePublicId = result.public_id;
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed");
    }
  }

  const created = await ProductsModel.create({
    name,
    brand: brandDoc._id,
    price,
    description,
    image,
    imagePublicId,
    category: category.toLowerCase(),
    inStock,
    sizes: parsedSizes,
    admin: req.user._id,
  });

  if (!created) {
    res.status(409);
    throw new Error("Invalid product data");
  }

  res.status(201).json({
    message: "New product created successfully",
    data: created,
  });
});

export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim() || "";
  const category = req.query.category?.trim();
  const brand = req.query.brand?.trim();
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const sort = req.query.sort || "createdAt"; // default sort by newest
  const order = req.query.order === "asc" ? 1 : -1; // default descending

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: "i" };
  }

  if (brand) {
    const brandDoc = await BrandModel.findOne({ name: brand });
    if (brandDoc) {
      query.brand = brandDoc._id;
    }
  }
  console.log("QUERY:", query);
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const total = await ProductsModel.countDocuments(query);
  const products = await ProductsModel.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ [sort]: order })
    .populate("brand", "name");

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});
export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await ProductsModel.findById(req.params.id).populate(
    "brand",
    "name"
  );
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const existingProduct = await ProductsModel.findById(id);
  if (!existingProduct) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (req.file) {
    if (existingProduct.imagePublicId) {
      await cloudinary.uploader.destroy(existingProduct.imagePublicId);
    }
    const result = await saveImage(req.file, "products");
    updates.image = result.secure_url;
    updates.imagePublicId = result.public_id;
  }

  const product = await ProductsModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Product updated successfully",
    data: product,
  });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await ProductsModel.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.imagePublicId) {
    await cloudinary.uploader.destroy(product.imagePublicId);
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product and image deleted successfully",
    id: product._id,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await ProductsModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  product.reviews.push({
    user: req.user._id,
    rating: Number(rating),
    comment,
  });

  product.ratingCount = product.reviews.length;
  product.ratingAverage =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();
 await product.populate("reviews.user", "_id name");
  res.status(201).json({
    success: true,
    message: "Review added successfully",
    data: product.reviews,
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { id: productId, reviewId } = req.params;

  const product = await ProductsModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to edit this review");
  }

  review.rating = rating ?? review.rating;
  review.comment = comment ?? review.comment;
  product.ratingCount = product.reviews.length;
  product.ratingAverage =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();
 await product.populate("reviews.user", "_id name");
  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: product.reviews,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;
  const product = await ProductsModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  if (
    req.user.role !== "admin" &&
    review.user.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  product.reviews.pull(reviewId);

  product.ratingCount = product.reviews.length;
  product.ratingAverage =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
      : 0;

  await product.save();
 await product.populate("reviews.user", "_id name");
  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: product.reviews,
  });
});

export const getReviews = asyncHandler(async (req, res) => {
  const product = await ProductsModel.findById(req.params.id).populate(
    "reviews.user",
    "_id name"
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    data: product.reviews,
  });
});
