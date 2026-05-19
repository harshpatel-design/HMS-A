import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Form,
  DatePicker,
  message,
  Tag,
  Modal,
  Tooltip,
  Checkbox,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  HomeOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';

import Breadcrumbs from '../comman/Breadcrumbs';

import { fetchPatientName } from '../../slices/patientSlice';
import {
  createIpdAdmission,
  fetchAllIpdAdmissions,
  fetchIpdAdmissionById,
  dischargeIpdPatient,
} from '../../slices/ipdAdmission.slice';
import { fetchFloors } from '../../slices/floorSlice';
import { fetchWards } from '../../slices/wardSlice';
import { fetchRooms } from '../../slices/roomSlice';
import { fetchBeds } from '../../slices/badSlice';
import { fetchChargeMasters } from '../../slices/chargeMasterSlice';
import { fetchDoctorsName } from '../../slices/doctorSlice';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

function IpdAddmissionList() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [searchText, setSearchText] = useState('');
  const [dischargeDate, setDischargeDate] = useState(dayjs());

  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [doctorNameSerach, setDoctorNameSerach] = useState(null);

  const DEFAULT_PATIENT_COLUMNS = [
    'name',
    'phone',
    'age',
    'city',
    'gender',
    'caseType',
    'action',
    'caseNumber',
    'isActive',
    'mobile',
    'admissionDate',
  ];

  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_PATIENT_COLUMNS);

  useEffect(() => {
    dispatch(
      fetchBeds({
        page: 1,
        limit: 1000,
        floorId: selectedFloor,
        wardId: selectedWard,
        roomId: selectedRoom,
      })
    );
  }, [selectedFloor, selectedWard, selectedRoom, dispatch]);

  const { ipdAdmissions, loading, total, page, limit } = useSelector((state) => state.ipd);
  const { patientName, loading: patientLoading } = useSelector((state) => state.patient);
  const { floors, loading: floorLoading } = useSelector((state) => state.floor);
  const { wards, loading: wardLoading } = useSelector((state) => state.ward);
  const { rooms, loading: roomLoading } = useSelector((state) => state.room);
  const { beds, loading: bedLoading } = useSelector((state) => state.bed);
  const { doctorNames, loading: doctorLoading } = useSelector((state) => state.doctor);
  const { chargeMasters, loading: chargeMastersLoading } = useSelector(
    (state) => state.chargeMaster
  );

  useEffect(() => {
    if (selectedFloor) {
      dispatch(fetchWards({ page: 1, limit: 1000, floorId: selectedFloor }));
    }
  }, [dispatch, selectedFloor]);

  useEffect(() => {
    if (selectedFloor) {
      dispatch(fetchRooms({ page: 1, limit: 1000, floorId: selectedFloor }));
    }
  }, [dispatch, selectedFloor]);

  useEffect(() => {
    if (selectedFloor && (selectedWard || selectedRoom)) {
      dispatch(
        fetchBeds({
          page: 1,
          limit: 1000,
          wardId: selectedWard,
          roomId: selectedRoom,
        })
      );
    }
  }, [dispatch, selectedFloor, selectedWard, selectedRoom]);

  useEffect(() => {
    dispatch(fetchAllIpdAdmissions({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchPatientName({ page: 1, limit: 1000 }));
      dispatch(fetchChargeMasters({ page: 1, limit: 1000 }));
      dispatch(fetchFloors({ page: 1, limit: 1000 }));
    }
  }, [dispatch, drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchDoctorsName({ search: doctorNameSerach }));
    }
  }, [dispatch, drawerOpen, doctorNameSerach]);

  const handlePageChange = (pageNumber, pageSize) => {
    dispatch(
      fetchAllIpdAdmissions({
        page: pageNumber,
        limit: pageSize,
        search: searchText,
      })
    );
  };

  const patientOptions = useMemo(
    () =>
      (patientName?.patients || []).map((p) => ({
        label: p.name,
        value: p._id,
      })),
    [patientName]
  );
  const doctorOptions = useMemo(
    () =>
      (doctorNames || []).map((d, index) => ({
        label: d.name,
        value: d._id,
      })),
    [doctorNames]
  );

  const floorOptions = useMemo(
    () => (floors || []).map((f) => ({ label: f.name, value: f._id })),
    [floors]
  );

  const wardOptions = useMemo(
    () => (wards || []).map((w) => ({ label: w.name, value: w._id })),
    [wards]
  );

  const roomOptions = useMemo(
    () => (rooms || []).map((r) => ({ label: r.roomNumber, value: r._id })),
    [rooms]
  );

  const bedOptions = useMemo(
    () => (beds || []).map((b) => ({ label: b.bedNumber, value: b._id })),
    [beds]
  );

  const chargeOptions = useMemo(
    () => (chargeMasters || []).map((c) => ({ label: c.name, value: c._id })),
    [chargeMasters]
  );

  const handleDischarge = (record) => {
    const pid = record.patient._id;
    Modal.confirm({
      title: 'Discharge Patient',
      className: 'discharge-modal',
      content: (
        <div className="discharge-modal-content">
          <p className="discharge-modal-text">Please select discharge date</p>

          <DatePicker
            defaultValue={dayjs()}
            format="DD-MM-YYYY"
            onChange={(date) => {
              setDischargeDate(date || dayjs());
            }}
          />
        </div>
      ),

      okText: 'Discharge',
      cancelText: 'Cancel',
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          const payload = {
            id: record._id,
            dischargeDate: dischargeDate?.format('DD-MM-YYYY'),
            bedId: record.bed,
            patientId: pid,
          };
          await dispatch(dischargeIpdPatient(payload)).unwrap();
          message.success('Patient discharged successfully');

          dispatch(
            fetchAllIpdAdmissions({
              page,
              limit,
              search: searchText,
            })
          );
        } catch (err) {
          message.error(err?.message || 'Failed to discharge patient');
        }
      },
    });
  };

  const allColumns = [
    {
      title: 'Case No.',
      key: 'caseNumber',
      dataIndex: ['patient', 'caseNumber'],
      width: 60,
      fixed: 'left',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <div className="table-ellipsis" style={{ fontWeight: 600 }}>
            {v || '—'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Patient Name',
      key: 'name',
      dataIndex: 'patient',
      width: 150,
      ellipsis: true,
      render: (patient) => {
        const name = `${patient?.firstName?.toUpperCase() || ''} ${
          patient?.lastName?.toUpperCase() || ''
        }`;

        return (
          <Tooltip title={name}>
            <div className="table-ellipsis">{name}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Age',
      key: 'age',
      dataIndex: ['patient', 'age'],
      width: 50,
      render: (v) => v || '—',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: ['patient', 'gender'],
      width: 80,
      render: (v) => (v ? v.toUpperCase() : '—'),
    },
    {
      title: 'Bed Name',
      key: 'bedName',
      dataIndex: ['patient', 'ipdDetails'],
      width: 130,
      ellipsis: true,
      render: (v) => {
        const bedName = bedOptions.find((b) => b.value === v?.bed)?.label || '—';

        return (
          <Tooltip title={bedName}>
            <div className="table-ellipsis">{bedName}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'City',
      width: 100,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v?.patient?.address?.city}>
          <div className="table-ellipsis">{v?.patient?.address?.city?.toUpperCase() || '—'}</div>
        </Tooltip>
      ),
    },
    {
      title: 'IPD',
      key: 'ipd',
      align: 'center',
      width: 50,
      render: () => <HomeOutlined style={{ fontSize: 18, color: '#1677ff' }} />,
    },
    {
      title: 'Phone',
      dataIndex: ['patient', 'phone'],
      key: 'mobile',
      width: 100,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <div className="table-ellipsis">{v || '—'}</div>
        </Tooltip>
      ),
    },
    {
      title: 'IsActive',
      dataIndex: ['isActive'],
      key: 'isActive',
      width: 100,
      render: (v) => {
        return v ? (
          <Tag color="blue" className="w-100">
            Active
          </Tag>
        ) : (
          <Tag color="red" className="w-100">
            Inactive
          </Tag>
        );
      },
    },
    {
      title: 'Admission Date',
      dataIndex: ['patient', 'ipdDetails', 'admissionDate'],
      key: 'admissionDate',
      width: 90,
      render: (value) => (
        <Space className="action">{value ? dayjs(value).format('DD-MM-YYYY') : '-'}</Space>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (value) => (
        <Space className="action">{value ? dayjs(value).format('DD-MM-YYYY') : '-'}</Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space className="action">
          <Tooltip title="Edit Patient">
            <Button
              type="link"
              icon={<EditOutlined />}
              style={{ color: '#1677ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="View Charge">
            <Button
              type="link"
              icon={<EyeOutlined />}
              style={{ color: '#333' }}
              onClick={() => navigate(`/chargeby-patient/${record.patient?._id}`)}
            />
          </Tooltip>
          <Tooltip title="View Payments">
            <Button
              type="link"
              icon={<HistoryOutlined style={{ color: 'orange' }} />}
              onClick={() => navigate(`/patient-payment-history/${record.patient?._id}`)}
            />
          </Tooltip>
          <Tooltip title="Receive Payments">
            <Button
              type="link"
              icon={<CreditCardOutlined style={{ color: 'green' }} />}
              onClick={() => navigate(`/receive-charge/${record.patient?._id}`)}
            />
          </Tooltip>
          <Tooltip title="Discharge">
            <Button
              type="link"
              icon={<ExportOutlined />}
              style={{ color: 'red' }}
              onClick={() => handleDischarge(record)}
            />
          </Tooltip>
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
        style={{ padding: 0, textAlign: 'left' }}
        onClick={() => setSelectedColumns(DEFAULT_PATIENT_COLUMNS)}
      >
        Reset to default
      </Button>
    </div>
  );

  const filteredColumns = allColumns.filter(
    (col) => selectedColumns.includes(col.key) || col.key === 'actions'
  );
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(
          fetchAllIpdAdmissions({
            page: 1,
            limit,
            search: value,
          })
        );
      }, 700),
    [dispatch, limit]
  );
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleEdit = (record) => {
    setDrawerMode('edit');
    setDrawerOpen(true);

    setSelectedFloor(record?.floor);
    setSelectedRoom(record?.room);
    setSelectedWard(record?.ward);

    const patientId = record.patient?._id;
    const doctorId = record.doctor?._id;
    const ipdId = record._id;

    if (!patientId) return;
    if (!doctorId) return;

    dispatch(fetchIpdAdmissionById(ipdId))
      .unwrap()
      .then((res) => {
        form.setFieldsValue({
          admissionDate: res.admissionDate ? dayjs(res.admissionDate) : null,
          dischargeDate: res.dischargeDate ? dayjs(res.dischargeDate) : null,

          patient: res?.patient,
          doctor: res?.doctor,
          ward: res.ward || null,
          room: res.room || null,
          bed: res.bed || null,
          floor: res.floor || null,
          caseType: res.caseType,
          caseStatus: res.caseStatus,
          charges: [...new Set(res.charges?.map((c) => c.chargeMaster))],
          isActive: res.isActive,
        });
      })
      .catch((err) => {
        console.error('Failed to load active IPD', err);
      });
  };

  const onFinish = (values) => {
    const selectedCharges = Array.isArray(values.charges)
      ? values.charges
      : values.charges
        ? [values.charges]
        : [];

    const chargesArray = selectedCharges.map((chargeId) => ({
      chargeMaster: chargeId,
      date: values.admissionDate.toDate(),
    }));
    const payload = {
      patient: values.patient,
      admissionDate: values.admissionDate.toDate(),
      floor: values.floor,
      ward: values.ward || null,
      room: values.room || null,
      bed: values.bed,
      doctor: values.doctor,
      caseType: values.caseType,
      caseStatus: values.caseStatus,
      charges: chargesArray.length ? chargesArray : undefined,
      isActive: values.isActive ?? true,
    };
    dispatch(createIpdAdmission(payload))
      .unwrap()
      .then(() => {
        form.resetFields();
        setDrawerOpen(false);

        dispatch(
          fetchAllIpdAdmissions({
            page: 1,
            limit,
            search: searchText,
          })
        );
      })
      .catch((err) => {
        message.error(err.message || 'Failed to create IPD');
      });
  };

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="IPD List"
        showBack={true}
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'IPD List' }]}
      />

      <div className="serachbar-bread">
        <Space style={{ flexWrap: 'wrap' }}>
          <Search
            placeholder="Search Patient"
            allowClear
            className="searchbar-search"
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              debouncedSearch(value);
            }}
          />

          <Dropdown popupRender={() => columnMenu} trigger={['click']}>
            <Button className="column-btn" icon={<FilterOutlined />}></Button>
          </Dropdown>

          <RangePicker
            format="YYYY-MM-DD"
            onChange={(dates) => {
              dispatch(
                fetchAllIpdAdmissions({
                  page: 1,
                  limit: 10,
                  search: searchText,
                  startDate: dates?.[0]?.toDate(),
                  endDate: dates?.[1]?.toDate(),
                })
              );
            }}
          />

          <Button
            type="primary"
            className="btn"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setDrawerMode('add');
              setDrawerOpen(true);
            }}
          >
            Add IPD
          </Button>
        </Space>
      </div>

      <div className="table-scroll-container">
        <Table
          rowKey="_id"
          columns={filteredColumns}
          dataSource={ipdAdmissions}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: handlePageChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (t) => `Total ${t} records`,
          }}
        />
      </div>

      <Drawer
        title={drawerMode === 'add' ? 'Add IPD Admission' : 'Edit IPD Admission'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="admissionDate"
            label="Admission Date"
            rules={[{ required: true, message: 'Please select admission date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item name="dischargeDate" label="Discharge Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="patient" label="Patient" rules={[{ required: true }]}>
            <Select loading={patientLoading} options={patientOptions} />
          </Form.Item>
          <Form.Item name="doctor" label="Doctor" rules={[{ required: true }]}>
            <Select
              loading={doctorLoading}
              showSearch
              placeholder="Select Doctor"
              options={doctorOptions}
              onSearch={(value) => setDoctorNameSerach(value)}
              filterOption={false}
            />
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

          <Form.Item
            name="floor"
            label="Floor"
            rules={[{ required: true, message: 'Please select floor' }]}
          >
            <Select
              loading={floorLoading}
              options={floorOptions}
              allowClear
              placeholder="Select Floor"
              onChange={(value) => {
                setSelectedFloor(value);
                setSelectedRoom(null);
                setSelectedWard(null);
                form.setFieldsValue({
                  ward: null,
                  room: null,
                  bed: null,
                });
              }}
            />
          </Form.Item>

          <Form.Item name="ward" label="Ward">
            <Select
              loading={wardLoading}
              options={wardOptions}
              disabled={!selectedFloor || selectedRoom}
              allowClear
              placeholder="Select Ward"
              onChange={(value) => {
                setSelectedWard(value);
                setSelectedRoom(null);
                form.setFieldsValue({
                  bed: null,
                });
              }}
            />
          </Form.Item>

          <Form.Item name="room" label="Room">
            <Select
              loading={roomLoading}
              allowClear
              options={roomOptions}
              disabled={!selectedFloor || selectedWard}
              placeholder="Select Room"
              onChange={(value) => {
                setSelectedRoom(value);
                setSelectedWard(null);
                form.setFieldsValue({
                  bed: null,
                });
              }}
            />
          </Form.Item>

          <Form.Item name="bed" label="Bed" rules={[{ required: true }]}>
            <Select
              loading={bedLoading}
              options={bedOptions}
              allowClear
              disabled={!selectedFloor || (!selectedWard && !selectedRoom)}
            />
          </Form.Item>

          <Form.Item name="charges" label="Charges" rules={[{ required: true }]}>
            <Select mode="multiple" loading={chargeMastersLoading} options={chargeOptions} />
          </Form.Item>

          <Form.Item name="isActive" label="Status" initialValue={true}>
            <Select
              options={[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]}
            />
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
  );
}

export default IpdAddmissionList;
