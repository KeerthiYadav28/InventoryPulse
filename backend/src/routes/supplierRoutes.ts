import { Router } from "express";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middleware/validationMiddleware";

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
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Supplier name is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone can not be empty"),
  handleValidationErrors,
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
  param("id")
    .isUUID()
    .withMessage("Invalid supplier ID"),
  handleValidationErrors,
  getSupplierById
);

// Update supplier
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  param("id")
    .isUUID()
    .withMessage("Invalid supplier ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Supplier name can not be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),
  handleValidationErrors,
  updateSupplier
);

// Delete supplier
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  param("id")
    .isUUID()
    .withMessage("Invalid supplier ID"),
  handleValidationErrors,
  deleteSupplier
);

export default router;