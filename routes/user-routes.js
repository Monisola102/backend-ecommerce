import express from "express"
import { RegisterUser, LogInUser } from "../controller/user-controller.js";

const route = express.Router();
route.post('/register', RegisterUser)
route.post('/log-in', LogInUser )

export default route;


