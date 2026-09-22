import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = (
    role: "admin" | "manager" | "user"
  ): string => {
    switch (role) {
      case "admin":
        return "Administrator";

      case "manager":
        return "Manager";

      case "user":
        return "User";

      default:
        return "User";
    }
  };

  return (
    <header>
      <div>
        <h1>InventoryPulse</h1>
      </div>

      <div>
        {user && (
          <div>
            <strong>
              Welcome, {user.name}
            </strong>

            <div>
              Role: {getRoleLabel(user.role)}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;