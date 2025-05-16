import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API Base URL - should be configured in an environment variable in production
const API_URL = "http://localhost:8080"; // Change this to your gateway URL

// Async thunks for API calls
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData, { rejectWithValue }) => {
    try {
      const { firstName, lastName, email, password } = userData;
      
      // Format the data as expected by the API
      const requestData = {
        username: email, // Using email as username for simplicity
        email,
        password,
        firstName,
        lastName
      };
      
      const response = await axios.post(`${API_URL}/auth/register`, requestData);
      // A 201 status means success for registration
      return response.data || { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      // Format the data as expected by the API
      const requestData = {
        username: userData.username, // API expects username, but our form has email
        password: userData.password
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  }
);

export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auth/validate?token=${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Invalid or expired token");
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth.user || {};
      
      if (!token) {
        return rejectWithValue("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const addUser = createAsyncThunk(
  "auth/addUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth.user || {};
      
      if (!token) {
        return rejectWithValue("Authentication required");
      }
      
      const response = await axios.post(`${API_URL}/api/users`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add user"
      );
    }
  }
);

export const editUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, ...userData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth.user || {};
      
      if (!token) {
        return rejectWithValue("Authentication required");
      }
      
      const response = await axios.put(`${API_URL}/api/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth.user || {};
      
      if (!token) {
        return rejectWithValue("Authentication required");
      }
      
      await axios.delete(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth.user || {};
      
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      return true;
    } catch (error) {
      // Still clear local state even if API call fails
      return true;
    }
  }
);

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
  users: [],
  error: null,
  loading: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        // Don't authenticate yet - user should login after registration
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { token, username, roles, id} = action.payload;
        state.user = {
          token,
          username,
          roles,
          id,
        };
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // Validate Token
    builder
      .addCase(validateToken.fulfilled, (state, action) => {
        const { token, username, roles, id} = action.payload;
        state.user = {
          token,
          username, 
          roles,
          id,
        };
        state.isAuthenticated = true;
        
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(validateToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
      })
    
    // Get All Users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // Add User
    builder
      .addCase(addUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // Update User
    builder
      .addCase(editUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.users = state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        );
        state.loading = false;
        
        // Update current user if it's the same person
        if (state.user && state.user.username === action.payload.username) {
          state.user = { ...state.user, ...action.payload };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.loading = false;
        
        // Logout if the deleted user is the current user
        if (state.user && state.user.id === action.payload) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("user");
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
      });
  }
});

export const { clearError, setLoading } = authSlice.actions;

export default authSlice.reducer;