// store/documentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8083/api/documents";
const USER_API_URL = "http://localhost:8080/api/users";

// Helper function to get token and user from localStorage
const getTokenAndUser = () => {
  try {
    const serializedUser = localStorage.getItem("user");
    
    if (serializedUser === null) {
      return { token: null, userId: null, roles: [] };
    }
    const user = JSON.parse(serializedUser);
    return { token: user.token, userId: user.id, roles: user.roles || [] };
  } catch (error) {
    console.error("Could not load token from storage:", error);
    return { token: null, userId: null, roles: [] };
  }
};

// Fetch current user's departments
export const fetchUserDepartments = createAsyncThunk(
  "documents/fetchUserDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const { token, userId } = getTokenAndUser();
      
      if (!token || !userId) {
        return rejectWithValue("No authentication token or user ID found");
      }
      
      const response = await axios.get(`${USER_API_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Extract user's departments from response
      return response.data.departments || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch user departments");
    }
  }
);

// Async thunks for API calls
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, roles } = getTokenAndUser();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check if user is admin
      const isAdmin = roles.includes("ROLE_ADMIN");
      
      // If admin, return all documents
      if (isAdmin) {
        return response.data;
      }
      
      // Otherwise, filter documents based on user's departments
      const { documents } = getState();
      const userDepartments = documents.userDepartments || [];
      
      // Get department IDs the user belongs to
      const userDepartmentIds = userDepartments.map(dept => dept.id);
      
      // Filter documents based on department access
      return response.data.filter(doc => 
        userDepartmentIds.includes(doc.departmentId)
      );
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch documents");
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token, roles } = getTokenAndUser();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check if user is admin
      const isAdmin = roles.includes("ROLE_ADMIN");
      
      // If admin, return document
      if (isAdmin) {
        return response.data;
      }
      
      // Otherwise, check if user has access based on their departments
      const { documents } = getState();
      const userDepartments = documents.userDepartments || [];
      
      // Check if user has access to this document
      if (userDepartments.some(dept => dept.id === response.data.departmentId)) {
        return response.data;
      } else {
        return rejectWithValue("You don't have access to this document");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch document");
    }
  }
);

export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async (documentData, { rejectWithValue }) => {
    try {
      const { token } = getTokenAndUser();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      const response = await axios.post(API_URL, documentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create document");
    }
  }
);

export const updateDocumentAsync = createAsyncThunk(
  "documents/updateDocument",
  async ({ id, ...updateData }, { getState, rejectWithValue }) => {
    try {
      const { token, roles } = getTokenAndUser();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      // Check if user has access to update this document
      const isAdmin = roles.includes("ROLE_ADMIN");
      
      if (!isAdmin) {
        const { documents } = getState();
        const userDepartments = documents.userDepartments || [];
        const document = documents.documents.find(doc => doc.id === id);
        
        if (!document) {
          return rejectWithValue("Document not found");
        }
        
        if (!userDepartments.some(dept => dept.id === document.departmentId)) {
          return rejectWithValue("You don't have permission to update this document");
        }
      }
      
      const response = await axios.put(`${API_URL}/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update document");
    }
  }
);

export const deleteDocumentAsync = createAsyncThunk(
  "documents/deleteDocument",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token, roles } = getTokenAndUser();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      // Check if user has access to delete this document
      const isAdmin = roles.includes("ROLE_ADMIN");
      
      if (!isAdmin) {
        const { documents } = getState();
        const userDepartments = documents.userDepartments || [];
        const document = documents.documents.find(doc => doc.id === id);
        
        if (!document) {
          return rejectWithValue("Document not found");
        }
        
        if (!userDepartments.some(dept => dept.id === document.departmentId)) {
          return rejectWithValue("You don't have permission to delete this document");
        }
      }
      
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete document");
    }
  }
);

// Update the downloadDocument action to accept filename parameter
export const downloadDocument = createAsyncThunk(
  "documents/downloadDocument",
  async ({ id, fileName }, { getState, rejectWithValue }) => {
    try {
      const { token, roles } = getTokenAndUser();
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      
      // Check if user has access to download this document
      const isAdmin = roles.includes("ROLE_ADMIN");
      
      if (!isAdmin) {
        const { documents } = getState();
        const userDepartments = documents.userDepartments || [];
        const document = documents.documents.find(doc => doc.id === id);
        
        if (!document) {
          return rejectWithValue("Document not found");
        }
        
        if (!userDepartments.some(dept => dept.id === document.departmentId)) {
          return rejectWithValue("You don't have permission to download this document");
        }
      }
      
      if (!fileName) {
        return rejectWithValue("Filename not provided");
      }
      
      // Use the fileName passed from the component
      const response = await axios.get(`http://localhost:8000/download/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      // Use the provided filename
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Return a serializable value, not the Blob
      return { id, success: true };
    } catch (error) {
      // Return a serializable error message, not the Blob
      return rejectWithValue(
        error.response?.data?.message || 
        "Failed to download document"
      );
    }
  }
);

const initialState = {
  documents: [],
  currentDocument: null,
  userDepartments: [],
  loading: false,
  error: null,
  filters: {
    status: null,
    createdBy: null,
    tags: [],
    searchTerm: "",
  },
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    // Set current document locally
    setCurrentDocument: (state, action) => {
      state.currentDocument = state.documents.find(
        (doc) => doc.id === action.payload
      ) || null;
    },

    // Clear current document
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: null,
        createdBy: null,
        tags: [],
        searchTerm: "",
      };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user departments
      .addCase(fetchUserDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.userDepartments = action.payload;
        state.error = null;
      })
      .addCase(fetchUserDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create document
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
        state.error = null;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update document
      .addCase(updateDocumentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDocumentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        state.documents = state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...action.payload } : doc
        );
        if (state.currentDocument && state.currentDocument.id === id) {
          state.currentDocument = { ...state.currentDocument, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateDocumentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete document
      .addCase(deleteDocumentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocumentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter((doc) => doc.id !== action.payload);
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null;
        }
        state.error = null;
      })
      .addCase(deleteDocumentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentDocument,
  clearCurrentDocument,
  setFilters,
  clearFilters,
  clearError,
} = documentSlice.actions;

// Selectors
export const selectAllDocuments = (state) => state.documents.documents;
export const selectCurrentDocument = (state) => state.documents.currentDocument;
export const selectDocumentsLoading = (state) => state.documents.loading;
export const selectDocumentsError = (state) => state.documents.error;
export const selectDocumentFilters = (state) => state.documents.filters;
export const selectUserDepartments = (state) => state.documents.userDepartments;

export default documentSlice.reducer;