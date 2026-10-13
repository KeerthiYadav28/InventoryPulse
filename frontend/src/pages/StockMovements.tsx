
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Product, StockMovement, StockMovementType } from "../types";
import { getProducts } from "../services/productService";
import {
  getStockMovements,
  createStockMovement,
} from "../services/stockMovementService";
import { useAuth } from "../hooks/useAuth";

interface MovementForm {
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

const initialForm: MovementForm = {
  product_id: "",
  type: "IN",
  quantity: 1,
  reason: "",
};

const StockMovements = () => {
  const { user } = useAuth();
  const canRecord = user?.role === "admin" || user?.role === "manager";

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [form, setForm] = useState<MovementForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [productData, movementData] = await Promise.all([
        getProducts(),
        getStockMovements(),
      ]);
      setProducts(productData);
      setMovements(movementData);
      setError("");
    } catch (err) {
      console.error("Failed to load stock movements:", err);
      setError("Could not load stock movements. Check your login and backend connection.");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.product_id) {
      setError("Please select a product.");
      return;
    }

    if (!Number.isInteger(form.quantity) || form.quantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please provide a reason for this stock movement.");
      return;
    }

    try {
      setSaving(true);

      await createStockMovement({
        product_id: form.product_id,
        type: form.type,
        quantity: form.quantity,
        reason: form.reason.trim(),
      });

      setMessage("Stock movement recorded successfully.");
      setForm(initialForm);
      await loadData();
    } catch (err) {
      console.error("Failed to record stock movement:", err);
      setError("Could not record this movement. Check the quantity, permissions, and product stock.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="movements-page">
        <h1>Stock Movements</h1>
        <p>Loading stock movements...</p>
      </section>
    );
  }

  return (
    <section className="movements-page">
      <header>
        <h1>Stock Movements</h1>
        <p>Track stock received, issued, and adjusted.</p>
      </header>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {canRecord && (
        <form className="movement-form" onSubmit={handleSubmit}>
          <h2>Record Stock Movement</h2>

          <label htmlFor="movement-product">Product *</label>
          <select
            id="movement-product"
            value={form.product_id}
            onChange={(event) =>
              setForm({ ...form, product_id: event.target.value })
            }
            required
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku}) — Current stock: {product.quantity}
              </option>
            ))}
          </select>

          <label htmlFor="movement-type">Movement Type *</label>
          <select
            id="movement-type"
            value={form.type}
            onChange={(event) =>
              setForm({
                ...form,
                type: event.target.value as StockMovementType,
              })
            }
          >
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="ADJUSTMENT">Stock Adjustment</option>
          </select>

          <label htmlFor="movement-quantity">
            {form.type === "ADJUSTMENT"
              ? "New total quantity *"
              : "Movement quantity *"}
          </label>
          <input
            id="movement-quantity"
            type="number"
            min="1"
            step="1"
            required
            value={form.quantity}
            onChange={(event) =>
              setForm({ ...form, quantity: Number(event.target.value) })
            }
          />

          <label htmlFor="movement-reason">Reason *</label>
          <textarea
            id="movement-reason"
            value={form.reason}
            onChange={(event) =>
              setForm({ ...form, reason: event.target.value })
            }
            placeholder="e.g. New delivery or sale"
            required
          />

          <button type="submit" disabled={saving || products.length === 0}>
            {saving ? "Recording..." : "Record Movement"}
          </button>
        </form>
      )}

      <h2>Movement History ({movements.length})</h2>

      {movements.length === 0 ? (
        <p>No stock movements found.</p>
      ) : (
        <div className="movements-table-wrapper">
          <table className="movements-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const product = products.find(
                  (item) => item.id === movement.product_id
                );

                return (
                  <tr key={movement.id}>
                    <td>
                      {movement.created_at
                        ? new Date(movement.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>{product?.name ?? movement.product_id}</td>
                    <td>{movement.type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.reason || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default StockMovements;
