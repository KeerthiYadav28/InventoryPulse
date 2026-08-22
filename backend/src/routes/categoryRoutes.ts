import { Router } from "express";

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
  getCategoryById
);

// Update category
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  updateCategory
);

// Delete category
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteCategory
);

export default router;