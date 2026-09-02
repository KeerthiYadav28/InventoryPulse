import { Response } from "express";
import { pool } from "../config/database";
import { AuthRequest } from "../middleware/authMiddleware";

export const createStockMovement = async (
  req: AuthRequest,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { product_id, type, quantity, reason } = req.body;

    // Validate required fields
    if (!product_id || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "product_id, type and quantity are required",
      });
    }

    // Validate movement type
    const allowedTypes = ["IN", "OUT", "ADJUSTMENT"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movement type",
      });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    // Get logged-in user
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Start transaction
    await client.query("BEGIN");

    // Lock the product row while processing the stock movement
    const productResult = await client.query(
      "SELECT id, quantity FROM products WHERE id = $1 FOR UPDATE",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const currentQuantity = productResult.rows[0].quantity;

    let newQuantity = currentQuantity;

    // IN: increase stock
    if (type === "IN") {
      newQuantity = currentQuantity + quantity;
    }

    // OUT: decrease stock, but never below zero
    if (type === "OUT") {
      if (currentQuantity < quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      newQuantity = currentQuantity - quantity;
    }

    // ADJUSTMENT: set stock directly
    if (type === "ADJUSTMENT") {
      newQuantity = quantity;
    }

    // Create stock movement history record
    const movementResult = await client.query(
      `INSERT INTO stock_movements
       (product_id, type, quantity, reason, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product_id, type, quantity, reason || null, createdBy]
    );

    // Update product quantity
    await client.query(
      `UPDATE products
       SET quantity = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newQuantity, product_id]
    );

    // Commit transaction
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Stock movement created successfully",
      movement: movementResult.rows[0],
      new_quantity: newQuantity,
    });
  } catch (error) {
    // Rollback if anything fails
    await client.query("ROLLBACK");

    console.error("Create stock movement error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    // Always release database connection
    client.release();
  }
};

export const getStockMovements = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { product_id, type} = req.query;

    const allowedTypes = ["IN", "OUT", "ADJUSTMENT"];

    if (type && !allowedTypes.includes(String(type))) {
      return res.status(400).json({
        success: false,
        message: "Invalid movement type",
      });
    }
    
    let query = `
      SELECT
        sm.id,
        sm.product_id,
        p.name AS product_name,
        p.sku,
        sm.type,
        sm.quantity,
        sm.reason,
        sm.created_by,
        sm.created_at
      FROM stock_movements sm
      JOIN products p
        ON sm.product_id = p.id
    `;

    const values: string[] = [];

    const conditions: string[] = [];

    if (product_id) {
      values.push(String(product_id));
      conditions.push(`sm.product_id = $${values.length}`);
    }
    
    if (type) {
      values.push(String(type));
      conditions.push(`sm.type = $${values.length}`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY sm.created_at DESC`;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      movements: result.rows,
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStockMovementById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        sm.id,
        sm.product_id,
        p.name AS product_name,
        p.sku,
        sm.type,
        sm.quantity,
        sm.reason,
        sm.created_by,
        sm.created_at
       FROM stock_movements sm
       JOIN products p
         ON sm.product_id = p.id
       WHERE sm.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock movement not found",
      });
    }

    return res.status(200).json({
      success: true,
      movement: result.rows[0],
    });
  } catch (error) {
    console.error("Get stock movement by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};