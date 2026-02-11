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
  Checkbox,
  DatePicker,
} from 'antd';

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../comman/Breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import '../../hcss.css';

import { getAllDiagnosis, clearDiagnosisState } from '../../slices/diagnosisSlice';

const { RangePicker } = DatePicker;
const DEFAULT_DIAGNOSIS_COLUMNS = [
  'patient',
  'diagnosis',
  'caseType',
  'status',
  'visitDate',
  'createdAt',
  'doctor',
];

const DiagnosisList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Search } = Input;

  const { list, total, page, limit, loading } = useSelector((state) => state.diagnosis);

  console.log(list);

  const [searchText, setSearchText] = useState('');
  const [ordering, setOrdering] = useState('createdAt');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_DIAGNOSIS_COLUMNS);

  useEffect(() => {
    loadDiagnosis();
    return () => dispatch(clearDiagnosisState());
  }, []);

  const loadDiagnosis = (pageValue = 1, searchValue = '') => {
    dispatch(
      getAllDiagnosis({
        page: pageValue,
        limit: 10,
        search: searchValue,
        orderBy: ordering,
        order: 'DESC',
      })
    );
  };

  const allColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_, r) => (
        <Tooltip title={`${r.patient?.firstName} ${r.patient?.lastName}`}>
          <span>
            {r.patient?.firstName} {r.patient?.lastName}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, r) => (
        <Tooltip title={`${r.doctor?.user?.name}`}>
          <span>{r.doctor?.user?.name} </span>
        </Tooltip>
      ),
    },
    {
      title: 'Diagnosis',
      key: 'diagnosis',
      dataIndex: 'diagnosis',
      render: (v) => v || '-',
    },
    {
      title: 'Clinical Notes',
      key: 'clinicalNotes',
      dataIndex: 'clinicalNotes',
      render: (v) => v || '-',
    },
    {
      title: 'Advice',
      key: 'advice',
      dataIndex: 'advice',
      render: (v) => v || '-',
    },
    {
      title: 'Case Type',
      key: 'caseType',
      dataIndex: 'caseType',
      render: (v) => <Tag color="blue">{v?.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (v) =>
        v === 'completed' ? <Tag color="green">COMPLETED</Tag> : <Tag color="orange">DRAFT</Tag>,
    },
    {
      title: 'Visit Date',
      key: 'visitDate',
      dataIndex: 'visitDate',
      render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '-'),
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
      width: 100,
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/add-edit-diagnosis/${r._id}`)}
          />
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
        onClick={() => setSelectedColumns(DEFAULT_DIAGNOSIS_COLUMNS)}
      >
        Reset to default
      </Button>
    </div>
  );
  const handleTableChange = (pagination, filters, sorter) => {
    if (!sorter.order) {
      loadDiagnosis(pagination.current, searchText);
      return;
    }

    const sortOrder = sorter.order === 'ascend' ? 'ASC' : 'DESC';

    dispatch(
      getAllDiagnosis({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        orderBy: sorter.field,
        order: sortOrder,
      })
    );
  };
  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Diagnosis List"
        showBack
        backTo="/dashboard"
        items={[{ label: 'Diagnosis List' }]}
      />

      <div className="serachbar-bread">
        <Space style={{ flexWrap: 'wrap' }}>
          <Search
            placeholder="Search diagnosis"
            className="searchbar-search"
            allowClear
            onSearch={(v) => {
              setSearchText(v);
              loadDiagnosis(1, v);
            }}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('');
              loadDiagnosis(1, '');
            }}
          />
          <RangePicker
            format="YYYY-MM-DD"
            onChange={(dates) => {
              dispatch(
                getAllDiagnosis({
                  page: 1,
                  limit: 10,
                  search: searchText,
                  startDate: dates?.[0]?.format('YYYY-MM-DD'),
                  endDate: dates?.[1]?.format('YYYY-MM-DD'),
                })
              );
            }}
          />

          <Dropdown popupRender={() => columnMenu} trigger={['click']}>
            <Button className="column-btn" icon={<FilterOutlined />} />
          </Dropdown>

          <Link to="/add-edit-diagnosis">
            <Button
              type="primary"
              className="btn"
              icon={<PlusOutlined />}
              onClick={() => navigate('/add-edit-diagnosis')}
            >
              Add Diagnosis
            </Button>
          </Link>
        </Space>
      </div>

      <div className="table-scroll-container">
        <Table
          rowKey="_id"
          columns={filteredColumns}
          dataSource={list}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
            showTotal: (t) => `Total ${t} items`,
          }}
        />
      </div>
    </div>
  );
};

export default DiagnosisList;
