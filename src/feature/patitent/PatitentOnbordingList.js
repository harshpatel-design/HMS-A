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

import {
  fetchPatients,
  deletePatient,
  resetPatientState,
  setSort,
  resetSort,
} from '../../slices/patientSlice';

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
  const [ordering, setOrdering] = useState('createdAt');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_PATIENT_COLUMNS);

  useEffect(() => {
    loadPatients();
    return () => dispatch(resetPatientState());
  }, []);

  // useEffect((id) => {
  //   if (isId) {
  //     useDispatch(fetchChargeById(id))
  //   }
  // })
  const loadPatients = (pageValue = 1, searchValue = '') => {
    dispatch(
      fetchPatients({
        page: pageValue,
        limit: 10,
        search: searchValue,
        orderBy: ordering,
        order: 'DESC',
      })
    );
  };

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
      title: 'Full Name',
      key: 'name',
      width: 140,
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
      dataIndex: 'phone',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: 'gender',
      width: 100,
      render: (v) => v?.toUpperCase(),
    },
    {
      title: 'Case Number',
      key: 'caseNumber',
      dataIndex: 'caseNumber',
      widht: 150,
      render: (v) => v,
    },
    {
      title: 'Case',
      key: 'caseType',
      dataIndex: 'caseType',
      render: (v) => <Tag color="blue">{v?.toUpperCase()}</Tag>,
    },
    {
      title: 'Address',
      key: 'address',
      render: (r) => `${r.address?.line1 || ''} ${r.address?.city || ''}`,
    },
    {
      title: 'Blood Group',
      key: 'bloodGroup',
      dataIndex: 'bloodGroup',
    },
    {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (v) => (v ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">INACTIVE</Tag>),
    },
    {
      title: 'Created On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (v) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            icon={<CreditCardOutlined />}
            onClick={() => navigate(`/receive-charge/${r._id}`)}
          />
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => navigate(`/patient-payment-history/${r._id}`)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/add-edit-patitent/${r._id}`)}
          />
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/view-patitent/${r._id}`)}
          />
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
        style={{ padding: 0 }}
        onClick={() => setSelectedColumns(DEFAULT_PATIENT_COLUMNS)}
      >
        Reset to default
      </Button>
    </div>
  );

  const handleTableChange = (pagination, filters, sorter) => {
    if (!sorter.order) {
      dispatch(resetSort());
      dispatch(
        fetchPatients({
          page: pagination.current,
          limit: pagination.pageSize,
          orderBy: 'createdAt',
          order: 'DESC',
        })
      );
      return;
    }
    const sortOrder = sorter.order === 'ascend' ? 'ASC' : 'DESC';

    dispatch(
      setSort({
        orderBy: sorter.field,
        order: sortOrder,
      })
    );

    dispatch(
      fetchPatients({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        orderBy: sorter.field,
        order: sortOrder,
      })
    );
  };

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title="Patient List"
          showBack={true}
          backTo="/dashboard"
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
            pagination={{
              current: page,
              pageSize: limit,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              onChange: handleTableChange,
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
