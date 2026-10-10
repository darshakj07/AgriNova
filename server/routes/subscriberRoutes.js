import express from 'express';
import { subscribe, getSubscribers, broadcastEmail } from '../controllers/subscriberController.js';
// Note: Assuming there's a middleware to protect admin routes, but since admin verification is complex, 
// for this implementation we assume standard auth/admin protection if available or leave it standard.

const router = express.Router();

router.post('/', subscribe);
router.get('/', getSubscribers); // In production, add auth & admin middleware
router.post('/broadcast', broadcastEmail); // In production, add auth & admin middleware

export default router;
