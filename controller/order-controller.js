import asyncHandler from 'express-async-handler';
import Order from '../model/order-model.js';
import Product from '../model/product-model.js';
import Cart from '../model/cart-model.js';

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }


  const totalPrice = cart.items.reduce((acc, item) => {
    return acc + item.quantity * item.product.price;
  }, 0);

  const order = await Order.create({
    user: userId,
    items: cart.items.map(item => ({
      product: item.product._id,
      size: item.size,
      quantity: item.quantity,
      priceAtOrderTime: item.product.price,
    })),
    shippingAddress,
    totalPrice,
  });

  
  await Cart.findOneAndDelete({ user: userId });

  res.status(201).json({ message: 'Order placed successfully', order });
});

export const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .populate("items.product") 
    .sort({ createdAt: -1 });  

  res.status(200).json(orders);
});
