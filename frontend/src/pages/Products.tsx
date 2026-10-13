
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Category, Product, Supplier } from "../types";
import { useAuth } from "../hooks/useAuth";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type CreateProductData,
} from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";

const emptyForm: CreateProductData = {
  sku: "",
  name: "",
  description: "",
  category_id: "",
  supplier_id: "",
  quantity: 0,
  reorder_level: 0,
  unit_price: 0,
};

const Products = () => {
  const { user } = useAuth();
  const role = user?.role;

  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductData>(emptyForm);

  const loadData = useCallback(async () => {
    try {
      const [productData, categoryData, supplierData] = await Promise.all([
        getProducts(),
        getCategories(),
        getSuppliers(),
      ]);

      setProducts(productData);
      setCategories(categoryData);
      setSuppliers(supplierData);
    } catch (err) {
      console.error("Failed to load product management data:", err);
      setError("Could not load products, categories, or suppliers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
  
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  }, [products, search]);

  const lowStockCount = products.filter(
    (product) => product.quantity <= product.reorder_level
  ).length;

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
    setError("");
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? "",
      category_id: product.category_id ?? "",
      supplier_id: product.supplier_id ?? "",
      quantity: product.quantity,
      reorder_level: product.reorder_level,
      unit_price: Number(product.unit_price),
    });
    setMessage("");
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.sku.trim() || !form.name.trim()) {
      setError("SKU and product name are required.");
      return;
    }

    if (
      !Number.isFinite(Number(form.quantity)) ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0
    ) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }

    if (
      !Number.isFinite(Number(form.reorder_level)) ||
      !Number.isInteger(Number(form.reorder_level)) ||
      Number(form.reorder_level) < 0
    ) {
      setError("Reorder level must be a non-negative whole number.");
      return;
    }

    if (
      !Number.isFinite(Number(form.unit_price)) ||
      Number(form.unit_price) < 0
    ) {
      setError("Unit price must be a non-negative number.");
      return;
    }

    const payload: CreateProductData = {
      ...form,
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      category_id: form.category_id || undefined,
      supplier_id: form.supplier_id || undefined,
      quantity: Number(form.quantity),
      reorder_level: Number(form.reorder_level),
      unit_price: Number(form.unit_price),
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(payload);
        setMessage("Product created successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadData();
    } catch (err) {
      console.error("Failed to save product:", err);
      setError("Could not save the product. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}" (SKU: ${product.sku})? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteProduct(product.id);
      setMessage("Product deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Could not delete this product. Check your permissions and try again.");
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header>
        <h2>Products</h2>
        <p>Manage your inventory products.</p>
      </header>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <div className="products-toolbar">
        <label htmlFor="product-search">Search products</label>
        <input
          id="product-search"
          type="search"
          className="products-search-input"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <p>
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <p>
          Low-stock products: <strong>{lowStockCount}</strong>
        </p>

        {canManage && (
          <button type="button" onClick={openCreateForm}>
            Add Product
          </button>
        )}
      </div>

      {formOpen && (
        <section className="product-form-panel">
          <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

          <form onSubmit={handleSubmit}>
            <label htmlFor="product-sku">SKU *</label>
            <input
              id="product-sku"
              required
              value={form.sku}
              onChange={(event) =>
                setForm({ ...form, sku: event.target.value })
              }
            />

            <label htmlFor="product-name">Product Name *</label>
            <input
              id="product-name"
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />

            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />

            <label htmlFor="product-category">Category</label>
            <select
              id="product-category"
              value={form.category_id ?? ""}
              onChange={(event) =>
                setForm({ ...form, category_id: event.target.value })
              }
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label htmlFor="product-supplier">Supplier</label>
            <select
              id="product-supplier"
              value={form.supplier_id ?? ""}
              onChange={(event) =>
                setForm({ ...form, supplier_id: event.target.value })
              }
            >
              <option value="">No supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <label htmlFor="product-quantity">Quantity *</label>
            <input
              id="product-quantity"
              type="number"
              min="0"
              step="1"
              required
              value={form.quantity}
              onChange={(event) =>
                setForm({ ...form, quantity: Number(event.target.value) })
              }
            />

            <label htmlFor="product-reorder">Reorder Level *</label>
            <input
              id="product-reorder"
              type="number"
              min="0"
              step="1"
              required
              value={form.reorder_level}
              onChange={(event) =>
                setForm({
                  ...form,
                  reorder_level: Number(event.target.value),
                })
              }
            />

            <label htmlFor="product-price">Unit Price *</label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.unit_price}
              onChange={(event) =>
                setForm({ ...form, unit_price: Number(event.target.value) })
              }
            />

            <div className="product-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Product"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {products.length === 0 ? (
        <p>No products found. Add a product to get started.</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products match "{search}". Try another name or SKU.</p>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Unit Price</th>
                <th>Stock Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const isLowStock =
                  product.quantity <= product.reorder_level;

                return (
                  <tr
                    key={product.id}
                    className={isLowStock ? "low-stock-row" : ""}
                  >
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.reorder_level}</td>
                    <td>{Number(product.unit_price).toFixed(2)}</td>
                    <td>
                      <span
                        className={
                          isLowStock
                            ? "stock-badge stock-badge-low"
                            : "stock-badge stock-badge-normal"
                        }
                      >
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>

                    {canManage && (
                      <td>
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                        >
                          Edit
                        </button>{" "}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(product)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
