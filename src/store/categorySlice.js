// store/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8083";

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

// Async thunks for API operations
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch categories");
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.get(`${API_URL}/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch category");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.post(`${API_URL}/api/categories`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create category");
    }
  }
);

export const updateCategoryThunk = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.put(`${API_URL}/api/categories/${id}`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update category");
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      await axios.delete(`${API_URL}/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete category");
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchCategoryById
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle createCategory
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.currentCategory = action.payload;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle updateCategoryThunk
      .addCase(updateCategoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload;
        
        // Update in categories array
        state.categories = state.categories.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category
        );
        
        // Update currentCategory if it's the updated one
        if (state.currentCategory && state.currentCategory.id === updatedCategory.id) {
          state.currentCategory = updatedCategory;
        }
      })
      .addCase(updateCategoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle deleteCategoryThunk
      .addCase(deleteCategoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.categories = state.categories.filter((category) => category.id !== deletedId);
        
        // Clear currentCategory if it's the deleted one
        if (state.currentCategory && state.currentCategory.id === deletedId) {
          state.currentCategory = null;
        }
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentCategory,
  clearError,
} = categorySlice.actions;

// Selectors
export const selectAllCategories = (state) => state.categories.categories;
export const selectCurrentCategory = (state) => state.categories.currentCategory;
export const selectCategoriesLoading = (state) => state.categories.loading;
export const selectCategoriesError = (state) => state.categories.error;

export default categorySlice.reducer;