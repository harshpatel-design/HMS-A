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
  Select,
} from 'antd';

import {
  ReloadOutlined,
  FilterOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import Breadcrumbs from '../comman/Breadcrumbs';

import doctorService from '../../services/doctorService';
import {
  fetchDoctorWaitingList,
  deleteWaitingList,
} from '../../slices/waitingListSlice';

const { Search } = Input;

const DEFAULT_COLUMNS = [
  'patient',
  'type',
  'source',
  'priority',
  'createdAt',
];

const DoctorWaitingListPage = () => {
  const dispatch = useDispatch();

  const {
    doctorQueue,
    total,
    page,
    limit,
    loading,
  } = useSelector((state) => state.waitingList);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);

  /* ---------------- Load Doctors ---------------- */
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getDoctorNames('');
      setDoctors(res.doctors || []);
    } catch {
      message.error('Failed to load doctors');
    }
  };

  /* ---------------- Fetch Waiting List ---------------- */
  const loadWaitingList = (pageValue = 1, searchValue = '') => {
    if (!selectedDoctor) return;

    dispatch(
      fetchDoctorWaitingList({
        doctorId: selectedDoctor,
        page: pageValue,
        limit: 10,
        search: searchValue,
      })
    );
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = (id) => {
    dispatch(deleteWaitingList(id))
      .unwrap()
      .then(() => {
        message.success('Removed from waiting list');
        loadWaitingList(page, searchText);
      })
      .catch(() => message.error('Delete failed'));
  };

  /* ---------------- Columns ---------------- */
  const allColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (r) => (
        <Tooltip title={r.patient?.name}>
          <strong>{r.patient?.name}</strong>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (r) => (
        <Tag color={r.patient?.type === 'ipd' ? 'purple' : 'blue'}>
          {r.patient?.type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Source',
      key: 'source',
      render: (r) => (
        <Tag color={r.source === 'appointment' ? 'green' : 'orange'}>
          {r.source.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      key: 'priority',
      dataIndex: 'priority',
    },
    {
      title: 'Added On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (v) => dayjs(v).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} />
          {r.source === 'waiting' && (
            <Popconfirm
              title="Remove from waiting list?"
              onConfirm={() => handleDelete(r._id)}
            >
              <Button danger type="link" icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredColumns = allColumns.filter(
    (c) => selectedColumns.includes(c.key) || c.key === 'actions'
  );

  /* ---------------- Column Filter Menu ---------------- */
  const columnMenu = (
    <div className="column-filter-menu">
      {allColumns
        .filter((c) => c.key !== 'actions')
        .map((col) => (
          <Checkbox
            key={col.key}
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
        ))}
      <div style={{ marginTop: 10 }}>
        <Button type="link" onClick={() => setSelectedColumns(DEFAULT_COLUMNS)}>
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Doctor Waiting List"
        showBack
        backTo="/dashboard"
        items={[{ label: 'Waiting List' }]}
      />

      {/* ---------------- Top Bar ---------------- */}
      <div className="serachbar-bread">
        <Space wrap>
          <Select
            showSearch
            allowClear
            placeholder="Select Doctor"
            style={{ width: 220 }}
            options={doctors.map((d) => ({
              label: d.name,
              value: d._id,
            }))}
            onChange={(val) => {
              setSelectedDoctor(val);
              setSearchText('');
              if (val) loadWaitingList(1, '');
            }}
          />

          <Search
            placeholder="Search patient"
            allowClear
            onSearch={(v) => {
              setSearchText(v);
              loadWaitingList(1, v);
            }}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadWaitingList(1, searchText)}
          />

          <Dropdown dropdownRender={() => columnMenu} trigger={['click']}>
            <Button icon={<FilterOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="table-scroll-container">
        <Table
          rowKey="_id"
          loading={loading}
          columns={filteredColumns}
          dataSource={doctorQueue}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: loadWaitingList,
          }}
        />
      </div>
    </div>
  );
};

export default DoctorWaitingListPage;
