import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  Divider,
  Space,
  Typography,
  message,
} from 'antd';

import { createService, updateService, fetchServiceById } from '../../slices/serviceSlice';

import serviceNameService from '../../services/serviceNameService';

import departmentService from '../../services/departmentService';

const { TextArea } = Input;
const { Title } = Typography;

const AddEditService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [serviceNameList, setServiceNameList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  const { service, loading } = useSelector((state) => state.service);

  const [form] = Form.useForm();

  useEffect(() => {
    if (isEdit) dispatch(fetchServiceById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (isEdit && service) {
      form.setFieldsValue({
        serviceName: service.serviceName,
        department: service.department,
        price: service.price,
        description: service.description,
      });

      ensureSelectedOptions(service);
    }
  }, [service]);

  const ensureSelectedOptions = (service) => {
    if (service?.serviceName) {
      setServiceNameList((prev) => {
        const exists = prev.some((s) => s.value === service.serviceName);
        return exists
          ? prev
          : [...prev, { label: service.serviceName, value: service.serviceName }];
      });
    }

    if (service?.department) {
      setDepartmentList((prev) => {
        const exists = prev.some((d) => d.value === service.department);
        return exists ? prev : [...prev, { label: service.department, value: service.department }];
      });
    }
  };

  const loadServiceNames = async () => {
    if (serviceNameList.length > 0) return;

    try {
      const response = await serviceNameService.getServiceNames();
      const names = response?.services || [];
      const options = names.map((name) => ({
        label: name,
        value: name,
      }));

      setServiceNameList(options);
    } catch (error) {
      console.error('Error loading service names:', error);
      message.error('Failed to load service names');
    }
  };

  const loadDepartments = async () => {
    if (departmentList.length > 0) return;

    try {
      const response = await departmentService.getDepartments();

      const departments = response?.departments || [];

      const options = departments.map((d) => ({
        label: d,
        value: d,
      }));

      setDepartmentList(options);
    } catch (error) {
      console.error('Error loading departments:', error);
      message.error('Failed to load departments');
    }
  };
  const onFinish = async (values) => {
    const payload = {
      serviceName: values.serviceName,
      department: values.department,
      price: Number(values.price),
      description: values.description || '',
    };

    try {
      if (isEdit) {
        await dispatch(updateService({ id, data: payload })).unwrap();
        message.success('Service updated successfully');
      } else {
        await dispatch(createService(payload)).unwrap();
        message.success('Service created successfully');
      }

      navigate('/services');
    } catch (err) {
      message.error(err?.message || 'Failed to save service');
    }
  };

  return (
    <div className="p-6">
      <Card style={{ borderRadius: 12 }}>
        <Title level={3}>{isEdit ? 'Edit Service' : 'Create Service'}</Title>

        <Divider />

        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="serviceName" label="Service Name" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Service Name"
                  onFocus={loadServiceNames}
                  options={serviceNameList}
                  showSearch
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Department"
                  onFocus={loadDepartments}
                  options={departmentList}
                  showSearch
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}>
                <Input type="number" placeholder="Enter Price" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Service Description" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => navigate('/services')}
                style={{
                  borderRadius: 8,
                  padding: '6px 14px',
                  height: 32,
                }}
              >
                Cancel
              </Button>

              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditService;
