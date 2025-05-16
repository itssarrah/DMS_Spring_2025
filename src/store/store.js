// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import documentReducer from "./documentSlice";
import categoryReducer from "./categorySlice"
import departmentReducer from "./departmentSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    categories: categoryReducer,
    departments: departmentReducer,
  },
});

export default store;
