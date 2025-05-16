import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { useSelector } from "react-redux";
import store from "./store/store.js"; // Ensure this path is correct

import Landing from "./Views/Landing";
import Login from "./Views/Login";
import Signup from "./Views/Signup";
import ListView from "./Components/ListView.jsx";
import Dashboard from "./Views/Dashboard";
import UserManagement from "./Views/UserManagement";
import DocumentManagement from "./Views/DocumentManagement";
import DocumentForm from "./Views/DocumentForm";
import DocumentView from "./Views/DocumentView";
import Sidebar from "./Components/Sidebar.jsx";
import AdminDashboard from "./Views/AdminDashboard.jsx"

// Layout with Sidebar
const SidebarLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

// Auth check for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// App component that doesn't use Redux hooks
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes with sidebar */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/documents" element={<DocumentManagement />} />
          <Route path="/documents/new" element={<DocumentForm />} />
          <Route path="/documents/edit/:id" element={<DocumentForm />} />
          <Route path="/documents/view/:id" element={<DocumentView />} />
          <Route path="/list" element={<ListView />} />
        </Route>

        {/* Redirect any unknown routes to landing page */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
