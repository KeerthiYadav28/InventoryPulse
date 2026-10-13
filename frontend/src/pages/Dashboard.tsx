import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { getProducts, getLowStockProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    categories: 0,
    suppliers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [products, lowStock, categories, suppliers] =
          await Promise.all([
            getProducts(),
            getLowStockProducts(),
            getCategories(),
            getSuppliers(),
          ]);

        setStats({
          products: products.length,
          lowStock: lowStock.length,
          categories: categories.length,
          suppliers: suppliers.length,
        });
      } catch {
        setError(
          "Unable to load dashboard statistics. Please check your connection and login status."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className="dashboard-page">
      <header>
        <h2>Dashboard</h2>
        <p>Overview of your inventory at a glance.</p>
      </header>

      <div className="stats-grid">
        <StatCard title="Total Products" value={stats.products} />
        <StatCard title="Low Stock" value={stats.lowStock} />
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Suppliers" value={stats.suppliers} />
      </div>
    </div>
  );
};

export default Dashboard;