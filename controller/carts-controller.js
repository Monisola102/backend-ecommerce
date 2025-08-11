import asyncHandler from "express-async-handler";
import CartModel from "../model/cart-model.js";
import ProductsModel from "../model/product-model.js";

function getCartSummary(items) {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );
  return { totalQuantity, totalPrice };
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (cart) {
    await cart.populate("items.product");
    const { totalQuantity, totalPrice } = getCartSummary(cart.items);
    res.json({
      updatedCart: cart.items,
      totalQuantity,
      totalPrice,
    });
  } else {
    res.json({ updatedCart: [], totalQuantity: 0, totalPrice: 0 });
  }
});
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size } = req.body;

  if (!productId || !quantity || !size) {
    return res
      .status(400)
      .json({ message: "Product ID, size, and quantity are required" });
  }

  const product = await ProductsModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const selectedSize = product.sizes.find((s) => s.size === size);
  if (!selectedSize) {
    return res
      .status(400)
      .json({ message: "Selected size not available for this product" });
  }

  if (selectedSize.stock < quantity) {
    return res
      .status(400)
      .json({ message: "Insufficient stock for selected size" });
  }

  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    cart = new CartModel({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, size });
  }

  await cart.save();
  await cart.populate("items.product");

  const { totalQuantity, totalPrice } = getCartSummary(cart.items);
  res.status(200).json({
    message: "Item added to cart",
    updatedCart: cart.items,
    totalQuantity,
    totalPrice,
  });
});
export const subtractFromCart = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;

  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const index = cart.items.findIndex(
    (i) => i.product.toString() === productId && i.size === size
  );

  if (index > -1) {
    cart.items[index].quantity -= 1;

    if (cart.items[index].quantity <= 0) {
      cart.items.splice(index, 1);
    }

    await cart.save();
    await cart.populate("items.product");

    const { totalQuantity, totalPrice } = getCartSummary(cart.items);
    return res.status(200).json({
      message: "Item subtracted from cart",
      updatedCart: cart.items,
      totalQuantity,
      totalPrice,
    });
  } else {
    return res.status(404).json({ message: "Item not found in cart" });
  }
});

export const deleteFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size } = req.query;

  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    (i) => !(i.product.toString() === productId && i.size === size)
  );

  await cart.save();
  await cart.populate("items.product");

  const { totalQuantity, totalPrice } = getCartSummary(cart.items);
  res.status(200).json({
    message: "Item removed from cart",
    updatedCart: cart.items,
    totalQuantity,
    totalPrice,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const clearedCart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { new: true }
  ).populate("items.product");

  res.status(200).json({
    message: "Cart cleared",
    updatedCart: [],
    totalQuantity: 0,
    totalPrice: 0,
  });
});
