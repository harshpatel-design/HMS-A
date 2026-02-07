import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import doctorReducer from './slices/doctorSlice';
import recipientReducer from './slices/recipientSlice';
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';
import serviceReducer from './slices/serviceSlice';
import floorReducer from './slices/floorSlice';
import wardReducer from './slices/wardSlice';
import roomReducer from './slices/roomSlice';
import bedReducer from './slices/badSlice';
import labTestReducer from './slices/labTestSlice';
import chargeMasterReducer from './slices/chargeMasterSlice';
import departmentReducer from './slices/departmentSlice';
import patientVisitReducer from './slices/patientVisitSlice';
import chargeReducer from './slices/chargeSlice';
import ipdReducer from './slices/ipdAdmission.slice';
import paymentReducer from './slices/payment.slice';
import waitingListReducer from './slices/waitingListSlice';

const rootReducer = {
  auth: authReducer,
  doctor: doctorReducer,
  recipient: recipientReducer,
  patient: patientReducer,
  appointment: appointmentReducer,
  service: serviceReducer,
  floor: floorReducer,
  ward: wardReducer,
  room: roomReducer,
  bed: bedReducer,
  labTest: labTestReducer,
  chargeMaster: chargeMasterReducer,
  department: departmentReducer,
  patientVisit: patientVisitReducer,
  charge: chargeReducer,
  ipd: ipdReducer,
  payment: paymentReducer,
  waitingList: waitingListReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
