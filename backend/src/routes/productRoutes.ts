import { Router } from "express";
import { body, param } from "express-validator";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from "../controllers/productController";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { handleValidationErrors } from "../middleware/validationMiddleware";

const router = Router();

// Any authenticated user can view products
router.get("/", authenticateToken, getProducts);

// Get low-stock products
router.get("/low-stock", authenticateToken, getLowStockProducts);

router.get(
  "/:id",
  authenticateToken,
  param("id")
    .isUUID()
    .withMessage("Invalid product ID"),
  handleValidationErrors,
  getProductById
);

// Managers and admins can create/update products
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required"),

  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),

  body("reorder_level")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reorder level must be a non-negative integer"),

  body("unit_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a non-negative number"),

  handleValidationErrors,

  createProduct
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),

  param("id")
    .isUUID()
    .withMessage("Invalid product ID"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("sku")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("SKU cannot be empty"),

  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),

  body("reorder_level")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reorder level must be a non-negative integer"),

  body("unit_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a non-negative number"),

  handleValidationErrors,

  updateProduct
);

// Only admins can delete products
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  param("id")
    .isUUID()
    .withMessage("Invalid product ID"),
  handleValidationErrors,
  deleteProduct
);

export default router;