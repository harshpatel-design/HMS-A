import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Drawer,
  Form,
  Select,
  DatePicker,
  Checkbox,
  Dropdown,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import Breadcrumbs from '../comman/Breadcrumbs';

import {
  fetchPatientVisits,
  createPatientVisit,
  updatePatientVisit,
  deletePatientVisit,
  setSelectedVisit,
} from '../../slices/patientVisitSlice';
import { fetchDoctorsName } from '../../slices/doctorSlice';
import { fetchPatientName } from '../../slices/patientSlice';
import dayjs from 'dayjs';
import '../../hcss.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DEFAULT_PATIENT_COLUMNS = [
  'patient',
  'doctor',
  'specialization',
  'caseType',
  'city',
  'phone',
  'status',
  'nextFollowUpDate',
];

const PatientVisit = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { visits, loading, page, limit, total } = useSelector((state) => state.patientVisit);
  const { doctorNames } = useSelector((state) => state.doctor);
  const { patientName } = useSelector((state) => state.patient);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [searchPatient, setSearchPatient] = useState('');

  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_PATIENT_COLUMNS);

  const chargeCategories = [
    { label: 'Consultancy', value: 'consultancy' },
    { label: 'Lab', value: 'lab' },
    { label: 'Room', value: 'room' },
    { label: 'Procedure', value: 'procedure' },
    { label: 'Service', value: 'service' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    dispatch(fetchPatientVisits({ page: 1, limit: 10, search: search }));
  }, [dispatch, search]);

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchPatientName({ page: 1, limit: 1000, search: searchPatient }));
    }
  }, [dispatch, searchPatient, drawerOpen]);

  useEffect(() => {
    dispatch(fetchDoctorsName(search));
  }, [dispatch, search]);

  useEffect(() => {
    if (drawerMode === 'edit' && editingRecord) {
      form.setFieldsValue({
        patient: editingRecord.patient?._id,
        doctor: editingRecord.doctor?._id,
        caseType: editingRecord.caseType,
        caseStatus: editingRecord.caseStatus,
        visitReason: editingRecord.visitReason,
        chargeCategory: editingRecord.chargeCategory,
        nextFollowUpDate: editingRecord.nextFollowUpDate
          ? dayjs(editingRecord.nextFollowUpDate)
          : null,
        status: editingRecord.status,
      });
    }
  }, [drawerMode, editingRecord, form]);

  const patientNames = patientName.patients;

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(
          fetchPatientVisits({
            page: 1,
            limit,
            search: value,
          })
        );
      }, 500),
    [dispatch, limit]
  );

  const debouncedPatientSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchPatientName({ search: value }));
      }, 400),
    [dispatch]
  );

  const debouncedDoctorSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchDoctorsName(value));
      }, 400),
    [dispatch]
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
      debouncedPatientSearch.cancel();
      debouncedDoctorSearch.cancel();
    };
  }, [debouncedFetch, debouncedPatientSearch, debouncedDoctorSearch]);

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Visit?',
      content: 'Are you sure you want to delete this visit?',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deletePatientVisit(record._id)).unwrap();
          message.success('Visit deleted');
        } catch (err) {
          message.error(err?.message || 'Delete failed');
        }
      },
    });
  };

  const allColumns = [
    {
      title: 'Patient',
      key: 'patient',
      dataIndex: ['patient', 'firstName'],
      sorter: true,
      render: (_, record) =>
        record.patient ? `${record.patient.firstName} ${record.patient.lastName}` : '—',
    },
    {
      title: 'Doctor',
      key: 'doctor',
      dataIndex: ['doctor', 'user', 'name'],
      sorter: true,
      render: (v) => v || '—',
    },
    {
      title: 'Specialization',
      key: 'specialization',
      dataIndex: ['doctor', 'specialization', 'name'],
      sorter: true,
      render: (v) => v || '—',
    },
    {
      title: 'Case Type',
      key: 'caseType',
      dataIndex: 'caseType',
      sorter: true,
      render: (v) => {
        if (v === 'opd') {
          return (
            <Tag style={{ width: '100%', textAlign: 'center' }} color="blue">
              OPD
            </Tag>
          );
        } else if (v === 'ipd') {
          return (
            <Tag style={{ width: '100%', textAlign: 'center' }} color="green">
              IPD
            </Tag>
          );
        } else {
          return '—';
        }
      },
    },
    {
      title: 'Visit Date',
      key: 'visitDate',
      dataIndex: 'visitDate',
      render: (v) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Phone',
      key: 'phone',
      dataIndex: ['patient', 'phone'],
      sorter: true,
      render: (v) => v || '—',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      render: (status, record) => (
        <>
          <Select
            size="small"
            value={status}
            style={{ width: '100%', textAlign: 'center' }}
            onChange={async (value) => {
              try {
                await dispatch(
                  updatePatientVisit({
                    visitId: record._id,
                    payload: { status: value },
                  })
                ).unwrap();

                message.success('Status updated');
                dispatch(fetchPatientVisits({ page, limit }));
              } catch (err) {
                message.error(err?.message || 'Failed to update status');
              }
            }}
          >
            <Option value="active">Active</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </>
      ),
    },

    {
      title: 'Visit Date',
      key: 'visitDate',
      dataIndex: 'visitDate',
      render: (v) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Next Follow-up',
      key: 'nextFollowUpDate',
      dataIndex: 'nextFollowUpDate',
      sorter: true,
      render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      title: 'Created At',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (v) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      sorter: false,
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setDrawerMode('edit');
              setEditingRecord(record);
              dispatch(setSelectedVisit(record));
              setDrawerOpen(true);
            }}
          />
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
  const filteredColumns = allColumns.filter(
    (col) => selectedColumns.includes(col.key) || col.key === 'actions'
  );

  const handleTableChange = (pagination, filters, sorter) => {
    let ordering = '-createdAt';

    if (sorter?.field && sorter?.order) {
      ordering = sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
    }

    dispatch(
      fetchPatientVisits({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
        ordering,
      })
    );
  };

  const handleFinish = async (values) => {
    try {
      const payload = {
        ...values,
        nextFollowUpDate: values.nextFollowUpDate ? values.nextFollowUpDate.toISOString() : null,
      };

      if (drawerMode === 'add') {
        await dispatch(createPatientVisit(payload)).unwrap();
        message.success('Visit created');
      } else {
        await dispatch(
          updatePatientVisit({
            visitId: editingRecord._id,
            payload,
          })
        ).unwrap();
        message.success('Visit updated');
      }

      setDrawerOpen(false);
      dispatch(fetchPatientVisits({ page, limit }));
    } catch (err) {
      message.error(err?.message || 'Something went wrong');
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs title="Patient Visits" items={[{ label: 'Patient Visits' }]} />

        <div className="serachbar-bread">
          <Space style={{ flexWrap: 'wrap' }}>
            <Search
              placeholder="Search visit"
              allowClear
              className="searchbar-search"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                debouncedFetch(e.target.value);
              }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
              }}
            />

            <Dropdown dropdownRender={() => columnMenu} trigger={['click']}>
              <Button className="column-btn" icon={<FilterOutlined />}></Button>
            </Dropdown>

            <RangePicker
              format="YYYY-MM-DD"
              onChange={(dates) => {
                dispatch(
                  fetchPatientVisits({
                    page: 1,
                    limit: 10,
                    search: searchText,
                    startDate: dates?.[0]?.format('YYYY-MM-DD'),
                    endDate: dates?.[1]?.format('YYYY-MM-DD'),
                  })
                );
              }}
            />
            <Button
              icon={<PlusOutlined />}
              type="primary"
              className="btn"
              onClick={() => {
                setDrawerMode('add');
                setEditingRecord(null);
                form.resetFields();
                setDrawerOpen(true);
              }}
            >
              Add Visit
            </Button>
          </Space>
        </div>

        <div className="table-scroll-container">
          <Table
            rowKey="_id"
            columns={filteredColumns}
            dataSource={visits}
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              showQuickJumper: limit > 100 && limit < 500,
              showTotal: (totalRecord) => `Total ${totalRecord} items`,
            }}
          />
        </div>

        <Drawer
          title={drawerMode === 'add' ? 'Add Visit' : 'Edit Visit'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          destroyOnClose
        >
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item
              name="patient"
              label="Patient Name"
              rules={[{ required: true, message: 'Patient is required' }]}
            >
              <Select
                showSearch
                placeholder="Select Patient"
                filterOption={false}
                onSearch={(value) => debouncedPatientSearch(value)}
              >
                {patientNames &&
                  patientNames.map((doc) => (
                    <Option key={doc._id} value={doc._id}>
                      {doc.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="doctor"
              label="Doctor"
              rules={[{ required: true, message: 'Doctor is required' }]}
            >
              <Select
                showSearch
                placeholder="Select doctor"
                filterOption={false}
                onSearch={(value) => debouncedDoctorSearch(value)}
              >
                {doctorNames.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="caseType"
              label="Case Type"
              rules={[{ required: true, message: 'Case type is required' }]}
            >
              <Select placeholder="Select case type">
                <Option value="opd">OPD</Option>
                <Option value="ipd">IPD</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="chargeCategory"
              label="Charge Category"
              rules={[{ required: true, message: 'Charge category is required' }]}
            >
              <Select placeholder="Select categories">
                {chargeCategories.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="caseStatus"
              label="Case Status"
              rules={[{ required: true, message: 'Case status is required' }]}
            >
              <Select placeholder="Select case status">
                <Option value="new">New</Option>
                <Option value="old">Old</Option>
                <Option value="followup">Follow-up</Option>
                <Option value="emergency">Emergency</Option>
              </Select>
            </Form.Item>

            <Form.Item name="visitReason" label="Visit Reason">
              <Input />
            </Form.Item>

            <Form.Item name="nextFollowUpDate" label="Next Follow-up">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Space className="width-space">
              <Button type="primary" htmlType="submit" className="btn-full">
                {drawerMode === 'add' ? 'Create' : 'Update'}
              </Button>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            </Space>
          </Form>
        </Drawer>
      </div>
    </>
  );
};

export default PatientVisit;
