import { useState } from "react";
import { useDispatch } from "react-redux";
import { signUp } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Validation & Feedback
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear errors on input change
  };

  // Form Validation Logic
  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors); // Set errors if validation fails
      return;
    }

    // Dispatch signUp action
    dispatch(signUp(formData))
      .unwrap()
      .then(() => {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        setErrors({ api: err.message || "Registration failed." });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light font-montserrat">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Create an Account
        </h2>

        {successMessage && (
          <p className="mb-4 text-green-600 font-semibold">{successMessage}</p>
        )}
        {errors.api && (
          <p className="mb-4 text-red-500 font-semibold">{errors.api}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* First Name Input */}
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.firstName ? "border-red-500" : "focus:ring-primary"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name Input */}
          <div>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.lastName ? "border-red-500" : "focus:ring-primary"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500" : "focus:ring-primary"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500" : "focus:ring-primary"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg shadow-md hover:bg-secondary transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-secondary mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
