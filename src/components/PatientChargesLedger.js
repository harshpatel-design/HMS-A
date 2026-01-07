import React, { useEffect, useMemo } from 'react';
import { Card, Row, Col, Spin, message, Table } from 'antd';

import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChargeById } from '../slices/chargeSlice';

import e1 from '../images/Vector 7.png';
import e2 from '../images/Vector 8.png';

import Breadcrumbs from "../feature/comman/Breadcrumbs";

function PatientChargesLedger() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { charge, loading } = useSelector((state) => state.charge);

  useEffect(() => {
    if (!id) return;

    dispatch(fetchChargeById(id))
      .unwrap()
      .catch(() => message.error('Failed to load charges'));
  }, [dispatch, id]);

  const chargesList = useMemo(() => {
    return charge?.charges || [];
  }, [charge]);

  const patient = useMemo(() => {
    if (!charge || !charge.charges?.length) return null;
    return charge.charges[0].patient;
  }, [charge]);

  if (!chargesList.length) {
    return <Card title="Patient Charges">No Charges Found</Card>;
  }

  if (!patient) {
    return <Card title="Patient Charges">Patient details not available</Card>;
  }

  const columns = [
    {
      title: 'Charge Name',
      dataIndex: ['chargeMaster', 'name'],
      key: 'name',
      minWidth: 120,
    },
    {
      title: 'Base Amount',
      dataIndex: 'baseAmount',
      key: 'baseAmount',
    },
    {
      title: 'Discount Amount',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
    },
    {
      title: 'Discount Type',
      dataIndex: 'discountType',
      key: 'discountType',
    },
    {
      title: 'Final Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-IN'),
    },
  ];

  const footer = () => {
    const totalBalance = chargesList.reduce((sum, item) => sum + (item.balanceAmount || 0), 0);

    return (
      <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
        Balance Amount Total: {totalBalance}
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      {loading && <Spin fullscreen size="large" tip="Loading..." />}
       <Breadcrumbs
          title="Patient Charge"
          showBack
          backTo="/patitent-onboarding"
          items={[{ label: 'Patient Charge' }]}
        />

      <div className="profile-card">
        <Row gutter={16}>
          <Col md={24} xs={24}>
            <div className="flex-column-between">
              <div className="profile-details">
                <div className="doctor-profile-effect-1">
                  <img src={e1} alt="effect1" />
                </div>
                <div className="doctor-profile-effect-2">
                  <img src={e2} alt="effect2" />
                </div>
              </div>

              <div className="patient-name">
                <h3>
                  <b>Name : </b> {patient.firstName} {patient.lastName}
                </h3>

                <h3>
                  <b>PhoneNo :</b> {''} {patient.phone}
                </h3>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Card title="Patient Charge Ledger" className="PatientChargeLedger">
        <div className="table-scroll-container">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={chargesList}
            pagination={false}
            summary={() => {
              const totals = chargesList.reduce(
                (acc, item) => {
                  acc.baseAmount += item.baseAmount || 0;
                  acc.discountAmount += item.discountAmount || 0;
                  acc.finalAmount += item.finalAmount || 0;
                  acc.paidAmount += item.paidAmount || 0;
                  acc.balanceAmount += item.balanceAmount || 0;
                  return acc;
                },
                {
                  baseAmount: 0,
                  discountAmount: 0,
                  finalAmount: 0,
                  paidAmount: 0,
                  balanceAmount: 0,
                }
              );

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <b>Total</b>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={1}>
                    <b>{totals.baseAmount}</b>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={2}>
                    <b>{totals.discountAmount}</b>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={3}></Table.Summary.Cell>

                  <Table.Summary.Cell index={4}>
                    <b>{totals.finalAmount}</b>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={5}>
                    <b>{totals.paidAmount}</b>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={6}>
                    <b>{totals.finalAmount - totals.paidAmount === 0 ? 'Paid' : 'Partial'}</b>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={7}></Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
            footer={footer}
          />
        </div>
      </Card>
    </div>
  );
}

export default React.memo(PatientChargesLedger);
