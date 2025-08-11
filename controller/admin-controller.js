import UserModel from "../model/user-model.js";
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
export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });
  if (!admin) {
    res.status(409);
    throw new Error("Invalid admin data");
  }

  const token = createToken(admin._id, admin.role);
  setTokenCookie(res, token);
  res.status(201).json({
    message: "Admin user created",
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
    token,
  });
});
export const LogInAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const registeredAdmin = await UserModel.findOne({ email });
  if (!registeredAdmin) {
    res.status(404);

    throw new Error("User does not exist");
  }
  const isMatch = await bcrypt.compare(password, registeredAdmin.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid password");
  }
  const token = createToken(registeredAdmin._id, registeredAdmin.role);
  setTokenCookie(res, token);
  res.status(200).json({
    message: "Logged in successfully",
    data: {
      id: registeredAdmin._id,
      name: registeredAdmin.name,
      email: registeredAdmin.email,
      role: registeredAdmin.role,
    },
    
    token
  });
});
export const LogOutAdmin = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, 
  });

  res.status(200).json({ message: "Logged out successfully" });
});