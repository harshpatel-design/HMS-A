import React, { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Form, Input, Row, Col, Button, Select, DatePicker, Collapse, message, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { createDiagnosis } from '../../slices/diagnosisSlice';
import { fetchDoctorsName } from '../../slices/doctorSlice';
import { fetchPatientById, fetchPatientName } from '../../slices/patientSlice';

import Breadcrumbs from '../comman/Breadcrumbs';
import { debounce } from 'lodash';

const { Panel } = Collapse;
const { Option } = Select;

export default function AddDiagnosis() {
  const { id: patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { loading } = useSelector((state) => state.diagnosis);
  const { doctorNames } = useSelector((state) => state.doctor);
  const { patientName } = useSelector((state) => state.patient);
  const { selectedPatient } = useSelector((state) => state.patient);

  const doctors = localStorage.getItem('user.id');

  console.log(doctors);

  const patients = patientName?.patients || [];
  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
    }
  }, [patientId, dispatch]);

  useEffect(() => {
    dispatch(fetchDoctorsName());
    dispatch(fetchPatientName({ page: 1, limit: 20, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPatient && patientId) {
      form.setFieldsValue({
        patient: selectedPatient._id,
      });
    }
  }, [selectedPatient, patientId, form]);

  const debouncedDoctorSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchDoctorsName(value));
      }, 500),
    [dispatch]
  );

  const onFinish = (values) => {
    const payload = {
      ...values,
      visitDate: values.visitDate?.toISOString(),
      followUpDate: values.followUpDate?.toISOString(),
    };

    dispatch(createDiagnosis(payload))
      .unwrap()
      .then(() => {
        message.success('Diagnosis created successfully ✅');
        navigate('/diagnosis');
      })
      .catch((err) => {
        message.error(err || 'Validation failed ❌');
      });
  };

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Add Diagnosis"
        showBack
        backTo="/diagnosis"
        items={[{ label: 'Diagnosis List', href: '/diagnosis' }, { label: 'Add Diagnosis' }]}
      />

      <Spin spinning={loading}>
        <Form layout="vertical" form={form} onFinish={onFinish} style={{ marginTop: 10 }}>
          <Collapse defaultActiveKey={['basic']}>
            <Panel header="Basic Details" key="basic">
              <Row gutter={[16, 10]}>
                <Col md={8} xs={24}>
                  <Form.Item
                    name="patient"
                    label="Patient"
                    rules={[{ required: true, message: 'Patient is required' }]}
                  >
                    <Select
                      showSearch
                      disabled={!!patientId}
                      placeholder="Select patient"
                      optionFilterProp="children"
                    >
                      {selectedPatient && (
                        <Option value={selectedPatient._id}>
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </Option>
                      )}

                      {!patientId &&
                        patients.map((p) => (
                          <Option key={p._id} value={p._id}>
                            {p.firstName} {p.lastName}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={8} xs={24}>
                  <Form.Item
                    name="doctor"
                    label="Doctor"
                    rules={[{ required: true, message: 'Doctor is required' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select doctor"
                      filterOption={false}
                      onSearch={debouncedDoctorSearch}
                    >
                      {doctorNames?.map((d) => (
                        <Option key={d._id} value={d._id}>
                          {d.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={8} xs={24}>
                  <Form.Item name="caseType" label="Case Type" rules={[{ required: true }]}>
                    <Select placeholder="Select case type">
                      <Option value="opd">OPD</Option>
                      <Option value="ipd">IPD</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={8} xs={24}>
                  <Form.Item name="visitDate" label="Visit Date">
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(c) => c && c > dayjs().endOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col md={8} xs={24}>
                  <Form.Item name="status" label="Status">
                    <Select>
                      <Option value="draft">Draft</Option>
                      <Option value="completed">Completed</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            <Panel header="Medical Details" key="medical">
              <Row gutter={[16, 10]}>
                <Col md={24} xs={24}>
                  <Form.Item
                    name="diagnosis"
                    label="Diagnosis"
                    rules={[{ required: true, min: 3 }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>

                <Col md={24} xs={24}>
                  <Form.Item name="chiefComplaint" label="Chief Complaint">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>

                <Col md={24} xs={24}>
                  <Form.Item name="clinicalNotes" label="Clinical Notes">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>

                <Col md={24} xs={24}>
                  <Form.Item name="advice" label="Advice">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>

                <Col md={8} xs={24}>
                  <Form.Item name="followUpDate" label="Follow-up Date">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 20,
            }}
          >
            <Button onClick={() => navigate('/diagnosis')} style={{ marginRight: 10 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="btn" loading={loading}>
              Add Diagnosis
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
}
