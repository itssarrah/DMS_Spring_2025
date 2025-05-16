// store/departmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080";

// Helper function to get token from localStorage
const getToken = () => {
  try {
    const serializedUser = localStorage.getItem("user");
    if (serializedUser === null) {
      return null;
    }
    const user = JSON.parse(serializedUser);
    return user.token;
  } catch (error) {
    console.error("Could not load token from storage:", error);
    return null;
  }
};

// Helper function to get user ID from localStorage
const getUserId = () => {
  try {
    const serializedUser = localStorage.getItem("user");
    if (serializedUser === null) {
      return null;
    }
    const user = JSON.parse(serializedUser);
    return user.id;
  } catch (error) {
    console.error("Could not load user ID from storage:", error);
    return null;
  }
};

// New async thunk for fetching user departments
export const fetchUserDepartments = createAsyncThunk(
  "departments/fetchUserDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const userId = getUserId();
      
      if (!token || !userId) {
        return rejectWithValue("No authentication token or user ID found");
      }
      
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Extract departments from user data
      return response.data.departments || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch user departments");
    }
  }
);

// Async thunks for API operations
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.get(`${API_URL}/api/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch departments");
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  "departments/fetchDepartmentById",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.get(`${API_URL}/api/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch department");
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.post(`${API_URL}/api/departments`, departmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create department");
    }
  }
);

export const updateDepartmentThunk = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.put(`${API_URL}/api/departments/${id}`, departmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update department");
    }
  }
);

export const deleteDepartmentThunk = createAsyncThunk(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      await axios.delete(`${API_URL}/api/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete department");
    }
  }
);

const initialState = {
  departments: [],
  userDepartments: [], // New state for user departments
  currentDepartment: null,
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchDepartments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchUserDepartments
      .addCase(fetchUserDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.userDepartments = action.payload;
      })
      .addCase(fetchUserDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchDepartmentById
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle createDepartment
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments.push(action.payload);
        state.currentDepartment = action.payload;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle updateDepartmentThunk
      .addCase(updateDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedDepartment = action.payload;
        
        // Update in departments array
        state.departments = state.departments.map((department) =>
          department.id === updatedDepartment.id ? updatedDepartment : department
        );
        
        // Update currentDepartment if it's the updated one
        if (state.currentDepartment && state.currentDepartment.id === updatedDepartment.id) {
          state.currentDepartment = updatedDepartment;
        }
      })
      .addCase(updateDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle deleteDepartmentThunk
      .addCase(deleteDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.departments = state.departments.filter((department) => department.id !== deletedId);
        
        // Clear currentDepartment if it's the deleted one
        if (state.currentDepartment && state.currentDepartment.id === deletedId) {
          state.currentDepartment = null;
        }
      })
      .addCase(deleteDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentDepartment,
  clearError,
} = departmentSlice.actions;

// Selectors
export const selectAllDepartments = (state) => state.departments.departments;
export const selectUserDepartments = (state) => state.departments.userDepartments;
export const selectCurrentDepartment = (state) => state.departments.currentDepartment;
export const selectDepartmentsLoading = (state) => state.departments.loading;
export const selectDepartmentsError = (state) => state.departments.error;

export default departmentSlice.reducer;