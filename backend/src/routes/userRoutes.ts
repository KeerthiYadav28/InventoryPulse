import { Router, Response } from "express";
import {
  authenticateToken,
  authorizeRoles,
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
router.get("/admin", authenticateToken, authorizeRoles("admin"), (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    user: req.user,
  });
});

export default router;