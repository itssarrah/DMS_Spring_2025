// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Mock user database for demonstration
const mockUsers = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: 3,
    fullName: "Bob Johnson",
    email: "bob@example.com",
    password: "password123",
    role: "admin",
  },
];

// Load user from localStorage if available
const loadUserFromStorage = () => {
  try {
    const serializedUser = localStorage.getItem("user");
    if (serializedUser === null) {
      return null;
    }
    return JSON.parse(serializedUser);
  } catch (err) {
    console.error("Could not load user from storage:", err);
    return null;
  }
};

const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: loadUserFromStorage() !== null,
  users: mockUsers,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Handle user signup
    signUp: (state, action) => {
      const { fullName, email, password } = action.payload;

      // Check if user already exists
      const userExists = state.users.find((user) => user.email === email);
      if (userExists) {
        state.error = "Email already in use";
        return;
      }

      // Create new user
      const newUser = {
        id: state.users.length + 1,
        fullName,
        email,
        password,
        role: "user",
      };

      state.users.push(newUser);
      state.user = { id: newUser.id, fullName, email, role: newUser.role };
      state.isAuthenticated = true;
      state.error = null;

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Handle user login
    login: (state, action) => {
      const { email, password } = action.payload;

      // Find user
      const user = state.users.find(
        (user) => user.email === email && user.password === password
      );

      if (user) {
        // Extract user info without password
        const { id, fullName, email, role } = user;
        state.user = { id, fullName, email, role };
        state.isAuthenticated = true;
        state.error = null;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      } else {
        state.error = "Invalid email or password";
      }
    },

    // Update user details
    editUser: (state, action) => {
      const { id, ...updates } = action.payload;

      // Update user in users array
      state.users = state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      );

      // Update current user if it's the same person
      if (state.user && state.user.id === id) {
        state.user = { ...state.user, ...updates };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    // Add new user (admin function)
    addUser: (state, action) => {
      const { fullName, email, password, role } = action.payload;

      // Check if user already exists
      const userExists = state.users.find((user) => user.email === email);
      if (userExists) {
        state.error = "Email already in use";
        return;
      }

      const newUser = {
        id: state.users.length + 1,
        fullName,
        email,
        password,
        role: role || "user",
      };

      state.users.push(newUser);
      state.error = null;
    },

    // Delete user
    deleteUser: (state, action) => {
      const userId = action.payload;
      state.users = state.users.filter((user) => user.id !== userId);

      // Logout if the deleted user is the current user
      if (state.user && state.user.id === userId) {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
      }
    },

    // Handle logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  signUp,
  login,
  logout,
  editUser,
  addUser,
  deleteUser,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
