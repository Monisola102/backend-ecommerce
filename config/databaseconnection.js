import mongoose from "mongoose";

export async function DataBaseConnection() {
  try {
    await mongoose.connect(process.env.MONG_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
}
