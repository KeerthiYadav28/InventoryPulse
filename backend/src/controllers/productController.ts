import { Request, Response } from "express";
import { pool } from "../config/database";
import { AppError } from "../utils/AppError";

// CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      sku,
      description,
      category_id,
      supplier_id,
      quantity,
      reorder_level,
      unit_price,
    } = req.body;

    if (!name || !sku) {
      throw new AppError("Product name and SKU are required", 400);
    }

    if (quantity !== undefined && quantity < 0) {
      throw new AppError("Quantity cannot be negative", 400);
    }

    if (reorder_level !== undefined && reorder_level < 0) {
      throw new AppError("Reorder level cannot be negative", 400);
    }

    if (unit_price !== undefined && unit_price < 0) {
      throw new AppError("Price cannot be negative", 400);
    }

    const existingProduct = await pool.query(
      "SELECT id FROM products WHERE sku = $1",
      [sku]
    );

    if (existingProduct.rows.length > 0) {
      throw new AppError(
        "A product with this SKU already exists",
        409
      );
    }

    const result = await pool.query(
      `INSERT INTO products
       (name, sku, description, category_id, supplier_id, quantity, reorder_level, unit_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        sku,
        description || null,
        category_id || null,
        supplier_id || null,
        quantity ?? 0,
        reorder_level ?? 10,
        unit_price ?? 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  
    console.error("Create product error:", error);
  
    throw new AppError("Internal server error", 500);
  }
};

// GET ALL PRODUCTS
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
        p.*,
        c.name AS category_name,
        s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ORDER BY p.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET PRODUCT BY ID

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        p.*,
        c.name AS category_name,
        s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError("Product not found", 404);
    }

    return res.status(200).json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("Get product by ID error:", error);

    throw new AppError("Internal server error", 500);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      description,
      category_id,
      supplier_id,
      quantity,
      reorder_level,
      unit_price,
    } = req.body;

    const existingProduct = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const result = await pool.query(
      `UPDATE products
       SET
         name = COALESCE($1, name),
         sku = COALESCE($2, sku),
         description = COALESCE($3, description),
         category_id = COALESCE($4, category_id),
         supplier_id = COALESCE($5, supplier_id),
         quantity = COALESCE($6, quantity),
         reorder_level = COALESCE($7, reorder_level),
         unit_price = COALESCE($8, unit_price),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        name,
        sku,
        description,
        category_id,
        supplier_id,
        quantity,
        reorder_level,
        unit_price,
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw new AppError("Product not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  
    console.error("Update product error:", error);
  
    throw new AppError("Internal server error", 500);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError("Product not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  
    console.error("Delete product error:", error);
  
    throw new AppError("Internal server error", 500);
  }
};

// GET LOW-STOCK PRODUCTS
export const getLowStockProducts = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT
        p.*,
        c.name AS category_name,
        s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.quantity <= p.reorder_level
       ORDER BY p.quantity ASC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
  } catch (error) {
    console.error("Get low-stock products error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};