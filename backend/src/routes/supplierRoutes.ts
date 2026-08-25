import { Router } from "express";

import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";

const router = Router();

// Create supplier
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  createSupplier
);

// Get all suppliers
router.get(
  "/",
  authenticateToken,
  getSuppliers
);

// Get supplier by ID
router.get(
  "/:id",
  authenticateToken,
  getSupplierById
);

// Update supplier
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  updateSupplier
);

// Delete supplier
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteSupplier
);

export default router;