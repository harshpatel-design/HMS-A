import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Select,
  Collapse,
  TimePicker,
  DatePicker,
  message,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../comman/Breadcrumbs';

import {
  createAppointment,
  updateAppointment,
  fetchAppointmentById,
} from '../../slices/appointmentSlice';
import { fetchDepartments } from '../../slices/departmentSlice';
import { fetchChargeMasters } from '../../slices/chargeMasterSlice';

import doctorService from '../../services/doctorService';
import patientService from '../../services/patientService';
import appointmentService from '../../services/appointmentService';
import debounce from 'lodash/debounce';

const { TextArea } = Input;

export default function AddEditAppointment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form] = Form.useForm();
  const { appointment } = useSelector((state) => state.appointment);
  const { chargeMasters, loading: chargeLoading } = useSelector((state) => state.chargeMaster);
  const { departments, loading: deptLoading } = useSelector((state) => state.department);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const selectedDoctor = Form.useWatch('doctor', form);
  const appointmentDate = Form.useWatch('appointmentDate', form);
  const startTime = Form.useWatch('startTime', form);
  const endTime = Form.useWatch('endTime', form);

  const checkDoctorAvailabilityLive = async () => {
    if (!selectedDoctor || !appointmentDate || !startTime || !endTime) return;

    const payload = {
      doctorId: selectedDoctor,
      appointmentDate: appointmentDate.format('YYYY-MM-DD'),
      timeSlot: {
        start: startTime.format('HH:mm'),
        end: endTime.format('HH:mm'),
      },
      ...(isEdit && { excludeId: id }),
    };

    try {
      const res = await appointmentService.checkAvailability(payload);

      if (!res.available) {
        message.error(res.message || 'No doctor is available at this time');
        form.setFieldsValue({
          startTime: null,
          endTime: null,
        });
      }
    } catch (err) {
      message.error(err.message || 'Availability check failed');
    }
  };

  useEffect(() => {
    const debouncedFn = debounce(checkDoctorAvailabilityLive, 500);
    debouncedFn();
    return () => debouncedFn.cancel();
  }, [selectedDoctor, appointmentDate, startTime, endTime]);

  useEffect(() => {
    if (isEdit) dispatch(fetchAppointmentById(id));
  }, [id, dispatch, isEdit]);

  const loadDepartments = () => {
    if (departments.length) return;

    dispatch(fetchDepartments({ page: 1, limit: 100 }));
  };
  const loadChargeMasters = () => {
    if (chargeMasters.length) return;

    dispatch(
      fetchChargeMasters({
        page: 1,
        limit: 100,
        chargeType: 'consultancy',
      })
    );
  };
  useEffect(() => {
    if (!isEdit || !appointment) return;

    setPatients((prev) => {
      if (prev.some((p) => p.value === appointment.patient?._id)) return prev;

      return [
        ...prev,
        {
          label: `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`,
          value: appointment.patient?._id,
        },
      ];
    });

    setDoctors((prev) => {
      if (prev.some((d) => d.value === appointment.doctor?._id)) return prev;
      loadChargeMasters();
      return [
        ...prev,
        {
          label: appointment.doctor?.user?.name || 'Doctor',
          value: appointment.doctor?._id,
        },
      ];
    });

    dispatch(fetchDepartments({ page: 1, limit: 100 }));

    form.setFieldsValue({
      patient: appointment.patient?._id || null,
      doctor: appointment.doctor?._id || null,
      department: appointment.department?._id || null,
      charge: appointment.charge?._id || null,

      appointmentDate: appointment.appointmentDate ? dayjs(appointment.appointmentDate) : null,

      startTime: appointment.timeSlot?.start ? dayjs(appointment.timeSlot.start, 'HH:mm') : null,

      endTime: appointment.timeSlot?.end ? dayjs(appointment.timeSlot.end, 'HH:mm') : null,

      caseStatus: appointment.caseStatus || 'appointment',
      consultationType: appointment.consultationType || 'in-person',
      status: appointment.status || 'scheduled',
      notes: appointment.notes || '',
    });
  }, [appointment, isEdit, dispatch, form]);

  const loadDoctors = async () => {
    if (doctors.length) return;
    const res = await doctorService.getDoctorNames();
    setDoctors(res.doctors?.map((d) => ({ label: d.name, value: d._id })) || []);
  };
  const loadPatients = async () => {
    if (patients.length === 0) {
      const res = await patientService.getPatientNames({ search: '' });
      setPatients(
        res.patients?.map((p) => ({
          label: `${p.name}`,
          value: p._id,
        })) || []
      );
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        patient: values.patient,
        doctor: values.doctor,
        department: values.department,
        charge: values.charge,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        timeSlot: {
          start: values.startTime.format('HH:mm'),
          end: values.endTime.format('HH:mm'),
        },
        caseStatus: values.caseStatus,
        consultationType: values.consultationType,
        status: values.status,
        notes: values.notes || '',
      };

      if (isEdit) {
        await dispatch(updateAppointment({ id, data: payload })).unwrap();
        message.success('Appointment updated successfully');
      } else {
        await dispatch(createAppointment(payload)).unwrap();
        message.success('Appointment created successfully');
      }

      navigate('/appointments');
    } catch (err) {
      message.error(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        {loading && <Spin fullscreen tip="Processing..." />}

        <Breadcrumbs
          title={isEdit ? 'Edit Appointment' : 'Add Appointment'}
          showBack
          backTo="/appointments"
          items={[
            { label: 'Appointments', href: '/appointments' },
            { label: isEdit ? 'Edit Appointment' : 'Add Appointment' },
          ]}
        />

        <div className="form-wrapper">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Collapse
              defaultActiveKey={['basic']}
              accordion={false}
              items={[
                {
                  key: 'basic',
                  label: 'Basic Information',
                  children: (
                    <Row gutter={[16, 12]}>
                      <Col md={6} xs={24}>
                        <Form.Item label="Patient" name="patient" rules={[{ required: true }]}>
                          <Select
                            showSearch
                            allowClear
                            placeholder="Select Patient"
                            onClick={loadPatients}
                            options={patients}
                          />
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item label="Doctor" name="doctor" rules={[{ required: true }]}>
                          <Select
                            showSearch
                            allowClear
                            placeholder="Select Doctor"
                            onClick={loadDoctors}
                            options={doctors}
                          />
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Consultation Type"
                          name="consultationType"
                          allowClear
                          rules={[{ required: true }]}
                        >
                          <Select allowClear placeholder="Select Consultation Type">
                            <Select.Option value="in-person">In Person</Select.Option>
                            <Select.Option value="online">Online</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Department"
                          name="department"
                          rules={[{ required: true, message: 'Department is required' }]}
                        >
                          <Select
                            showSearch
                            placeholder="Select Department"
                            loading={deptLoading}
                            allowClear
                            onClick={loadDepartments}
                            options={departments.map((d) => ({
                              label: d.name,
                              value: d._id,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },

                {
                  key: 'schedule',
                  label: 'Appointment Schedule',
                  children: (
                    <Row gutter={[16, 12]}>
                      <Col md={6} xs={24}>
                        <Form.Item label="Date" name="appointmentDate" rules={[{ required: true }]}>
                          <DatePicker
                            format="YYYY-MM-DD"
                            disabledDate={(d) => d && d < dayjs().startOf('day')}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item label="Start Time" name="startTime" rules={[{ required: true }]}>
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item label="End Time" name="endTime" rules={[{ required: true }]}>
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },

                {
                  key: 'case',
                  label: 'Case & Status',
                  children: (
                    <Row gutter={[16, 12]}>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Case Status"
                          name="caseStatus"
                          rules={[{ required: true }]}
                        >
                          <Select allowClear placeholder="Select Case Status">
                            <Select.Option value="appointment">Appointment</Select.Option>
                            <Select.Option value="new">New</Select.Option>
                            <Select.Option value="followup">Follow-up</Select.Option>
                            <Select.Option value="emergency">Emergency</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                          <Select allowClear placeholder="Select Status"  >
                            <Select.Option value="scheduled">Scheduled</Select.Option>
                            <Select.Option value="checked-in">Checked-in</Select.Option>
                            <Select.Option value="completed">Completed</Select.Option>
                            <Select.Option value="cancelled">Cancelled</Select.Option>
                            <Select.Option value="no-show">No Show</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Consultation Charge"
                          name="charge"
                          rules={[{ required: true, message: 'Charge is required' }]}
                        >
                          <Select
                            showSearch
                            placeholder="Select Charge"
                            loading={chargeLoading}
                            allowClear
                            onClick={loadChargeMasters}
                            optionFilterProp="label"
                            options={chargeMasters.map((c) => ({
                              label: `${c.name} - ₹${c.amount}`,
                              value: c._id,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },

                {
                  key: 'notes',
                  label: 'Notes',
                  children: (
                    <Form.Item name="notes">
                      <TextArea rows={3} placeholder="Additional notes" />
                    </Form.Item>
                  ),
                },
              ]}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              <Button onClick={() => navigate('/appointments')} style={{ marginRight: 10 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="btn">
                {isEdit ? 'Update Appointment' : 'Create Appointment'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
