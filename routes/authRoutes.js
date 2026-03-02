import express from "express";
const router = express.Router();
import { requestOtp, verifyOtp, getMe, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

router.get("/me", protect, getMe);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp) ;
router.put('/update-profile', protect, updateProfile); 

export default router;