import { Router } from "express";
import { createStockMovement, getStockMovements, getStockMovementById } from "../controllers/stockMovementController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";

const router = Router();

// Create stock movement
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  createStockMovement
);

// Get stock movements
router.get(
  "/",
  authenticateToken,
  getStockMovements
);

// Get stock movement by ID
router.get(
  "/:id",
  authenticateToken,
  getStockMovementById
);

export default router;