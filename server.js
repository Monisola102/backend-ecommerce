import express from "express";
import dotenv from "dotenv";
import { DataBaseConnection } from "./config/databaseconnection.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import userRoute from "./routes/user-routes.js";
import productRoute from "./routes/product-routes.js";
import adminRoute from "./routes/admin-routes.js";
import cartRoute from "./routes/carts-routes.js";
import orderRoute from "./routes/order-routes.js";
import brandRoute from "./routes/brand-routes.js";
import favRoute from "./routes/fav-routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
console.log("FRONTEND_URL value:", JSON.stringify(process.env.FRONTEND_URL)); 

app.use(cookieParser());
const FRONTEND_URL = process.env.FRONTEND_URL; 
app.use(
  cors({
    origin:FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);
app.options("*", cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/admin", adminRoute);
app.use("/carts", cartRoute);
app.use("/order", orderRoute);
app.use("/brands", brandRoute);
app.use("/favorite", favRoute);

app.use(errorHandler);
DataBaseConnection().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Listening on port", process.env.PORT || 5000);
  });
});
