import express from "express";
import dotenv from "dotenv";
import { DataBaseConnection } from "./config/databaseconnection.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import userRoute from "./routes/user-routes.js";
import productRoute from "./routes/product-routes.js";
import adminRoute from "./routes/admin-routes.js";
import cartRoute from "./routes/carts-routes.js";
import orderRoute from "./routes/order-routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000", 
  process.env.FRONTEND_URL?.trim(),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true, 
  })
);
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/admin", adminRoute);
app.use("/carts", cartRoute);
app.use("/order", orderRoute);
app.use(errorHandler);
DataBaseConnection().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT);
  });
});
