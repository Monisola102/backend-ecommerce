
import express from 'express';
import { createOrder, getOrders } from '../controller/order-controller.js';
import { protect } from '../middleware/authMiddleware.js';

const route = express.Router();

route.post('/create-order', protect, createOrder);
route.get('/my-orders', protect, getOrders)
export default route;