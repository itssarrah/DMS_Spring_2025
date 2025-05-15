// store/documentSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Mock document data
const initialDocuments = [
  {
    id: 1,
    title: "Project Proposal",
    description: "Initial proposal for the marketing campaign",
    createdBy: 1,
    createdAt: "2025-02-15T10:30:00Z",
    updatedAt: "2025-03-01T14:20:00Z",
    status: "approved",
    tags: ["proposal", "marketing"],
    content: "This is a sample project proposal document content...",
  },
  {
    id: 2,
    title: "Financial Report Q1",
    description: "Quarterly financial report",
    createdBy: 2,
    createdAt: "2025-03-05T09:15:00Z",
    updatedAt: "2025-03-05T09:15:00Z",
    status: "draft",
    tags: ["finance", "report", "quarterly"],
    content: "This is the content of the Q1 financial report...",
  },
  {
    id: 3,
    title: "User Manual",
    description: "Product user manual",
    createdBy: 1,
    createdAt: "2025-01-20T11:45:00Z",
    updatedAt: "2025-02-10T13:30:00Z",
    status: "published",
    tags: ["manual", "product"],
    content: "This is the content of the user manual...",
  },
];

const initialState = {
  documents: initialDocuments,
  currentDocument: null,
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
    // Add new document
    addDocument: (state, action) => {
      const newDocument = {
        id: state.documents.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...action.payload,
      };
      state.documents.push(newDocument);
      state.currentDocument = newDocument;
    },

    // Update existing document
    updateDocument: (state, action) => {
      const { id, ...updates } = action.payload;
      state.documents = state.documents.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : doc
      );

      // Update currentDocument if it's the same document
      if (state.currentDocument && state.currentDocument.id === id) {
        state.currentDocument = {
          ...state.currentDocument,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    // Delete document
    deleteDocument: (state, action) => {
      const documentId = action.payload;
      state.documents = state.documents.filter((doc) => doc.id !== documentId);

      // Clear currentDocument if it's the deleted document
      if (state.currentDocument && state.currentDocument.id === documentId) {
        state.currentDocument = null;
      }
    },

    // Set current document
    setCurrentDocument: (state, action) => {
      const documentId = action.payload;
      state.currentDocument =
        state.documents.find((doc) => doc.id === documentId) || null;
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

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addDocument,
  updateDocument,
  deleteDocument,
  setCurrentDocument,
  clearCurrentDocument,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = documentSlice.actions;

export default documentSlice.reducer;
