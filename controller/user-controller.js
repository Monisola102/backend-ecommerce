import UserModel from "../model/user-model.js";
import PaymentModel from "../model/payments-model.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const maxAge = 30 * 24 * 60 * 60; 

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: maxAge * 1000, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};


export const RegisterUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = createToken(newUser._id, newUser.role);
  setTokenCookie(res, token);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});


export const LogInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = createToken(user._id, user.role);
  setTokenCookie(res, token);

  res.status(200).json({
    message: "Logged in successfully",
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const LogOutUser = asyncHandler(async (req, res) => {
   res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), 
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
 const token = createToken(user._id, user.role);
  setTokenCookie(res, token);

  res.status(200).json({
    message: "user fetched successfully",
   data: { id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    shippingAddress: user.shippingAddress,
   }
  });
});

export const handleCookies = asyncHandler(async (req, res) => {
  res.cookie("newUser", false);
  res.cookie("isEmployee", true, {
    maxAge: 1000 * maxAge,
    httpOnly: true,
  });

  res.status(200).json({ message: "You got the cookies" });
});

export const readCookies = asyncHandler(async (req, res) => {
  res.status(200).json({ cookies: req.cookies });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, phone, shippingAddress } = req.body;

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.shippingAddress = shippingAddress || user.shippingAddress;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "Profile updated",
    user: {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      shippingAddress: updatedUser.shippingAddress,
      role: updatedUser.role
    }
  });
});
export const getUserPayments = asyncHandler(async (req, res) => {
  const payments = await PaymentModel.find({ user: req.user._id });
  res.status(200).json({ payments });
});
export const createPayment = asyncHandler(async (req, res) => {
  const { amount, method, status } = req.body;

  if (!amount || !method) {
    res.status(400);
    throw new Error("Amount and payment method are required");
  }

  const payment = await PaymentModel.create({
    user: req.user._id,
    amount,
    method,
    status: status || "pending"
  });

  res.status(201).json({
    message: "Payment created successfully",
    payment,
  });
});
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await UserModel.findById(userId).select("name email shippingAddress favorites");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }


  const orders = await OrderModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(3);

  
  const cart = await CartModel.findOne({ user: userId });
  const cartCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const favoritesCount = user.favorites?.length || 0;

  res.status(200).json({
    name: user.name,
    email: user.email,
    shippingAddress: user.shippingAddress || null,
    recentOrders: orders.map((order) => ({
      _id: order._id,
      total: order.totalPrice,
      status: order.status || "pending",
      createdAt: order.createdAt,
    })),
    favoritesCount,
    cartCount,
  });
});

export const forgotPassword = asyncHandler(async(req,res)  => {
  const { email} = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }
const token = createToken(user._id, user.role);
  setTokenCookie(res, token);






})