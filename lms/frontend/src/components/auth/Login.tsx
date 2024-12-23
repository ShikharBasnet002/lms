import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogIn } from "lucide-react";

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    if (!identifier.trim()) {
      setError("Identifier is required!");
      return false;
    }
    if (!password) {
      setError("Password is required!");
      return false;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true); // Start loading state

    try {
      await login(identifier, password); // Simulate authentication
      navigate("/dashboard"); // skyirect to dashboard on success
    } catch (err) {
      setError("Invalid Identifier or Password"); // Handle errors
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-500">Learning Management System</h1>
      </div>

      {/* Form Container */}
      <div className="max-w-md w-full space-y-8 p-12 rounded bg-gray-200 border border-gray-400">
        <div>
          <LogIn className="mx-auto h-12 w-auto text-sky-700" />
          <h2 className="text-center text-2xl font-bold text-gray-500">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="py-2">
              <label htmlFor="identifier" className="sr-only">
                Identifier
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                disabled={loading}
                className={`appearance-none rounded relative block w-full p-3 border ${loading
                    ? "bg-white cursor-not-allowed"
                    : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:z-10 sm:text-sm`}
                placeholder="Identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="py-2">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                disabled={loading}
                className={`appearance-none rounded relative block w-full p-3 border ${loading
                    ? "bg-white cursor-not-allowed"
                    : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-1 bg-red-200 border border-red-500 rounded">
              <p className="text-center text-md text-red-900">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                }`}
            >
              {loading ? (
                <>
                  Signing in...&nbsp;
                  <div
                    className="animate-spin inline-block size-5 border-[2px] border-current border-t-transparent text-sky-600 rounded-full dark:text-white"
                    role="status"
                    aria-label="loading"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
