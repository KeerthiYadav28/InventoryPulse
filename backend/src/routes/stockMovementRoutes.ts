import { Router } from "express";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middleware/validationMiddleware";
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

  body("product_id")
    .isUUID()
    .withMessage("Invalid product ID"),

  body("type")
    .isIn(["IN", "OUT", "ADJUSTMENT"])
    .withMessage("Invalid movement type"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string"),

  handleValidationErrors,

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

  param("id")
    .isUUID()
    .withMessage("Invalid stock movement ID"),

  handleValidationErrors,

  getStockMovementById
);

export default router;