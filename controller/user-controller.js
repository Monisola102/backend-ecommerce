import UserModel from "../model/user-model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function RegisterUser(req, res) {
  const { name, email, password } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Name is required",
    });
  }
  if (!email) {
    return res.status(400).json({
      message: "email is required",
    });
  }       
  if (!password) {
    return res.status(400).json({
      message: "password is required",
    });
  }
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "Email already exist",
    });
  }
  try {
    const saltRounds = 10;
    const encryptPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await UserModel.create({
      ...req.body,
      password: encryptPassword,
    });
    const token = jwt.sign({ newUser }, "secret", { expiresIn: "1h" });

    return res.status(200).json({
      message: "new user created successfully",
      data: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "an error occured",
      error: error.message,
    });
  }
}
export async function LogInUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const registeredUser = await UserModel.findOne({ email });
    if (!registeredUser) {
      return res.status(200).json({
        message: "User does not exist",
      });
    }
    const match = await bcrypt.compare(password, registeredUser.password);
    if (!match) {
      return res.status(200).json({
        message: "password does not match",
      });
    }
    const token = jwt.sign({ registeredUser }, "secret", { expiresIn: "1h" });
    return res.status(200).json({
      message: "logged in successfully",
      data: registeredUser,
      token,
    });
  } catch (error) {
    return res.status(400).json({
      message: "an error occured",
      error: error.message,
    });
  }
}
