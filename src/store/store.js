// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import documentReducer from "./documentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
  },
});

export default store;
