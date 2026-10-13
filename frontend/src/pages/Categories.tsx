import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Category } from "../types";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Could not load categories. Check your login and backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);
  
    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateCategory(editingId, { name: trimmedName });
        setMessage("Category updated successfully.");
      } else {
        await createCategory({ name: trimmedName });
        setMessage("Category created successfully.");
      }

      setName("");
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
      setError("Could not save the category. Check whether the name is valid or already exists.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setError("");
    setMessage("");
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteCategory(category.id);
      setMessage("Category deleted successfully.");

      if (editingId === category.id) {
        setEditingId(null);
        setName("");
      }

      await loadCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Could not delete the category. It may be linked to existing products.");
    }
  };

  return (
    <section className="categories-page">
      <header>
        <h1>Categories</h1>
        <p>Organize and manage your inventory categories.</p>
      </header>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <form onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Category" : "Add Category"}</h2>

        <label htmlFor="category-name">Category name</label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter category name"
          maxLength={100}
          required
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId
              ? "Save Changes"
              : "Add Category"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
              setError("");
              setMessage("");
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h2>Category List ({categories.length})</h2>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found. Add your first category above.</p>
      ) : (
        <div className="categories-table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    {" "}
                    <button
                      type="button"
                      onClick={() => void handleDelete(category)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Categories;