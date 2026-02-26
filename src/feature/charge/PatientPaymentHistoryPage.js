import React, { useEffect } from 'react';
import { Table, Spin, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatientPaymentHistory } from '../../slices/payment.slice';
import Breadcrumbs from '../comman/Breadcrumbs';
import dayjs from 'dayjs';

function PatientPaymentHistoryPage() {
  const navigate = useNavigate();
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
      render: (v) => dayjs(v)?.format('DD-MM-YYYY') || '—',
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
        items={[
          { label: 'Patient List', href: '/patitent-onboarding' },
          { label: 'Patient History' },
        ]}
      />
      <div title="table-scroll-container">
        <Spin spinning={loading}>
          {paymentHistory?.length ? (
            <Table
              rowKey="_id"
              columns={columns}
              scroll={{ x: 'max-content' }}
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
