import express from "express";
import {
  createAdminUser,
  LogInAdmin,
  LogOutAdmin,
} from "../controller/admin-controller.js";
const route = express.Router();

route.post("/signAdmin", createAdminUser);
route.post("/login", LogInAdmin);
route.get("/logout", LogOutAdmin);

export default route;
