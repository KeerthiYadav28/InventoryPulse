import { Router, Response } from "express";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

export default router;