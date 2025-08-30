import asyncHandler from 'express-async-handler';
import Order from '../model/order-model.js';
import PaymentModel from '../model/payments-model.js';
import Cart from '../model/cart-model.js';

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress, paymentMethod} = req.body;

  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method is required");
  }

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
    status:"pending"
  });

  const payment = await PaymentModel.create({
    user: userId,
    amount: totalPrice,
    paymentMethod,
    order: order._id,
    status: "pending",
  });

  await Cart.findOneAndDelete({ user: userId });

  res.status(201).json({ message: 'Order placed successfully', order, payment });
});

export const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .populate("items.product") 
    .sort({ createdAt: -1 });  

  res.status(200).json(orders);
});
// order-controller.js
export const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  // find the order
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // allow cancel only if still pending
  if (order.status !== "pending") {
    res.status(400);
    throw new Error("Only pending orders can be canceled");
  }

  order.status = "cancelled";
  await order.save();

  // also update payment if it exists
  await PaymentModel.findOneAndUpdate(
    { order: order._id },
    { status: "cancelled" }
  );

  res.status(200).json({ message: "Order cancelled successfully", order });
});
