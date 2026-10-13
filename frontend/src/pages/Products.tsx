import { useEffect, useState } from "react";
import type { Product } from "../types";
import { getProducts } from "../services/productService";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();
        console.log("PRODUCTS API RESPONSE:", data);
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div>
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Products</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
    className="products-page">
      <header>
        <h2>Products</h2>
        <p>Manage your inventory products.</p>
      </header>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table
        className="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Unit Price</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{product.reorder_level}</td>
                <td>{product.unit_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Products;