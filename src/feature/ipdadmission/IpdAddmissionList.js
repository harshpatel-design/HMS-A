import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Drawer, Input, Select, Space, Table, Form, DatePicker, message } from 'antd';
import { PlusOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';

import Breadcrumbs from '../comman/Breadcrumbs';

import { fetchPatientName } from '../../slices/patientSlice';
import {
  createIpdAdmission,
  fetchAllIpdAdmissions,
  fetchActiveIpdByPatient,
} from '../../slices/ipdAdmission.slice';
import { fetchFloors } from '../../slices/floorSlice';
import { fetchWards } from '../../slices/wardSlice';
import { fetchRooms } from '../../slices/roomSlice';
import { fetchBeds } from '../../slices/badSlice';
import { fetchChargeMasters } from '../../slices/chargeMasterSlice';
import { fetchDoctorsName } from '../../slices/doctorSlice';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

function IpdAddmissionList() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [searchText, setSearchText] = useState('');

  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [doctorNameSerach, setDoctorNameSerach] = useState(null);

  useEffect(() => {
    if (selectedFloor && selectedWard && selectedRoom) {
      dispatch(
        fetchBeds({
          page: 1,
          limit: 1000,
          floorId: selectedFloor,
          wardId: selectedWard,
          roomId: selectedRoom,
        })
      );
    }
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
    if (drawerOpen) {
      dispatch(fetchPatientName({ page: 1, limit: 1000 }));
      dispatch(fetchChargeMasters({ page: 1, limit: 1000 }));
      dispatch(fetchFloors({ page: 1, limit: 1000 }));
      dispatch(fetchDoctorsName({ search: doctorNameSerach }));
    }
  }, [dispatch, drawerOpen, doctorNameSerach]);

  useEffect(() => {
    dispatch(fetchAllIpdAdmissions({ page: 1, limit: 10 }));
  }, [dispatch]);

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
      (doctorNames || []).map((d) => ({
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
  const columns = [
    {
      title: 'Patient Name',
      key: 'name',
      dataIndex: 'patient',
      width: 180,
      render: (v) => `${v.firstName.toUpperCase()} ${v.lastName.toUpperCase()}`,
    },
    {
      title: 'gender',
      key: 'gender',
      dataIndex: ['patient', 'gender'],
      width: 80,
    },
    {
      title: 'City',
      key: 'city',
      dataIndex: ['patient', 'address'],
      render: (v) => v.city,
      width: 100,
    },
    {
      title: 'IPD',
      key: 'ipd',
      align: 'center',
      width: 80,
      render: () => <HomeOutlined style={{ fontSize: 18, color: '#1677ff' }} />,
    },
    {
      title: 'Phone',
      dataIndex: ['patient', 'phone'],
      key: 'mobile',
      width: 140,
    },
    {
      title: 'IsActive',
      dataIndex: ['patient', 'isActive'],
      key: 'isActive',
      width: 100,
      render: (v) => {
        return v ? 'Active' : 'Inactive';
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}></Button>
      ),
    },
  ];

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

    const patientId = record.patient?._id;
    const doctorId = record.doctor?._id;

    if (!patientId) return;
    if (!doctorId) return;

    dispatch(fetchActiveIpdByPatient(patientId))
      .unwrap()
      .then((res) => {
        console.log('ACTIVE IPD 👉', res);

        form.setFieldsValue({
          admissionDate: res.admissionDate ? dayjs(res.admissionDate) : null,
          dischargeDate: res.dischargeDate ? dayjs(res.dischargeDate) : null,

          // patient: res.patient?._id,
          // doctor: res.doctor?._id,
          // ward: res.ward || null,
          // room: res.room || null,
          // bed: res.bed || null,
          // charges: res.charges?.map((c) => c.chargeMaster),
          // isActive: res.isActive,
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

    console.log('PAYLOAD 👉', payload);

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
        console.log('qqqqqq', err.message);
        message.error(err.message || 'Failed to create IPD');
      });
  };

  console.log('abcd', doctorNames);

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="IPD List"
        showBack
        backTo="/dashboard"
        items={[{ label: 'IPD Admissions' }]}
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
          columns={columns}
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
          <Form.Item
            name="doctor"
            label="Doctor"
            onSearch={(value) => setDoctorNameSerach(value)}
            rules={[{ required: true }]}
          >
            <Select loading={doctorLoading} placeholder="Select Doctor" options={doctorOptions} />
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
