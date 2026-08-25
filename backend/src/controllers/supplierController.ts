import { Request, Response } from "express";
import { pool } from "../config/database";

// CREATE SUPPLIER
export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, address } = req.body;

    const result = await pool.query(
      `
      INSERT INTO suppliers (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, phone, address]
    );

    res.status(201).json({
      message: "Supplier created successfully",
      supplier: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating supplier:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL SUPPLIERS
export const getSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM suppliers
      ORDER BY created_at DESC
      `
    );

    res.status(200).json({
      suppliers: result.rows,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET SUPPLIER BY ID
export const getSupplierById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM suppliers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      supplier: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE SUPPLIER
export const updateSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const result = await pool.query(
      `
      UPDATE suppliers
      SET
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [name, email, phone, address, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating supplier:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE SUPPLIER
export const deleteSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM suppliers
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      message: "Supplier deleted successfully",
      supplier: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};