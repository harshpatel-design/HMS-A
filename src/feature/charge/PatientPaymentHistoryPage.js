import React, { useEffect } from 'react';
import { Card, Table, Spin, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getPatientPaymentHistory } from '../../slices/payment.slice';
import Breadcrumbs from '../comman/Breadcrumbs';

function PatientPaymentHistoryPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { paymentHistory, loading } = useSelector((state) => state.payment);

  useEffect(() => {
    if (id) {
      dispatch(getPatientPaymentHistory(id));
    }
  }, [dispatch, id]);
  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render: (v) => v?.toUpperCase(),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (v) => v || '—',
    },
    {
      title: 'Received By',
      key: 'receivedBy',
      render: (_, r) => r.receivedBy?.name || '—',
    },
    {
      title: 'Received At',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      render: (v) => new Date(v).toLocaleString('en-IN'),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (v) => v || '—',
    },
  ];

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Patient History"
        showBack={true}
        backTo="/patient-ledger"
        items={[
          { label: 'Patient List', href: '/patitent-onboarding' },
          { label: 'Patient History' },
        ]}
      />
      <div title="Patient Payment History">
        <Spin spinning={loading}>
          {paymentHistory?.length ? (
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={paymentHistory}
              pagination={{
                showTotal: (total) => `Total ${total} items`,
              }}
            />
          ) : (
            <Empty description="No payment history found" />
          )}
        </Spin>
      </div>
    </div>
  );
}

export default PatientPaymentHistoryPage;
