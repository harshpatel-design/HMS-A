import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Input, Spin, message, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { receivePayment, getPatientLedger, clearLedger } from '../../slices/payment.slice';
import { fetchPatientName } from '../../slices/patientSlice';
import Breadcrumbs from '../comman/Breadcrumbs';

const { Option } = Select;
const { TextArea } = Input;

function ReceiveCharge({ setDrawerOpen }) {
  const dispatch = useDispatch();
  const { id: patientIdFromRoute } = useParams();
  const [form] = Form.useForm();

  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const { ledger, loading } = useSelector((state) => state.payment);

  const { patientName } = useSelector((state) => state.patient);

  const receiveAmount = Form.useWatch('amount', form);

  useEffect(() => {
    dispatch(fetchPatientName({ page: 1, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPatientId) {
      dispatch(clearLedger());
    }
  }, [dispatch, selectedPatientId]);

  useEffect(() => {
    if (patientIdFromRoute) {
      setSelectedPatientId(patientIdFromRoute);
      form.setFieldsValue({
        patient: patientIdFromRoute,
      });
    }
  }, [patientIdFromRoute, form]);

  useEffect(() => {
    if (selectedPatientId) {
      dispatch(
        getPatientLedger({
          patientId: selectedPatientId,
          page: 1,
          limit: 10,
        })
      )
        .unwrap()
        .catch(() => message.error('Failed to load patient charges'));
    }
  }, [dispatch, selectedPatientId]);

  const onFinish = async (values) => {
    if (!selectedPatientId) {
      return message.error('Please select patient');
    }

    const payload = {
      patientId: selectedPatientId,
      amount: values.amount,
      paymentMode: values.paymentMode,
      note: values.note || null,
    };

    try {
      await dispatch(receivePayment(payload)).unwrap();
      message.success('Payment received successfully');

      form.resetFields();
      setSelectedPatientId(null);
      setDrawerOpen?.(false);
    } catch (err) {
      message.error(err?.message || 'Failed to receive payment');
    }
  };

  const ledgerSummary = useMemo(() => {
    return (
      ledger?.data?.[0] || {
        totalAmount: 0,
        paidAmount: 0,
        discountAmount: 0,
        balanceAmount: 0,
      }
    );
  }, [ledger]);

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Receive Charge"
        showBack
        backTo="/dashboard"
        items={[
          { label: 'Patient List', href: '/patitent-onboarding' },
          { label: 'Receive Charge' },
        ]}
      />

      <Spin spinning={loading}>
        <Card title="Receive Payment" bordered={false}>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Patient"
                  name="patient"
                  rules={[{ required: true, message: 'Select patient' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select patient"
                    optionFilterProp="children"
                    disabled={!!patientIdFromRoute}
                    allowClear
                    onChange={(value) => {
                      if (!value) {
                        setSelectedPatientId(null);
                        form.resetFields();
                        return;
                      }
                      setSelectedPatientId(value);
                      form.resetFields(['amount', 'paymentMode', 'note']);
                    }}
                  >
                    {patientName?.patients?.map((p) => (
                      <Option key={p._id} value={p._id}>
                        {p.name || `${p.firstName} ${p.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Total Final Amount">
                  <InputNumber
                    value={ledgerSummary.totalAmount}
                    disabled
                    style={{
                      width: '100%',
                      background: '#b3b9e490',
                      color: '#000',
                      fontWeight: 600,
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Total Paid Amount">
                  <InputNumber
                    value={ledgerSummary.paidAmount}
                    disabled
                    style={{
                      width: '100%',
                      background: '#b3e4b990',
                      color: '#000',
                      fontWeight: 600,
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Remaining Balance">
                  <InputNumber
                    value={ledgerSummary.balanceAmount}
                    disabled
                    style={{
                      width: '100%',
                      background: ledgerSummary.balanceAmount === 0 ? '#d9f7be' : '#fff1f0',
                      color: ledgerSummary.balanceAmount === 0 ? '#389e0d' : '#cf1322',
                      fontWeight: 600,
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="amount"
                  label="Receive Amount"
                  rules={[
                    { required: true, message: 'Enter amount' },
                    {
                      validator: (_, value) => {
                        if (value == null) return Promise.resolve();
                        if (value > ledgerSummary.balanceAmount) {
                          return Promise.reject(
                            new Error('Amount cannot exceed remaining balance')
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    disabled={ledgerSummary.balanceAmount === 0}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="paymentMode"
                  label="Payment Mode"
                  rules={[{ required: true, message: 'Select payment mode' }]}
                >
                  <Select
                    placeholder="Select payment mode"
                    disabled={ledgerSummary.balanceAmount === 0}
                  >
                    <Option value="cash">Cash</Option>
                    <Option value="upi">UPI</Option>
                    <Option value="card">Card</Option>
                    <Option value="bank">Bank</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="note" label="Note">
                  <TextArea rows={3} disabled={ledgerSummary.balanceAmount === 0} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="btn-full"
                  block
                  disabled={!selectedPatientId || ledgerSummary.balanceAmount < receiveAmount}
                >
                  Receive Payment
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}

export default ReceiveCharge;
