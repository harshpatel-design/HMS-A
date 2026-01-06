import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Upload,
  InputNumber,
  Select,
  message,
  Spin,
  Collapse,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { fetchRecipientById, updateRecipient, createRecipient } from '../../slices/recipientSlice';

import Breadcrumbs from '../comman/Breadcrumbs';

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

export default function AddEditRecipient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [oldImage, setOldImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE URL ================= */
  const buildImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${process.env.REACT_APP_API_URL}/uploads/users/${img}`;
  };

  /* ================= LOAD DATA (EDIT) ================= */
  useEffect(() => {
    if (!isEdit) return;

    setLoading(true);
    dispatch(fetchRecipientById(id))
      .unwrap()
      .then((res) => {
        const recipient = res.recipient?.recipient || res.recipient || res.data || res;

        if (!recipient) return;

        form.setFieldsValue({
          name: recipient.name,
          email: recipient.email,
          phone: recipient.phone,
          gender: recipient.gender,
          age: recipient.age,
          status: recipient.status,
          salary: recipient.salary,
          shift: recipient.shift,
          time: recipient.time,
          address: recipient.address,
          emergencyContact: recipient.emergencyContact,
          aadharNumber: recipient.aadharNumber,
          panNumber: recipient.panNumber,
          note: recipient.note,
        });

        if (recipient.image) {
          setPreview(buildImageUrl(recipient.image));
          setOldImage(recipient.image);
        }
      })
      .catch(() => message.error('Failed to load recipient'))
      .finally(() => setLoading(false));
  }, [id, isEdit, dispatch, form]);

  /* ================= IMAGE ================= */
  const handleImageChange = (info) => {
    const file = info.file;
    if (!file || !file.type.startsWith('image/')) {
      return message.error('Only image files allowed');
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  /* ================= SUBMIT ================= */
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (isEdit && oldImage && !preview) {
        formData.append('image', '');
      }

      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });

      if (isEdit) {
        await dispatch(updateRecipient({ id, data: formData })).unwrap();
        message.success('Recipient updated successfully!');
      } else {
        await dispatch(createRecipient(formData)).unwrap();
        message.success('Recipient created successfully!');
      }

      navigate('/recipient-onboarding');
    } catch (error) {
      message.error(error?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const allPanelKeys = ['basic', 'job', 'personal'];

  return (
    <>
      {loading && <Spin fullscreen size="large" tip="Loading..." />}

      <Breadcrumbs
        title={isEdit ? 'Edit Recipient' : 'Add New Recipient'}
        showBack
        backTo="/recipient-onboarding"
        items={[
          { label: 'Recipients', href: '/recipient-onboarding' },
          { label: isEdit ? 'Edit Recipient' : 'Add New Recipient' },
        ]}
      />

      <div className="page-wrapper doctor-form-wrapper form-wrapper">
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Collapse
            {...(isEdit ? { activeKey: allPanelKeys } : { defaultActiveKey: ['basic'] })}
            accordion={false}
          >
            <Panel header="Basic Information" key="basic">
              <Row gutter={[16, 10]}>
                <Col xs={24} sm={24} md={24}>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleImageChange}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="recipient"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div>Upload Photo</div>
                      </div>
                    )}
                  </Upload>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="phone" label="Phone" rules={[{ len: 10, required: true }]}>
                    <Input maxLength={10} />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12} md={8}>
                  <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                    <Select>
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12} md={8}>
                  <Form.Item name="age" label="Age" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* ================= JOB INFO ================= */}
            <Panel header="Job Information" key="job">
              <Row gutter={[16, 10]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="shift" label="Shift" rules={[{ required: true }]}>
                    <Select>
                      <Option value="day">Day</Option>
                      <Option value="night">Night</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={12} md={8}>
                  <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12} md={8}>
                  <Form.Item name="time" label="Working Hours" rules={[{ required: true }]}>
                    <Input placeholder="10 AM - 6 PM" />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            <Panel header="Personal & Identity Info" key="personal">
              <Row gutter={[16, 10]}>
                <Col xs={24} md={12}>
                  <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="emergencyContact"
                    label="Emergency Contact"
                    rules={[{ len: 10, required: true }]}
                  >
                    <Input maxLength={10} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="aadharNumber"
                    label="Aadhar Number"
                    rules={[{ len: 12, required: true }]}
                  >
                    <Input maxLength={12} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="panNumber"
                    label="PAN Number"
                    rules={[
                      { required: true },
                      {
                        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: 'Invalid PAN',
                      },
                    ]}
                  >
                    <Input maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="note" label="Note">
                <TextArea rows={3} />
              </Form.Item>
            </Panel>
          </Collapse>


          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 , marginBottom:10}}>
            <Button
                htmlType="button"
                disabled={loading}
                onClick={() => navigate('/recipient-onboarding')}
              >
                Cancel
              </Button>
            <Button type="primary" htmlType="submit" className="btn">
              {isEdit ? 'Update Recipient' : 'Create Recipient'}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
