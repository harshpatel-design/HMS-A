import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

const Login = lazy(() => import('./feature/auth/Login'));
const ResetPassword = lazy(() => import('./feature/auth/ResetPassword'));
const ForgotPassword = lazy(() => import('./feature/auth/ForgotPassword'));

const MainLayout = lazy(() => import('./feature/comman/MainLayout'));
const Public = lazy(() => import('./feature/comman/Public'));
const PrivateRoute = lazy(() => import('./feature/comman/PrivateRoute'));

const Dashboard = lazy(() => import('./feature/Dashboard/Dashboard'));
const Profile = lazy(() => import('./feature/profile/Profile'));

const AddEditDoctor = lazy(() => import('./feature/doctor/AddEditDoctor'));
const DoctorOnbordingList = lazy(() => import('./feature/doctor/DoctorOnbordingList'));
const ViewDoctor = lazy(() => import('./feature/doctor/ViewDoctor'));

const RecipientOnboarding = lazy(() => import('./feature/Recipient/RecipientOnbording'));
const AddEditRecipient = lazy(() => import('./feature/Recipient/AddEditRecipient'));

const PatitentOnbordingList = lazy(() => import('./feature/patitent/PatitentOnbordingList'));
const AddEditPatient = lazy(() => import('./feature/patitent/AddEditPatient'));
const PatientView = lazy(() => import('./feature/patitent/PatientView'));

const PatientVisit = lazy(() => import('./feature/patientvisit/PatientVisit'));

const AppointmentList = lazy(() => import('./feature/appointment/AppointmentList'));
const AddEditAppointment = lazy(() => import('./feature/appointment/AddEditAppointment'));

const ServiceList = lazy(() => import('./feature/service/ServiceList'));
const AddEditService = lazy(() => import('./feature/service/AddEditService'));

const RoomMaster = lazy(() => import('./feature/master/RoomMaster'));
const FloorMaster = lazy(() => import('./feature/master/FloorList'));
const DepartmentMaster = lazy(() => import('./feature/master/DepartmentMaster'));
const BedMaster = lazy(() => import('./feature/master/BedMaster'));
const AddEdtiFloor = lazy(() => import('./feature/master/AddEdtiFloor'));
const WardMaster = lazy(() => import('./feature/master/WardMaster'));
const LebTest = lazy(() => import('./feature/master/LebTest'));
const MedicineList = lazy(() => import('./feature/master/MedicineList'));

const ChargeMaster = lazy(() => import('./feature/chargemaster/ChargeMaster'));
const ChargeList = lazy(() => import('./feature/charge/ChargeList'));
const ChargeByPatient = lazy(() => import('./feature/charge/ChargeByPatient'));
const ReceiveCharge = lazy(() => import('./feature/charge/ReceiveCharge'));
const PatientPaymentHistoryPage = lazy(() => import('./feature/charge/PatientPaymentHistoryPage'));
const PatientLedger = lazy(() => import('./feature/charge/Patientledger'));

const IpdAddmissionList = lazy(() => import('./feature/ipdadmission/IpdAddmissionList'));

const DoctorWaitingListPage = lazy(() => import('./feature/waittingList/DoctorWaitingListPage'));

const DiagnosisList = lazy(() => import('./feature/daignosis/DiagnosisList'));
const AddEditDiagnosis = lazy(() => import('./feature/daignosis/AddEditDiagnosis'));
const AddDiagnosis = lazy(() => import('./feature/daignosis/AddDiagnosis'));
const ViewDiagnosis = lazy(() => import('./feature/daignosis/ViewDiagnosis'));

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <Spin size="large" />
    </div>
  );
};

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/add-edit-doctor" element={<AddEditDoctor />} />

            <Route path="/add-edit-doctor/:id" element={<AddEditDoctor />} />

            <Route path="/doctor-onbording" element={<DoctorOnbordingList />} />

            <Route path="/view-doctor/:id" element={<ViewDoctor />} />

            <Route path="/recipient-onboarding" element={<RecipientOnboarding />} />

            <Route path="/add-edit-recipient" element={<AddEditRecipient />} />

            <Route path="/add-edit-recipient/:id" element={<AddEditRecipient />} />

            <Route path="/patitent-onboarding" element={<PatitentOnbordingList />} />

            <Route path="/add-edit-patitent" element={<AddEditPatient />} />

            <Route path="/add-edit-patitent/:id" element={<AddEditPatient />} />

            <Route path="/view-patitent/:id" element={<PatientView />} />

            <Route path="/patient-visit" element={<PatientVisit />} />

            <Route path="/appointments" element={<AppointmentList />} />

            <Route path="/add-appointment" element={<AddEditAppointment />} />

            <Route path="/edit-appointment/:id" element={<AddEditAppointment />} />

            <Route path="/services" element={<ServiceList />} />

            <Route path="/add-service" element={<AddEditService />} />

            <Route path="/edit-service/:id" element={<AddEditService />} />

            <Route path="/room-master" element={<RoomMaster />} />

            <Route path="/floor-master" element={<FloorMaster />} />

            <Route path="/department-master" element={<DepartmentMaster />} />

            <Route path="/bed-master" element={<BedMaster />} />

            <Route path="/ward-master" element={<WardMaster />} />

            <Route path="/lab-test" element={<LebTest />} />

            <Route path="/medicine" element={<MedicineList />} />

            <Route path="/add-edit-floor" element={<AddEdtiFloor />} />

            <Route path="/add-edit-floor/:id" element={<AddEdtiFloor />} />

            <Route path="/ipd-patient-list" element={<IpdAddmissionList />} />

            <Route path="/charge-master" element={<ChargeMaster />} />

            <Route path="/charge-list" element={<ChargeList />} />

            <Route path="/chargeby-patient/:id" element={<ChargeByPatient />} />

            <Route path="/receive-charge" element={<ReceiveCharge />} />

            <Route path="/receive-charge/:id" element={<ReceiveCharge />} />

            <Route path="/patient-payment-history/:id" element={<PatientPaymentHistoryPage />} />

            <Route path="/patient-ledger" element={<PatientLedger />} />
            <Route path="/watting-list" element={<DoctorWaitingListPage />} />

            <Route path="/diagnosis" element={<DiagnosisList />} />

            <Route path="/view-diagnosis/:patientId" element={<ViewDiagnosis />} />

            <Route path="/add-diagnosis/:patientId/:doctorId" element={<AddDiagnosis />} />

            <Route path="/add-edit-diagnosis" element={<AddEditDiagnosis />} />

            <Route path="/add-edit-diagnosis/:id" element={<AddEditDiagnosis />} />
          </Route>
        </Route>

        <Route element={<Public />}>
          <Route path="/login" element={<Login />} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/forget-password" element={<ForgotPassword />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
