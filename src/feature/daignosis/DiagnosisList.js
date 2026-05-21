import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Tag, Tooltip, Dropdown, Checkbox, DatePicker } from 'antd';

import {
  PlusOutlined,
  EditOutlined,
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

  const [searchText, setSearchText] = useState('');
  const [ordering, setOrdering] = useState('createdAt');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_DIAGNOSIS_COLUMNS);

  useEffect(() => {
    loadDiagnosis();
    return () => dispatch(clearDiagnosisState());
  }, [dispatch]);

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

  const handleAll = (r) => {
    const patientId = r.patient?._id;
    navigate(`/view-diagnosis/${patientId}`);
  };

  const allColumns = [
    {
      title: 'Patient',
      key: 'patient',
      width: 140,
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
      width: 140,
      render: (_, r) => (
        <Tooltip title={`${r.doctor?.user?.name}`}>
          <span>{r.doctor?.user?.name} </span>
        </Tooltip>
      ),
    },
    {
      title: 'Diagnosis',
      key: 'diagnosis',
      ellipsis: true,
      width: 140,
      dataIndex: 'diagnosis',
      render: (v) => {
        return (
          <Tooltip title={v}>
            <div className="text-truncate">{v}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Clinical Notes',
      key: 'clinicalNotes',
      ellipsis: true,
      width: 140,
      dataIndex: 'clinicalNotes',
      render: (v) => {
        return (
          <Tooltip title={v}>
            <div>
              <p>{v ? v : '-'}</p>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Advice',
      key: 'advice',
      dataIndex: 'advice',
      width: 140,
      render: (v) => {
        return (
          <Tooltip title={v}>
            <div>
              <p>{v ? v : '-'}</p>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Case Type',
      key: 'caseType',
      dataIndex: 'caseType',
      width: 120,
      align: 'center',
      render: (v) => (
        <Tag color="blue" className="w-100">
          {v?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (v) =>
        v === 'completed' ? (
          <Tag color="green" className="w-100">
            COMPLETED
          </Tag>
        ) : (
          <Tag color="orange" className="w-100">
            DRAFT
          </Tag>
        ),
    },
    {
      title: 'Visit Date',
      key: 'visitDate',
      dataIndex: 'visitDate',
      width: 120,
      align: 'center',
      render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'Created On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      width: 120,
      align: 'center',
      render: (v) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 70,
      render: (_, r) => (
        <Space>
          {console.log('r', r)}
          <Button type="link" style={{ color: '#000' }} icon={<EyeOutlined />} onClick={() => handleAll(r)} />
          <Button
            type="link"
            style={{ color: '#1890ff' }}
            icon={<EditOutlined />}
            onClick={() => navigate(`/add-edit-diagnosis/${r._id}/${r.patient._id}/${r.doctor._id}`)}
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
      <Breadcrumbs title="Diagnosis List" showBack={true} items={[{ label: 'Diagnosis List' }]} />

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
