import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import './App.css';
import Dashboard from './Pages/Dashboard';
import SlideBar from './Components/SlideBar';
import NavBar from './Components/NavBar';
import HierarchyTitle from './Pages/HierarchyTitle';
import DataHierarchy from './Pages/DataHierarchy';
import Signup from './Pages/Signup';
// import Server from './Pages/Server';
import Configure from './Pages/Configure';
import MeterMap from './Pages/MeterMap';
import AllMeters from './Pages/AllMeters';
import AddMeter from './Pages/AddMeter';
import MeterDetails from './Pages/MeterDetails';
import MappedMeter from './Pages/MappedMeters';
import SessionTimeout from './Components/SessionTimeOut';
import TestResult from './Pages/TestResult';
import './ChartConfig';
import BcsData from './Pages/BcsData';
import Profile from './Components/Profile';
import Support from './Components/Support';
import UserManagementPage from './Pages/UserManagementPage';
import { PermissionProvider } from './PermissionContext';
import AddUser from './Pages/AddUser';
import Modules from './Pages/Modules';
//import Forecast from './Pages/Forecast';
import Assign from './Pages/Assign';
import { AddUserDialog, EditUserDialog } from './Pages/Dialog'; // ✅
import AreaWiseMeters from './Pages/AreaWiseMeters';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

const ProtectedLayout = ({ children }) => (
  <div className="protected-layout">
    <NavBar />

    <div className="main-container">
      <SlideBar />

      <main className="content">{children}</main>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <PermissionProvider>
        <div className="app">
          <Routes>
            {/* Public Route */}
            <Route path="" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/areamanagement/hierarchytitles"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <HierarchyTitle />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/areamanagement/addhierarchy"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <DataHierarchy />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/configure/server"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Server />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/configure/addmeter"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <AddMeter />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/metermanagement/allmeters"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <AllMeters />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/metermanagement/meterconfiguration"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Configure />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/metermanagement/areawisemeters"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <AreaWiseMeters />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/metermanagement/metermapping"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <MeterMap />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meter-details/:consumerId/:meterId"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <MeterDetails />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configure/mappedmeters"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <MappedMeter />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-result/:meterIdentifier/:iotDeviceIdentifier"
              // /:meterIdentifier/:iotDeviceIdentifier
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <TestResult />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/bcstool/bcsdata"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <BcsData />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Profile />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Support />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/usermanagement/userlist"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <UserManagementPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/userlist/add"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <AddUser />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/usermanagement/addmodules"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Modules />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/userlist/assign-modules"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Assign />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </PermissionProvider>
    </Router>
  );
};

export default App;
