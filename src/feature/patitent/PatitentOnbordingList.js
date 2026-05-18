import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Dropdown,
  DatePicker,
  Checkbox,
} from 'antd';

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  CreditCardOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../comman/Breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import '../../hcss.css';

import { fetchPatients, deletePatient } from '../../slices/patientSlice';

const DEFAULT_PATIENT_COLUMNS = [
  'name',
  'phone',
  'gender',
  'caseType',
  'address',
  'caseNumber',
  'createdAt',
];

const PatientOnboardingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { Search } = Input;
  const { RangePicker } = DatePicker;

  const { patients, total, page, limit, loading } = useSelector((state) => state.patient);

  const [searchText, setSearchText] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_PATIENT_COLUMNS);

  const loadPatients = (pageValue = 1, searchValue = '') => {
    dispatch(
      fetchPatients({
        page: pageValue,
        limit: limit || 10,
        search: searchValue,
      })
    );
  };

  useEffect(() => {
    loadPatients(1, '');
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deletePatient(id))
      .unwrap()
      .then(() => {
        message.success('Deleted!');
        loadPatients(page, searchText);
      })
      .catch(() => message.error('Delete failed'));
  };

  const allColumns = [
    {
      title: 'Case No.',
      key: 'caseNumber',
      dataIndex: 'caseNumber',
      width: 100,
      render: (v) => (
        <Space className="action" style={{ fontWeight: 600 }}>
          {v || '—'}
        </Space>
      ),
    },
    {
      title: 'Full Name',
      key: 'name',
      render: (r) => (
        <Tooltip title={`${r.firstName} ${r.lastName}`}>
          <span>
            {r.firstName} {r.lastName}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Phone',
      key: 'phone',
      width: 160,
      dataIndex: 'phone',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: 'gender',
      width: 120,
      render: (v) => v?.toUpperCase(),
    },

    {
      title: 'Case',
      key: 'caseType',
      dataIndex: 'caseType',
      width: 120,
      render: (v) => (
        <Tag color="blue" className="w-100">
          {v?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Address',
      key: 'address',
      width: 240,
      render: (r) => `${r.address?.line1 || ''} ${r.address?.city || ''}`,
    },
    {
      title: 'Blood Group',
      key: 'bloodGroup',
      width: 100,
      render: (r) => <Space className="action">{r?.bloodGroup || '-'}</Space>,
    },
    {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      width: 140,
      render: (v) =>
        v ? (
          <strong>
            <Tag color="green" className="w-100">
              ACTIVE
            </Tag>
          </strong>
        ) : (
          <strong>
            <Tag color="red" className="w-100">
              INACTIVE
            </Tag>
          </strong>
        ),
    },
    {
      title: 'Created On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      width: 140,
      render: (v) => <Space className="action">{dayjs(v).format('DD-MM-YYYY')}</Space>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_, r) => (
        <Space className="action">
          <Tooltip title="Receive Payment">
            <Button
              type="link"
              icon={<CreditCardOutlined style={{ color: 'green' }} />}
              onClick={() => navigate(`/receive-charge/${r._id}`)}
            />
          </Tooltip>
          <Tooltip title="View Payment History">
            <Button
              type="link"
              icon={<HistoryOutlined style={{ color: 'orange' }} />}
              onClick={() => navigate(`/patient-payment-history/${r._id}`)}
            />
          </Tooltip>

          <Tooltip title="Edit Patient">
            <Button
              type="link"
              icon={<EditOutlined style={{ color: 'blue' }} />}
              onClick={() => navigate(`/add-edit-patitent/${r._id}`)}
            />
          </Tooltip>
          <Tooltip title="View Patient">
            <Button
              type="link"
              icon={<EyeOutlined style={{ color: 'purple' }} />}
              onClick={() => navigate(`/view-patitent/${r._id}`)}
            />
          </Tooltip>

          <Popconfirm title="Delete patient?" onConfirm={() => handleDelete(r._id)}>
            <Button danger type="link" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredColumns = allColumns.filter(
    (col) => selectedColumns.includes(col.key) || col.key === 'actions'
  );

  const columnMenu = (
    <div className="column-filter-menu">
      <div className="column-filter-grid">
        {allColumns
          .filter((c) => c.key !== 'actions')
          .map((col) => (
            <div key={col.key} className="column-filter-item">
              <Checkbox
                checked={selectedColumns.includes(col.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns([...selectedColumns, col.key]);
                  } else {
                    setSelectedColumns(selectedColumns.filter((c) => c !== col.key));
                  }
                }}
              >
                {col.title}
              </Checkbox>
            </div>
          ))}
      </div>

      <div className="column-filter-divider" />

      <Button
        type="link"
        style={{ padding: 0, textAlign: 'left' }}
        onClick={() => setSelectedColumns(DEFAULT_PATIENT_COLUMNS)}
      >
        Reset to default
      </Button>
    </div>
  );

  const handleTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;

    const ordering =
      sorter?.order === 'ascend'
        ? sorter.field
        : sorter?.order === 'descend'
          ? `-${sorter.field}`
          : undefined;

    dispatch(
      fetchPatients({
        page: current,
        limit: pageSize,
        search: searchText,
        ordering,
      })
    );
  };

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title="Patient List"
          showBack={true}
          items={[
            { label: 'Patient List', href: '/patitent-onboarding' },
            { label: 'View Patient' },
          ]}
        />
        <div className="serachbar-bread">
          <Space style={{ flexWrap: 'wrap' }}>
            <Search
              placeholder="Search patient"
              className="searchbar-search"
              onSearch={(v) => {
                setSearchText(v);
                loadPatients(1, v);
              }}
              allowClear
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                loadPatients(1, '');
              }}
            />
            <Dropdown dropdownRender={() => columnMenu} trigger={['click']}>
              <Button className="column-btn" icon={<FilterOutlined />}></Button>
            </Dropdown>

            <RangePicker
              format="YYYY-MM-DD"
              onChange={(dates) => {
                dispatch(
                  fetchPatients({
                    page: 1,
                    limit: 10,
                    search: searchText,
                    startDate: dates?.[0]?.format('YYYY-MM-DD'),
                    endDate: dates?.[1]?.format('YYYY-MM-DD'),
                  })
                );
              }}
            />

            <Link to="/add-edit-patitent">
              <Button type="primary" className="btn" icon={<PlusOutlined />}>
                Add Patient
              </Button>
            </Link>
          </Space>
        </div>

        <div className="table-scroll-container">
          <Table
            rowKey="_id"
            columns={filteredColumns}
            scroll={{ x: 1000 }}
            dataSource={patients}
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: limit,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              showTotal: (totalRecord) => `Total ${totalRecord} items`,
              showQuickJumper: limit > 100 && limit < 500,
              locale: {
                items_per_page: 'Items / Page',
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PatientOnboardingList;
