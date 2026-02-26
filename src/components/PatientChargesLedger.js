import React, { useEffect } from 'react';
import { Card, Table, Spin, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchChargeById } from '../slices/chargeSlice';
import Breadcrumbs from '../feature/comman/Breadcrumbs.jsx';
import dayjs from 'dayjs';

function PatientChargesLedger() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { charge, loading } = useSelector((state) => state.charge);

  useEffect(() => {
    if (id) {
      dispatch(fetchChargeById(id));
    }
  }, [dispatch, id]);

  const ledgerRows = charge?.charges || [];

  const columns = [
    {
      title: 'Charge Name',
      key: 'chargeName',
      render: (_, record) => {
        if (!record?.charges?.length) return '—';
        return record.charges.map((c) => c.name).join(', ');
      },
    },
    {
      title: 'Base Amount (₹)',
      dataIndex: 'baseAmount',
      key: 'baseAmount',
    },
    {
      title: 'Discount (₹)',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      render: (v) => v ?? 0,
    },
    {
      title: 'Final Amount (₹)',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (v) => <b>₹ {v}</b>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
    },
  ];

  const p = `${ledgerRows[0]?.patient.firstName} ${ledgerRows[0]?.patient.lastName}`;
  const m = `${ledgerRows[0]?.patient.phone}`;

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Patient Ledger List"
        showBack
        backTo="/patient-ledger"
        items={[
          { label: 'Patient Ledger', href: '/patient-ledger' },
          { label: 'Patient Charges Ledger' },
        ]}
      />
      <Card title={`View Patient Charges :  ${p} (${m})`}>
        <Spin spinning={loading}>
          {ledgerRows.length ? (
            <div className="table-scroll-container">
              <Table
                rowKey="_id"
                columns={columns}
                dataSource={ledgerRows}
                loading={loading}
                scroll={{ x: 800 }}
                pagination={false}
              />
            </div>
          ) : (
            <Empty description="No charges found" />
          )}
        </Spin>
      </Card>
    </div>
  );
}

export default PatientChargesLedger;
