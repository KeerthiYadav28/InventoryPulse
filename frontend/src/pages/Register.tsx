import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<
    "admin" | "manager" | "user"
  >("user");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        role,
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        setError(
          response?.data?.message ??
            "Registration failed. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>InventoryPulse</h1>

      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
          />
        </div>

        <div>
          <label htmlFor="role">
            Role
          </label>

          <select
            id="role"
            value={role}
            onChange={(event) =>
              setRole(
                event.target.value as
                  | "admin"
                  | "manager"
                  | "user"
              )
            }
          >
            <option value="user">
              User
            </option>

            <option value="manager">
              Manager
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        </div>

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating account..."
            : "Create Account"}
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;