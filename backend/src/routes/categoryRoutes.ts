import { Router } from "express";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middleware/validationMiddleware";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";

const router = Router();

// Create category
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required"),
  handleValidationErrors,
  createCategory
);

// Get all categories
router.get(
  "/",
  authenticateToken,
  getCategories
);

// Get category by ID
router.get(
  "/:id",
  authenticateToken,
  param("id")
    .isUUID()
    .withMessage("Invalid category ID"),
  handleValidationErrors,
  getCategoryById
);

// Update category
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  param("id")
    .isUUID()
    .withMessage("Invalid category ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name can not be empty"),
  handleValidationErrors,
  updateCategory
);

// Delete category
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  param("id")
    .isUUID()
    .withMessage("Invalid category ID"),
  handleValidationErrors,
  deleteCategory
);

export default router;