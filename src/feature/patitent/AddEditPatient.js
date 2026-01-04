import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Collapse,
  InputNumber,
  Upload,
  message,
  Spin,
} from 'antd';

import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPatient, fetchPatientById, updatePatient } from '../../slices/patientSlice';
import Breadcrumbs from '../comman/Breadcrumbs';

const { Panel } = Collapse;
const { Option } = Select;

export default function AddEditPatient() {
  const dispatch = useDispatch();
  const { id } = useParams(); // 👈 URL se id
  const isEdit = Boolean(id);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { loading, patient } = useSelector((state) => state.patient);
  const handleValuesChange = () => {};

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchPatientById(id));
    }
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && patient) {
      form.setFieldsValue({
        ...patient,

        dob: patient.dob ? dayjs(patient.dob) : null,

        insurance: patient.insurance
          ? {
              ...patient.insurance,
              expiryDate: patient.insurance.expiryDate ? dayjs(patient.insurance.expiryDate) : null,
            }
          : undefined,
      });
    }
  }, [isEdit, patient, form]);

  const allPanels = [
    'basic',
    'address',
    'vitals',
    'notes',
    'documents',
    'guardian',
    'emergencyContact',
    'insurance',
    'chronicDiseases',
    'medicalHistory',
    'allergies',
  ];

  const onFinishFailed = ({ errorFields }) => {
    if (!Array.isArray(errorFields)) return;

    errorFields.forEach((field) => {
      if (Array.isArray(field.errors) && field.errors.length > 0) {
        message.error(field.errors[0]);
      }
    });
  };

  const onFinish = (values) => {
    const payload = {
      ...values,
    };

    if (values.dob) {
      payload.dob = values.dob.toISOString();
    } else {
      delete payload.dob; // 🔥 null kabhi mat bhejo
    }

    /* ===================== ARRAYS ===================== */
    const toArray = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((i) => i.trim());
      return [];
    };

    payload.allergies = toArray(values.allergies);
    payload.medicalHistory = toArray(values.medicalHistory);
    payload.chronicDiseases = toArray(values.chronicDiseases);

    /* ===================== INSURANCE DATE ===================== */
    if (values.insurance?.expiryDate) {
      payload.insurance = {
        ...values.insurance,
        expiryDate: values.insurance.expiryDate.toISOString(),
      };
    }

    if (Array.isArray(values.documents)) {
      payload.documents = values.documents.map((f) => f.originFileObj).filter(Boolean);
    }

    console.log('✅ FINAL PAYLOAD:', payload);

    dispatch(createPatient(payload))
      .unwrap()
      .then(() => {
        message.success('Patient created successfully ✅');
        navigate('/patient-onboarding');
      })
      .catch((err) => {
        message.error(err || 'Validation failed ❌');
      });
  };

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title="Patient List"
          showBack
          backTo="/dashboard"
          items={[
            { label: 'Patient List', href: '/patitent-onboarding' },
            { label: 'Add-Edit Patient List' },
          ]}
        />

        <Spin spinning={loading} tip="Saving patient...">
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            onValuesChange={handleValuesChange}
            onFinishFailed={onFinishFailed}
          >
            <Collapse defaultActiveKey={allPanels} accordion={false}>
              <Panel header="Basic Information" key="basic">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name="firstName"
                      label="First Name"
                      rules={[{ required: true, message: 'First name is required' }]}
                    >
                      <Input placeholder="Enter first name" />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name="lastName" label="Last Name">
                      <Input placeholder="Enter last name" />
                    </Form.Item>
                  </Col>

                  <Col xs={16} sm={12} md={8}>
                    <Form.Item name="dob" label="Date of Birth">
                      <DatePicker placeholder="Select date of birth" />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={12} md={8}>
                    <Form.Item
                      name="age"
                      label="Age"
                      rules={[{ required: true, message: 'Age is required' }]}
                    >
                      <InputNumber
                        placeholder="Enter age"
                        min={0}
                        max={120}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                      <Select placeholder="Select gender">
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name="bloodGroup" label="Blood Group">
                      <Select placeholder="Select blood group" allowClear>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                          <Option key={bg} value={bg}>
                            {bg}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name="phone"
                      label="Phone"
                      rules={[
                        { required: true, message: 'Phone number is required' },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: 'Phone number must be exactly 10 digits',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter 10 digit phone number"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name="altPhone"
                      label="Alt Phone"
                      rules={[
                        {
                          pattern: /^[0-9]{10}$/,
                          message: 'Phone number must be exactly 10 digits',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter 10 digit phone number"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        {
                          type: 'email',
                          message: 'Please enter a valid email address',
                        },
                      ]}
                    >
                      <Input placeholder="Enter email address" autoComplete="email" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Address" key="address">
                <Row gutter={[16, 10]}>
                  <Col span={24}>
                    <Form.Item name={['address', 'line1']} label="Line 1">
                      <Input placeholder="House / Flat / Street" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name={['address', 'line2']} label="Line 2">
                      <Input placeholder="Landmark / Area" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name={['address', 'city']} label="City">
                      <Input placeholder="Enter city" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name={['address', 'state']} label="State">
                      <Input placeholder="Enter state" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name={['address', 'zip']} label="ZIP">
                      <Input placeholder="Enter pincode" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name={['address', 'country']} label="Country">
                      <Input placeholder="Enter country" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Vitals" key="vitals">
                <Row gutter={[16, 10]}>
                  <Col xs={12} md={8}>
                    <Form.Item
                      name={['vitals', 'height']}
                      label="Height (cm)"
                      rules={[
                        {
                          type: 'number',
                          min: 30,
                          max: 300,
                          message: 'Height must be between 30–300 cm',
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder="Enter height in cm"
                        min={30}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={12} md={8}>
                    <Form.Item
                      name={['vitals', 'weight']}
                      label="Weight (kg)"
                      rules={[
                        {
                          type: 'number',
                          min: 1,
                          max: 500,
                          message: 'Weight must be between 1–500 kg',
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder="Enter weight in kg"
                        style={{ width: '100%' }}
                        min={1}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitals', 'bloodPressure']}
                      label="Blood Pressure"
                      rules={[
                        {
                          pattern: /^[0-9]{2,3}\/[0-9]{2,3}$/,
                          message: 'Format should be like 120/80',
                        },
                      ]}
                    >
                      <Input placeholder="120/80" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Documents" key="documents">
                <Form.Item
                  name="documents"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload
                    multiple
                    accept=".pdf,image/*"
                    listType="text"
                    beforeUpload={(file) => {
                      const isValid =
                        file.type === 'application/pdf' || file.type.startsWith('image/');

                      if (!isValid) {
                        message.error('Only PDF or Image files are allowed');
                        return Upload.LIST_IGNORE;
                      }

                      return false; // stop auto upload
                    }}
                  >
                    <Button type="dashed" block>
                      Upload PDF / Image
                    </Button>
                  </Upload>
                </Form.Item>
              </Panel>

              <Panel header="Medical History" key="medicalHistory">
                <Form.Item name="medicalHistory">
                  <Input placeholder="Diabetes, Hypertension" />
                </Form.Item>
              </Panel>

              <Panel header="Guardian Information" key="guardian">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['guardian', 'name']} label="Name">
                      <Input placeholder="Guardian name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name={['guardian', 'phone']}
                      label="Phone"
                      rules={[
                        {
                          pattern: /^[0-9]{10}$/,
                          message: 'Phone number must be exactly 10 digits',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter 10 digit phone number"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['guardian', 'relation']} label="Relation">
                      <Input placeholder="Father / Mother / Spouse" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Emergency Contact" key="emergencyContact">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['emergencyContact', 'name']} label="Name">
                      <Input placeholder="Emergency contact name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name={['emergencyContact', 'phone']}
                      label="Phone"
                      rules={[
                        {
                          pattern: /^[0-9]{10}$/,
                          message: 'Phone number must be exactly 10 digits',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Emergency phone number"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['emergencyContact', 'relation']} label="Relation">
                      <Input placeholder="Relation with patient" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Insurance Details" key="insurance">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['insurance', 'provider']} label="Provider">
                      <Input placeholder="Insurance provider name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['insurance', 'policyNumber']} label="Policy Number">
                      <Input placeholder="Enter policy number" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item name={['insurance', 'expiryDate']} label="Expiry Date">
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Select expiry date"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Chronic Diseases" key="chronicDiseases">
                <Form.Item name="chronicDiseases">
                  <Input placeholder="Asthma, Arthritis" />
                </Form.Item>
              </Panel>

              <Panel header="Allergies" key="allergies">
                <Form.Item name="allergies">
                  <Input placeholder="Dust, Pollen, Penicillin" />
                </Form.Item>
              </Panel>

              <Panel header="Notes" key="notes">
                <Form.Item name="notes">
                  <Input.TextArea rows={4} placeholder="Enter additional notes" />
                </Form.Item>
              </Panel>
            </Collapse>

            <div
              style={{ marginTop: 20, display: 'flex', justifyContent: 'end', marginBottom: 10 }}
            >
              <Button
                htmlType="button"
                disabled={loading}
                onClick={() => navigate('/patitent-onboarding')}
              >
                Cancel
              </Button>
              <Button type="primary" className="btn" htmlType="submit" loading={loading}>
                {isEdit ? 'Update Patient' : 'Add Patient'}
              </Button>
            </div>
          </Form>
        </Spin>
      </div>
    </>
  );
}
