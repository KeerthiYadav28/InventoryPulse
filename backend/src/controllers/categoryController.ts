import { Request, Response } from "express";
import { pool } from "../config/database";

// CREATE CATEGORY
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, description]
    );

    res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL CATEGORIES
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM categories
      ORDER BY created_at DESC
      `
    );

    res.status(200).json({
      categories: result.rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET CATEGORY BY ID
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching category:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      `
      UPDATE categories
      SET
        name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      message: "Category deleted successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};