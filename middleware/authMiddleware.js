
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel from "../model/user-model.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});


export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Admin access only");
  }
};


