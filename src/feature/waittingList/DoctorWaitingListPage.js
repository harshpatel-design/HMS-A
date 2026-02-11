import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
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
  SoundOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import Breadcrumbs from '../comman/Breadcrumbs';

import doctorService from '../../services/doctorService';
import {
  fetchDoctorWaitingList,
  fetchAllWaitingList,
  updateWaitingList,
} from '../../slices/waitingListSlice';

const { Search } = Input;

const DEFAULT_COLUMNS = ['patient', 'type', 'status', 'priority', 'createdAt', 'doctor'];
const STATUS_FILTERS = [
  { label: 'Waiting', value: 'waiting' },
  { label: 'Called', value: 'called' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const DoctorWaitingListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { doctorQueue, total, page, limit, waitingList, loading } = useSelector(
    (state) => state.waitingList
  );

  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    !selectedDoctor &&
      dispatch(fetchAllWaitingList({ page: 1, limit: 10, search: '', status: '' }));
  }, [dispatch, selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getDoctorNames('');
      setDoctors(res.doctors || []);
    } catch {
      message.error('Failed to load doctors');
    }
  };
  const loadWaitingList = (doctorId, pageValue = 1, searchValue = '') => {
    if (!doctorId) return;

    dispatch(
      fetchDoctorWaitingList({
        doctorId,
        page: pageValue,
        limit,
        search: searchValue,
      })
    );
  };

  const handleDelete = (id) => {
    dispatch(updateWaitingList({ id, data: { status: 'cancelled' } }))
      .unwrap()
      .then(() => {
        message.success('Removed from waiting list');
        dispatch(fetchAllWaitingList({ page: 1, limit, search: '', status: '' }));
      })
      .catch(() => message.error('Delete failed'));
  };

  const handleDaignosis = (r) => {
    const id = r.patient?._id;
    navigate(`/add-diagnosis/${id}`);
    console.log('recoed', r);
  };

  const statusMenu = (
    <div className="column-filter-menu">
      <div className="column-filter-grid">
        {STATUS_FILTERS.map((s) => (
          <>
            <Checkbox
              key={s.value}
              checked={statusFilter.includes(s.value)}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...statusFilter, s.value]
                  : statusFilter.filter((v) => v !== s.value);

                setStatusFilter(updated);

                dispatch(
                  fetchAllWaitingList({
                    page: 1,
                    limit,
                    search: searchText,
                    status: updated.length ? updated.join(',') : undefined,
                  })
                );
              }}
            >
              {s.label}
            </Checkbox>
          </>
        ))}
      </div>

      <div className="column-filter-divider" />

      <div>
        <Button
          type="link"
          size="small"
          onClick={() => {
            setStatusFilter([]);
            dispatch(fetchAllWaitingList({ page: 1, limit, search: searchText, status: '' }));
          }}
        >
          Clear Filter
        </Button>
      </div>
    </div>
  );

  const allColumns = [
    {
      title: 'Patient',
      key: 'patient',
      width: 160,
      render: (_, r) => (
        <Tooltip title={`${r.patient?.firstName} ${r.patient?.lastName}`}>
          <strong>
            {r.patient?.firstName} {r.patient?.lastName}
          </strong>
        </Tooltip>
      ),
    },
    {
      title: 'Doctor',
      key: 'doctor',
      width: 160,
      render: (_, r) => (
        <Tooltip title={r.doctor?.user?.name}>
          <strong>{r.doctor?.user?.name}</strong>
        </Tooltip>
      ),
    },

    {
      title: 'Type',
      key: 'type',
      width: 100,
      render: (_, r) => (r.patient?.type || 'opd').toUpperCase(),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, r) => r.status.toUpperCase(),
    },

    {
      title: 'Priority',
      key: 'priority',
      dataIndex: 'priority',
      width: 100,
    },

    {
      title: 'Added On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      width: 100,
      render: (v) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Create Diagnosis">
            <Button
              type="link"
              icon={<MedicineBoxOutlined style={{ color: '#faad14' }} />}
              onClick={() => handleDaignosis(r)}
            />
          </Tooltip>
          <Tooltip title="Mark consultation completed">
            <Button
              type="link"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                if (r.status === 'waiting') {
                  message.warning('Call patient before marking as completed');
                  return;
                }
                if (r.status === 'completed') {
                  message.info('Already marked as completed');
                  return;
                }
                if (r.status === 'cancelled') {
                  message.warning('Cannot complete a cancelled entry');
                  return;
                }
                if (r.status === 'called') {
                  dispatch(
                    updateWaitingList({
                      id: r._id,
                      data: { status: 'completed' },
                    })
                  );
                  dispatch(fetchAllWaitingList({ page: 1, limit, search: '', status: '' }));
                  message.success('Consultation completed');
                }
              }}
            />
          </Tooltip>

          <Tooltip title="Call patient to chamber">
            <Button
              type="link"
              icon={<SoundOutlined />}
              onClick={() => {
                if (r.status === 'called') {
                  message.info('Already called');
                  return;
                } else if (r.status === 'completed') {
                  message.warning('Cannot call a completed entry');
                  return;
                } else if (r.status === 'cancelled') {
                  message.warning('Cannot call a cancelled entry');
                  return;
                }
                dispatch(
                  updateWaitingList({
                    id: r._id,
                    data: { status: 'called' },
                  })
                );
                dispatch(fetchAllWaitingList({ page: 1, limit, search: '', status: '' }));
                message.success(
                  `Patient ${r.patient?.firstName} ${r.patient?.lastName} called to chamber`
                );
              }}
            />
          </Tooltip>

          <Popconfirm title="Remove from waiting list?" onConfirm={() => handleDelete(r._id)}>
            <Button danger type="link" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredColumns = allColumns.filter(
    (c) => selectedColumns.includes(c.key) || c.key === 'actions'
  );

  const columnMenu = (
    <div className="column-filter-menu">
      <div className="column-filter-grid">
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
      </div>

      <div className="column-filter-divider" />

      <div>
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => setSelectedColumns(DEFAULT_COLUMNS)}
        >
          Reset of Defaults
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
      <div className="serachbar-bread">
        <Space style={{ flexWrap: 'wrap' }}>
          <Search
            placeholder="Search patient"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => {
              if (selectedDoctor) {
                loadWaitingList(selectedDoctor, 1, value);
              } else {
                dispatch(fetchAllWaitingList({ page: 1, limit, search: value }));
              }
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('');

              if (selectedDoctor) {
                loadWaitingList(selectedDoctor, 1, '');
              } else {
                dispatch(fetchAllWaitingList({ page: 1, limit, search: '' }));
              }
            }}
          />

          <Dropdown dropdownRender={() => columnMenu} trigger={['click']}>
            <Button icon={<FilterOutlined />} />
          </Dropdown>

          <Select
            showSearch
            allowClear
            className="searchbar-search"
            placeholder="Select Doctor"
            style={{ width: 180, height: 40 }}
            options={doctors.map((d) => ({
              label: d.name,
              value: d._id,
            }))}
            onChange={(val) => {
              setSelectedDoctor(val);
              setSearchText('');
              if (val) loadWaitingList(val, 1, '');
            }}
          />
          <Dropdown dropdownRender={() => statusMenu} trigger={['click']}>
            <Button icon={<FilterOutlined />} />
          </Dropdown>
        </Space>
      </div>

      <div className="table-scroll-container">
        <Table
          rowKey="_id"
          loading={loading}
          columns={filteredColumns}
          scroll={{ x: 1000 }}
          dataSource={selectedDoctor ? doctorQueue : waitingList}
          rowClassName={(record) => {
            if (record.status === 'completed') return 'row-completed';
            if (record.status === 'called') return 'row-called';
            if (record.status === 'cancelled') return 'row-cancelled';
            return '';
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, pageSize) => {
              if (selectedDoctor) {
                loadWaitingList(selectedDoctor, p, searchText);
              } else {
                dispatch(fetchAllWaitingList({ page: p, limit: pageSize, search: searchText }));
              }
            },
          }}
        />
      </div>
    </div>
  );
};

export default DoctorWaitingListPage;
