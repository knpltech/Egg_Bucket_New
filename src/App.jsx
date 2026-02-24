// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";

import AdminDashboard from "./pages/AdminDashboard";
import DailyDamages from "./pages/DailyDamages";
import Neccrate from "./pages/Neccrate";
import Dailysales from "./pages/Dailysales";
import Distributor from "./pages/Distributor";
import CashPayments from "./pages/CashPayments";
import DigitalPayments from "./pages/DigitalPayments";
import Outlets from "./pages/Outlets";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import DataEntry from "./pages/DataEntry";
import AreaEntry from "./pages/AreaEntry";   // ✅ NEW (Combined Entry Page)

import DataAgentDashboard from "./pages/DataAgentDashboard";
import ViewerData from "./pages/ViewerData";

import { DamageProvider } from "./context/DamageContext";
import { PanelProvider } from "./context/PanelContext";
import AdminLayoutWithPanel from "./layouts/AdminLayoutWithPanel";

function ProtectedRoute({ element, requiredRole }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const isAdmin =
    user &&
    (user.role === "Admin" ||
      (Array.isArray(user.roles) && user.roles.includes("admin")));

  const isViewer =
    user &&
    (user.role === "Viewer" ||
      (Array.isArray(user.roles) && user.roles.includes("viewer")));

  const dataAgentRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  if (
    isAdmin ||
    !requiredRole ||
    dataAgentRoles.includes(requiredRole) ||
    isViewer
  ) {
    return element;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <DamageProvider>
      <PanelProvider>
        <BrowserRouter>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <AdminDashboard />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            {/* DATA ENTRY MAIN PAGE (AREA POPUP) */}
            <Route
              path="/admin/data-entry"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <DataEntry />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            {/* ✅ NEW COMBINED AREA ENTRY PAGE */}
            <Route
              path="/admin/area-entry"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <AreaEntry />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            {/* EXISTING REPORT PAGES */}
            <Route
              path="/admin/damages"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <DailyDamages />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/neccrate"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <Neccrate />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/dailysales"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <Dailysales />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/distribution"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <Distributor />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/cash-payments"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <CashPayments />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/digital-payments"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <DigitalPayments />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/outlets"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <Outlets />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <Users />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute
                  element={
                    <AdminLayoutWithPanel>
                      <Reports />
                    </AdminLayoutWithPanel>
                  }
                />
              }
            />

            {/* DATA AGENT */}
            <Route path="/dashboard" element={<DataAgentDashboard />} />
            <Route path="/viewer/data" element={<ViewerData />} />

          </Routes>
        </BrowserRouter>
      </PanelProvider>
    </DamageProvider>
  );
}

export default App;
