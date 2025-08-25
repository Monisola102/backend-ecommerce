import express from "express"
import { RegisterUser, LogInUser ,LogOutUser, handleCookies, readCookies ,getCurrentUser, updateUserProfile, getUserPayments , createPayment, getUserDashboard } from "../controller/user-controller.js";
import { addFavorite, removeFavorite, getFavorites } from "../controller/like-controller.js";
import { protect } from "../middleware/authMiddleware.js";
const route = express.Router();
route.post('/signup', RegisterUser)
route.post('/login', LogInUser )
route.post('/logout', LogOutUser)
route.get('/set-cookie', handleCookies)
route.get('/read-cookie', readCookies)
route.get("/me", protect, getCurrentUser);
route.patch("/update-profile", protect, updateUserProfile);
route.get('/payments', protect, getUserPayments);
route.post('/create-payment', protect, createPayment);
route.get("/dashboard", protect, getUserDashboard);

export default route;


