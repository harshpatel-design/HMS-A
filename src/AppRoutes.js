import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./feature/auth/Login";
import Dashboard from "./feature/Dashboard/Dashboard";
import Profile from "./feature/profile/Profile";

import AddEditDoctor from "./feature/doctor/AddEditDoctor";
import DoctorOnbordingList from "./feature/doctor/DoctorOnbordingList";

import RecipientOnboarding from "./feature/Recipient/RecipientOnbording";
import AddEditRecipient from "./feature/Recipient/AddEditRecipient";

import PatitentOnbordingList from "./feature/patitent/PatitentOnbordingList";
import AddEditPatient from "./feature/patitent/AddEditPatient";
import PatientView from "./feature/patitent/PatientView";

import AppointmentList from "./feature/appointment/AppointmentList";
import AddEditAppointment from "./feature/appointment/AddEditAppointment";

// ⭐ SERVICE PAGES
import ServiceList from "./feature/service/ServiceList";
import AddEditService from "./feature/service/AddEditService";

// Layouts
import MainLayout from "./feature/comman/MainLayout";
import Public from "./feature/comman/Public";
import PrivateRoute from "./feature/comman/PrivateRoute";

import ResetPassword from "./feature/auth/ResetPassword";
import ForgotPassword from "./feature/auth/ForgotPassword";

import RoomMaster from "./feature/master/RoomMaster";
import FloorMaster from "./feature/master/FloorList";
import DepartmentMaster from "./feature/master/DepartmentMaster";
import BedMaster from "./feature/master/BedMaster";
import AddEdtiFloor from "./feature/master/AddEdtiFloor";
import WardMaster from "./feature/master/WardMaster";
import LebTest from "./feature/master/LebTest";
import ChargeMaster from "./feature/chargemaster/ChargeMaster";

export function AppRoutes() {
    return (
        <Routes>
            {/* 🔐 Protected Routes (Login required) */}
            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* Doctor */}
                    <Route path="/add-edit-doctor" element={<AddEditDoctor />} />
                    <Route path="/add-edit-doctor/:id" element={<AddEditDoctor />} />
                    <Route path="/doctor-onbording" element={<DoctorOnbordingList />} />

                    {/* Recipient */}
                    <Route path="/recipient-onboarding" element={<RecipientOnboarding />} />
                    <Route path="/add-edit-recipient" element={<AddEditRecipient />} />
                    <Route path="/add-edit-recipient/:id" element={<AddEditRecipient />} />

                    {/* Patient */}
                    <Route path="/patitent-onboarding" element={<PatitentOnbordingList />} />
                    <Route path="/add-edit-patitent" element={<AddEditPatient />} />
                    <Route path="/add-edit-patitent/:id" element={<AddEditPatient />} />
                    <Route path="/view-patitent/:id" element={<PatientView />} />

                    {/* Appointments */}
                    <Route path="/appointments" element={<AppointmentList />} />
                    <Route path="/add-appointment" element={<AddEditAppointment />} />
                    <Route path="/edit-appointment/:id" element={<AddEditAppointment />} />

                    {/* ⭐ SERVICES ROUTES */}
                    <Route path="/services" element={<ServiceList />} />
                    <Route path="/add-service" element={<AddEditService />} />
                    <Route path="/edit-service/:id" element={<AddEditService />} />

                    {/* Master routes */}
                    <Route path="/room-master" element={<RoomMaster />} />
                    <Route path="/floor-master" element={<FloorMaster />} />
                    <Route path="/department-master" element={<DepartmentMaster />} />
                    <Route path="/bed-master" element={<BedMaster />} />
                    <Route path="/ward-master" element={<WardMaster />} />
                    <Route path="/lab-test" element={<LebTest />} />
                    <Route path="/add-edit-floor" element={<AddEdtiFloor />} />
                    <Route path="/add-edit-floor/:id" element={<AddEdtiFloor />} />

                    {/* Charge Master routes */}
                    <Route path="/charge-master" element={<ChargeMaster />} />

                </Route>
            </Route>

            {/* 🔓 Public Routes */}
            <Route element={<Public />}>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;
