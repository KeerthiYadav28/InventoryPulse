
import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types";
import { getProducts } from "../services/productService";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products. Please check your connection and login status.");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  }, [products, search]);

  const lowStockCount = products.filter(
    (product) => product.quantity <= product.reorder_level
  ).length;

  if (loading) {
    return (
      <div className="products-page">
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <h2>Products</h2>
        <p role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header>
        <h2>Products</h2>
        <p>Manage your inventory products.</p>
      </header>

      <div className="products-toolbar">
        <label htmlFor="product-search">Search products</label>
        <input
          id="product-search"
          type="search"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="products-search-input"
        />

        <p>
          Showing {filteredProducts.length} of {products.length} products
        </p>

        <p>
          Low-stock products: <strong>{lowStockCount}</strong>
        </p>
      </div>

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
                    <td>
                      {Number(product.unit_price).toFixed(2)}
                    </td>
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
