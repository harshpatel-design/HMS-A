import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spin, Empty, Space, Button, Input, DatePicker, Tooltip, Select } from 'antd';
import {
  CreditCardOutlined,
  EyeOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
  const [caseType, setCaseType] = useState(null);

  useEffect(() => {
    dispatch(
      getPatientLedger({
        page,
        limit,
        search: searchText || undefined,
        startDate: dates?.[0]?.format('YYYY-MM-DD'),
        endDate: dates?.[1]?.format('YYYY-MM-DD'),
        caseType,
      })
    );
  }, [dispatch, page, limit, searchText, dates, caseType]);

  const dataSource = ledger?.data || [];

  const columns = [
    {
      title: 'Patient',
      key: 'patient',
      width: 220,
      render: (v) => v?.patient?.name || '—',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Balance',
      dataIndex: 'balanceAmount',
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Action',
      align: 'center',
      width: 140,
      render: (_, r) => (
        <>
          <Tooltip title="View Charge">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/chargeby-patient/${r.patient._id}`)}
            />
          </Tooltip>
          <Tooltip title="View Payments">
            <Button
              type="link"
              icon={<HistoryOutlined style={{color :"orange"}} />}
              onClick={() => navigate(`/patient-payment-history/${r.patient._id}`)}
            />
          </Tooltip>
          <Tooltip title="Receive Payments">
            <Button
              type="link"
              icon={<CreditCardOutlined style={{color :"green"}} />}
              onClick={() => navigate(`/receive-charge/${r.patient._id}`)}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Patient Ledger List"
        showBack
        backTo="/dashboard"
        items={[
          { label: 'Patient List', href: '/patitent-onboarding' },
          { label: 'Patient Ledger' },
        ]}
      />

      <div className="serachbar-bread" style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Search patient"
            allowClear
            className="searchbar-search"
            onSearch={(v) => {
              setSearchText(v);
              setPage(1);
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('');
              setDates(null);
              setCaseType(null);
              setPage(1);
            }}
          />
          <Select
            style={{ width: 120, height: 40 }}
            placeholder="Case Type"
            suffixIcon={<MedicineBoxOutlined />}
            allowClear
            value={caseType}
            options={[
              { value: 'opd', label: 'OPD' },
              { value: 'ipd', label: 'IPD' },
            ]}
            onChange={(v) => {
              setCaseType(v || null);
              setPage(1);
            }}
          />

          <RangePicker
            format="YYYY-MM-DD"
            value={dates}
            onChange={(val) => {
              setDates(val);
              setPage(1);
            }}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        {dataSource.length ? (
          <div className="table-scroll-container">
            <Table
              rowKey={(r) => `${r.patient._id}_${r.caseType}`}
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: 1000 }}
              pagination={{
                current: ledger?.pagination?.page,
                pageSize: ledger?.pagination?.limit,
                total: ledger?.pagination?.total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100', '500'],
                onChange: (p, l) => {
                  setPage(p);
                  setLimit(l);
                },
                showTotal: (t) => `Total ${t} items`,
              }}
            />
          </div>
        ) : (
          <Empty
            description="No ledger data found"
            style={{ background: 'white', borderRadius: 20, padding: 40 }}
          />
        )}
      </Spin>
    </div>
  );
}

export default PatientLedger;
