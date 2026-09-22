import { NavLink } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside>
      <h2>InventoryPulse</h2>

      {user && (
        <div>
          <strong>{user.role.toUpperCase()}</strong>
        </div>
      )}

      <nav>
        <ul>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Products
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Categories
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/suppliers"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Suppliers
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/stock-movements"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Stock Movements
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;