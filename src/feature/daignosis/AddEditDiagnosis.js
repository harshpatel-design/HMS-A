import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Form, Input, Row, Col, Button, Select, DatePicker, Collapse, message, Spin } from 'antd';

import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  createDiagnosis,
  getDiagnosisById,
  updateDiagnosisById,
  clearSelectedDiagnosis,
} from '../../slices/diagnosisSlice';

import { fetchDoctorsName } from '../../slices/doctorSlice';
import { fetchPatientName } from '../../slices/patientSlice';

import Breadcrumbs from '../comman/Breadcrumbs';
import { debounce } from 'lodash';

const { Panel } = Collapse;
const { Option } = Select;

export default function AddEditDiagnosis() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();

  const { loading, selectedDiagnosis } = useSelector((state) => state.diagnosis);
  const { doctorNames } = useSelector((state) => state.doctor);
  const { patientName } = useSelector((state) => state.patient);

  const patientss = patientName.patients;

  useEffect(() => {
    dispatch(fetchDoctorsName());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPatientName({ page: 1, limit: 1000, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      console.log(id);

      dispatch(getDiagnosisById(id));
    }
    return () => dispatch(clearSelectedDiagnosis());
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && selectedDiagnosis) {
      form.setFieldsValue({
        patient: selectedDiagnosis.patient?._id,
        doctor: selectedDiagnosis.doctor?._id,
        caseType: selectedDiagnosis.caseType,
        status: selectedDiagnosis.status,
        diagnosis: selectedDiagnosis.diagnosis,
        chiefComplaint: selectedDiagnosis.chiefComplaint,
        clinicalNotes: selectedDiagnosis.clinicalNotes,
        advice: selectedDiagnosis.advice,

        visitDate: selectedDiagnosis.visitDate ? dayjs(selectedDiagnosis.visitDate) : null,

        followUpDate: selectedDiagnosis.followUpDate ? dayjs(selectedDiagnosis.followUpDate) : null,
      });
    }
  }, [isEdit, selectedDiagnosis, form]);

  const onFinish = (values) => {
    const payload = {
      ...values,
      visitDate: values.visitDate?.toISOString(),
      followUpDate: values.followUpDate?.toISOString(),
    };

    const action = isEdit ? updateDiagnosisById({ id, payload }) : createDiagnosis(payload);

    dispatch(action)
      .unwrap()
      .then(() => {
        message.success(isEdit ? 'Diagnosis updated ✅' : 'Diagnosis created ✅');
        navigate('/diagnosis');
      })
      .catch((err) => {
        message.error(err || 'Validation failed ❌');
      });
  };

  const debouncedPatientSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchPatientName({ search: value }));
      }, 700),
    [dispatch]
  );
  const debouncedDoctorSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchDoctorsName(value));
      }, 700),
    [dispatch]
  );
  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Diagnosis"
        showBack
        backTo="/dashboard"
        items={[
          { label: 'Diagnosis List', href: '/diagnosis' },
          { label: isEdit ? 'Edit Diagnosis' : 'Add Diagnosis' },
        ]}
      />

      <Spin spinning={loading}>
        <Form layout="vertical" form={form} onFinish={onFinish} style={{ marginTop: 10 }}>
          <Collapse defaultActiveKey={['basic']}>
            <Panel header="Basic Details" key="basic">
              <Row gutter={[16, 10]}>
                <Col md={8}>
                  <Form.Item
                    name="patient"
                    label="Patient"
                    rules={[{ required: true, message: 'Patient is required' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Search patient"
                      filterOption={false}
                      onSearch={(value) => debouncedPatientSearch(value)}
                    >
                      {patientss?.map((p) => (
                        <Option key={p._id} value={p._id}>
                          {p.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={8}>
                  <Form.Item
                    name="doctor"
                    label="Doctor"
                    rules={[{ required: true, message: 'Doctor is required' }]}
                  >
                    <Select
                      showSearch
                      filterOption={false}
                      onSearch={(value) => debouncedDoctorSearch(value)}
                      placeholder="Select doctor"
                    >
                      {doctorNames?.map((d) => (
                        <Option key={d._id} value={d._id}>
                          {d.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={8}>
                  <Form.Item name="caseType" label="Case Type" rules={[{ required: true }]}>
                    <Select placeholder="Select case type">
                      <Option value="opd">OPD</Option>
                      <Option value="ipd">IPD</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={8}>
                  <Form.Item name="visitDate" label="Visit Date">
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(c) => c && c > dayjs().endOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col md={8}>
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
                <Col md={24}>
                  <Form.Item
                    name="diagnosis"
                    label="Diagnosis"
                    rules={[{ required: true, min: 3 }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>

                <Col md={24}>
                  <Form.Item name="chiefComplaint" label="Chief Complaint">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>

                <Col md={24}>
                  <Form.Item name="clinicalNotes" label="Clinical Notes">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>

                <Col md={24}>
                  <Form.Item name="advice" label="Advice">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>

                <Col md={8}>
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
              justifyContent: 'right',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <Button
              onClick={() => navigate('/diagnosis')}
              style={{ marginRight: 10, borderRadius: 5, height: 32 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="btn" loading={loading}>
              {isEdit ? 'Update Diagnosis' : 'Add Diagnosis'}
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
}
