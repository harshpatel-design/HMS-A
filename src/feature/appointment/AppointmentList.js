import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAppointments } from '../../slices/appointmentSlice';
import { FilterOutlined } from '@ant-design/icons';
import Breadcrumbs from '../comman/Breadcrumbs';
import dayjs from 'dayjs';
import '../../hcss.css';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { deleteAppointment, updateAppointment } from '../../slices/appointmentSlice';

import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Dropdown,
  Checkbox,
  Pagination,
  Tooltip,
  Modal,
  message,
  DatePicker,
  Select,
} from 'antd';

const { Search } = Input;

const AppointmentList = () => {
  const dispatch = useDispatch();
  const { RangePicker } = DatePicker;
  const { appointments, total, page, limit, loading } = useSelector((state) => state.appointment);
  const [searchText, setSearchText] = useState('');
  const [ordering, setOrdering] = useState('-appointmentDate');
  const [dateRange, setDateRange] = useState(null);

  const defaultChecked = [
    'date',
    'time',
    'patientName',
    'doctorId',
    'reason',
    'type',
    'status',
    'phone',
  ];

  const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

  useEffect(() => {
    loadData(1, ordering);
  }, []);
  const loadData = (pageNum, orderingValue = ordering) => {
    dispatch(
      fetchAppointments({
        page: pageNum,
        limit: 10,
        search: searchText,
        ordering: orderingValue,
        startDate: dateRange?.[0]?.startOf('day').toISOString(),
        endDate: dateRange?.[1]?.endOf('day').toISOString(),
      })
    );
  };

  const handlePageChange = (newPage) => {
    let startDate = null,
      endDate = null;

    if (dateRange) {
      startDate = dateRange[0].startOf('day').toISOString();
      endDate = dateRange[1].endOf('day').toISOString();
    }

    loadData(newPage, ordering, startDate, endDate);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Cancel Appointment?',
      content: `Are you sure you want to cancel this appointment?`,
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(deleteAppointment(record._id)).unwrap();
          message.success('Appointment cancelled successfully!');
          dispatch(fetchAppointments());
        } catch (err) {
          message.error(err || 'Failed to cancel appointment');
        }
      },
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    let orderString = '-appointmentDate';

    if (sorter.order === 'ascend') {
      orderString = sorter.field;
    } else if (sorter.order === 'descend') {
      orderString = `-${sorter.field}`;
    }

    setOrdering(orderString);
    loadData(pagination.current, orderString);
  };

  const onSearch = (value) => {
    setSearchText(value);

    dispatch(
      fetchAppointments({
        page: 1,
        limit: 10,
        search: value,
        ordering,
      })
    );
  };

  const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'checked-in', label: 'Checked-in' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' },
  ];

  const statusColors = {
    scheduled: 'blue',
    completed: 'green',
    cancelled: 'red',
    'no-show': 'orange',
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await dispatch(
        updateAppointment({
          id: appointmentId,
          data: { status: newStatus },
        })
      ).unwrap();

      message.success('Status updated successfully');
    } catch (err) {
      message.error(err?.message || 'Failed to update status');
    }
  };
  const allColumns = [
    {
      key: 'patientName',
      title: 'Patient',
      width: 150,
      render: (r) => {
        const name = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`;
        return (
          <Tooltip title={name}>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            >
              {name}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: 'doctorId',
      title: 'Dr. Name',
      width: 150,
      render: (r) => {
        const docName = r.doctor?.user?.name || 'N/A';
        return (
          <Tooltip title={docName}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {docName}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: 'date',
      title: 'Date',
      width: 120,
      render: (r) => new Date(r.appointmentDate).toLocaleDateString('en-IN'),
      sorter: true,
    },
    {
      key: 'time',
      title: 'Time',
      width: 120,
      render: (r) => `${r.timeSlot?.start || '--'} - ${r.timeSlot?.end || '--'}`,
    },
    {
      key: 'type',
      title: 'Type',
      width: 120,
      dataIndex: 'consultationType',
    },
    {
      key: 'status',
      width: 120,
      title: 'Status',
      render: (record) => {
        const currentStatus = record.status;

        return (
          <Select
            size="small"
            value={currentStatus}
            style={{ width: 140 }}
            onChange={(value) => {
              Modal.confirm({
                title: 'Change Appointment Status?',
                content: `Change status to "${value}"?`,
                okText: 'Yes',
                cancelText: 'No',
                onOk: () => handleStatusChange(record._id, value),
              });
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                <Tag
                  color={statusColors[opt.value]}
                  style={{ marginRight: 0, width: '100%', border: 'none', fontWeight: 600 }}
                >
                  {opt.label}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },

    {
      key: 'notes',
      title: 'Notes',
      minWidth: 150,
      dataIndex: 'notes',
    },
    {
      key: 'phone',
      title: 'Phone No',
      width: 120,
      render: (record) => record.patient?.phone || '—',
    },
    {
      key: 'createdAt',
      title: 'Created Time',
      width: 110,
      render: (r) => (r.createdAt ? dayjs(r.createdAt).format('hh:mm A') : '—'),
    },
    {
      key: 'updatedAt',
      title: 'Updated Time',
      width: 110,
      render: (r) => (r.updatedAt ? dayjs(r.updatedAt).format('hh:mm A') : '—'),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 105,
      render: (record) => (
        <Space size="middle">
          <Link to={`/edit-appointment/${record._id}`}>
            <Button type="text" icon={<EditOutlined />} />
          </Link>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
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

      <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedColumns(defaultChecked)}>
        Reset to default
      </Button>
    </div>
  );

  const handleReset = () => {
    setSearchText('');
    setOrdering('-appointmentDate');

    dispatch(
      fetchAppointments({
        page: 1,
        limit: 10,
        search: '',
        ordering: '-appointmentDate',
      })
    );
  };

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title="Appointments List"
          showBack={true}
          backTo="/appointments"
          items={[{ label: 'Appointments', href: '/appointments' }, { label: 'Appointments List' }]}
        />

        <div className="serachbar-bread">
          <Space style={{ flexWrap: 'wrap' }}>
            <Search
              placeholder="Search patient or doctor"
              onSearch={onSearch}
              className="searchbar-search"
              allowClear
            />

            <Button onClick={handleReset} type="default" icon={<ReloadOutlined />} />

            <RangePicker
              format="YYYY-MM-DD"
              onChange={(dates) => {
                const startDate = dates ? dates[0].startOf('day').toISOString() : null;
                const endDate = dates ? dates[1].endOf('day').toISOString() : null;

                dispatch(
                  fetchAppointments({
                    page: 1,
                    limit: 10,
                    search: searchText,
                    ordering,
                    startDate,
                    endDate,
                  })
                );
              }}
            />
            <Dropdown popupRender={() => columnMenu} trigger={['click']}>
              <Button className="column-btn" icon={<FilterOutlined />}></Button>
            </Dropdown>

            <Link to="/add-appointment">
              <Button type="primary" className="btn">
                Add Appointment
              </Button>
            </Link>
          </Space>
        </div>

        <div className="table-scroll-container">
          <Table
            columns={filteredColumns}
            dataSource={appointments}
            loading={loading}
            pagination={false}
            rowKey="_id"
            onChange={handleTableChange}
          />
        </div>
        <div>
          <Pagination
            current={page}
            total={total}
            pageSize={limit}
            onChange={handlePageChange}
            className="table-pagination"
          />
        </div>
      </div>
    </>
  );
};

export default AppointmentList;
