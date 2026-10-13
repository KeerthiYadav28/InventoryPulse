import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Supplier } from "../types";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";

interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const emptyForm: SupplierForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError("Could not load suppliers. Check your login and backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSuppliers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSuppliers]);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = search.trim().toLowerCase();
    return (
      supplier.name.toLowerCase().includes(query) ||
      (supplier.email ?? "").toLowerCase().includes(query) ||
      (supplier.phone ?? "").toLowerCase().includes(query)
    );
  });

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const openEditForm = (supplier: Supplier) => {
    setForm({
      name: supplier.name,
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
    });
    setEditingId(supplier.id);
    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      };

      if (editingId) {
        await updateSupplier(editingId, payload);
        setMessage("Supplier updated successfully.");
      } else {
        await createSupplier(payload);
        setMessage("Supplier created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setFormOpen(false);
      await loadSuppliers();
    } catch (err) {
      console.error("Failed to save supplier:", err);
      setError("Could not save the supplier. Check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm(`Delete supplier "${supplier.name}"?`)) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteSupplier(supplier.id);

      if (editingId === supplier.id) {
        setEditingId(null);
        setForm(emptyForm);
        setFormOpen(false);
      }

      setMessage("Supplier deleted successfully.");
      await loadSuppliers();
    } catch (err) {
      console.error("Failed to delete supplier:", err);
      setError("Could not delete this supplier. It may be linked to existing products.");
    }
  };

  return (
    <section className="suppliers-page">
      <header>
        <h1>Suppliers</h1>
        <p>Manage the businesses that supply your inventory.</p>
      </header>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <div className="suppliers-toolbar">
        <label htmlFor="supplier-search">Search suppliers</label>
        <input
          id="supplier-search"
          type="search"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="button" onClick={openAddForm}>
          Add Supplier
        </button>
      </div>

      {formOpen && (
        <form className="supplier-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Supplier" : "Add Supplier"}</h2>

          <label htmlFor="supplier-name">Name *</label>
          <input
            id="supplier-name"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            maxLength={100}
            required
          />

          <label htmlFor="supplier-email">Email</label>
          <input
            id="supplier-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />

          <label htmlFor="supplier-phone">Phone</label>
          <input
            id="supplier-phone"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />

          <label htmlFor="supplier-address">Address</label>
          <textarea
            id="supplier-address"
            rows={3}
            value={form.address}
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
          />

          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Save Changes"
                : "Create Supplier"}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormOpen(false);
              setEditingId(null);
              setForm(emptyForm);
              setError("");
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <h2>Supplier List ({filteredSuppliers.length})</h2>

      {loading ? (
        <p>Loading suppliers...</p>
      ) : filteredSuppliers.length === 0 ? (
        <p>
          {suppliers.length === 0
            ? "No suppliers found."
            : "No suppliers match your search."}
        </p>
      ) : (
        <div className="suppliers-table-wrapper">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.email || "—"}</td>
                  <td>{supplier.phone || "—"}</td>
                  <td>{supplier.address || "—"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openEditForm(supplier)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => void handleDelete(supplier)}
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

export default Suppliers;