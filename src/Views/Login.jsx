import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../store/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    username: "", // Renamed from email
    password: "",
  });

  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }

    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (localErrors[e.target.name]) {
      setLocalErrors({
        ...localErrors,
        [e.target.name]: ""
      });
    }

    if (error) dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light font-montserrat">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Login to DocMedia
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                localErrors.username ? "border-red-500" : "focus:ring-primary"
              }`}
            />
            {localErrors.username && (
              <p className="text-red-500 text-sm mt-1">{localErrors.username}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                localErrors.password ? "border-red-500" : "focus:ring-primary"
              }`}
            />
            {localErrors.password && (
              <p className="text-red-500 text-sm mt-1">{localErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 bg-primary text-white rounded-lg hover:bg-secondary transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-secondary mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
