import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spin, Empty, Space, Button, Input, DatePicker, Tooltip } from 'antd';
import { CreditCardOutlined, HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPatientLedger } from '../../slices/payment.slice';
import Breadcrumbs from '../comman/Breadcrumbs';

const { Search } = Input;
const { RangePicker } = DatePicker;
function PatientLedger() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { ledger, loading } = useSelector((state) => state.payment);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [dates, setDates] = useState(null);
  const loadLedger = (p = page, l = limit, s = searchText, d = dates) => {
    dispatch(
      getPatientLedger({
        page: p,
        limit: l,
        search: s || undefined,
        startDate: d?.[0]?.format('YYYY-MM-DD'),
        endDate: d?.[1]?.format('YYYY-MM-DD'),
      })
    );
  };

  useEffect(() => {
    loadLedger(1, limit);
    // eslint-disable-next-line
  }, []);

  const dataSource = ledger?.data || [];

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patient',
      key: 'patient',
      width: 220,
      render: (v) => v.name || '—',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Balance',
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      render: (v) => `₹ ${v}`,
    },

    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, r) => (
        <>
          <Tooltip title="View Payments">
            <Button
              type="link"
              icon={<CreditCardOutlined />}
              onClick={() => navigate(`/patient-payment-history/${r.patient._id}`)}
            />
          </Tooltip>
          <Tooltip title="Recive Payments">
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => navigate(`/receive-charge/${r.patient._id}`)}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  const handleTableChange = (p, l) => {
    setPage(p);
    setLimit(l);
    loadLedger(p, l);
  };

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Patient Ledger List"
        showBack={true}
        backTo="/dashboard"
        items={[
          { label: 'Patient List', href: '/patitent-onboarding' },
          { label: 'Patient Ledger' },
        ]}
      />
      <div className="serachbar-bread" style={{ marginBottom: 16 }}>
        <Space style={{ flexWrap: 'wrap' }}>
          <Search
            placeholder="Search patient"
            allowClear
            className="searchbar-search"
            onSearch={(v) => {
              setSearchText(v);
              setPage(1);
              loadLedger(1, limit, v, dates);
            }}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('');
              setDates(null);
              setPage(1);
              loadLedger(1, limit, '', null);
            }}
          />

          <RangePicker
            format="YYYY-MM-DD"
            value={dates}
            onChange={(val) => {
              setDates(val);
              setPage(1);
              loadLedger(1, limit, searchText, val);
            }}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        {dataSource.length ? (
          <div className="table-scroll-container">
            <Table
              rowKey="patient"
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: 1000 }}
              pagination={{
                current: ledger?.pagination?.page,
                pageSize: ledger?.pagination?.limit,
                total: ledger?.pagination?.total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100', '500'],
                onChange: handleTableChange,
                showTotal: (total) => `Total ${total} items`,
              }}
            />
          </div>
        ) : (
          <Empty
            description="No ledger data found"
            style={{ paddingTop: 10, borderTop: '1px solid #dadde3' }}
          />
        )}
      </Spin>
    </div>
  );
}

export default PatientLedger;
