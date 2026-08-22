import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";

const router = Router();

// Any authenticated user can view products
router.get("/", authenticateToken, getProducts);

router.get("/:id", authenticateToken, getProductById);

// Managers and admins can create/update products
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  createProduct
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  updateProduct
);

// Only admins can delete products
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteProduct
);

export default router;