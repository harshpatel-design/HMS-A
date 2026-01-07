import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  message,
  Checkbox,
  Select,
  Drawer,
  Dropdown,
  InputNumber,
  Form,
  Spin,
  DatePicker,
} from 'antd';

import { EditOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';

import debounce from 'lodash/debounce';
import Breadcrumbs from '../comman/Breadcrumbs';
import '../../index.css';

import {
  fetchCharges,
  createCharge,
  updateCharge,
  fetchChargeById,
  resetChargeState,
} from '../../slices/chargeSlice';
import { fetchPatientName } from '../../slices/patientSlice';
import { fetchChargeMasters } from '../../slices/chargeMasterSlice';
import { sortBy } from 'lodash';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ChargeList = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { charges, loading, page, limit, total } = useSelector((state) => state.charge);
  const { patientName } = useSelector((state) => state.patient);
  const { chargeMasters } = useSelector((state) => state.chargeMaster);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchCharger, setsearchCharger] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pickerKey, setPickerKey] = useState(0);

  const patientNames = patientName.patients;

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchPatientName({ page: 1, limit: 1000, search: searchPatient }));
    }
  }, [dispatch, searchPatient, drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchChargeMasters({ page: 1, limit: 1000, search: searchCharger }));
    }
  }, [dispatch, drawerOpen, searchCharger]);

  useEffect(() => {
    dispatch(fetchCharges({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleReset = () => {
    setSearchText('');
    setPickerKey((prev) => prev + 1);
    dispatch(
      fetchCharges({
        page: 1,
        limit: 10,
        search: '',
        startDate: '',
        endDate: '',
      })
    );
  };

  const handleEdit = async (record) => {
    try {
      setDrawerMode('edit');
      setEditingRecord(record);
      setDrawerOpen(true);

      const res = await dispatch(fetchChargeById(record.patient._id)).unwrap();

      if (!res?.charges?.length) {
        message.error('No charge data found');
        return;
      }

      const charge = res.charges[0];

      form.setFieldsValue({
        patient: charge.patient._id,
        chargeMaster: charge.chargeMaster._id,
        baseAmount: charge.baseAmount,
        discountAmount: charge.discountAmount,
        discountType: charge.discountType,
        finalAmount: charge.finalAmount,
        paidAmount: charge.paidAmount,
        paymentStatus: charge.paymentStatus,
        balanceAmount: charge.balanceAmount,
        caseContext: {
          caseType: charge.caseContext.caseType,
          caseStatus: charge.caseContext.caseStatus,
        },
      });
    } catch (err) {
      console.error(err);
      message.error('Failed to load charge details');
    }
  };

  const defaultChecked = [
    'name',
    'amount',
    'famount',
    'damount',
    'status',
    'patient',
    'pamount',
    'bamount',
    'paymentStatus',
    'createdAt',
  ];

  const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

  const allColumns = [
    {
      title: 'Patient',
      key: 'patient',
      width: 150,
      sorter: true,
      render: (_, record) => {
        return record.patient ? `${record.patient.firstName} ${record.patient.lastName}` : '—';
      },
    },
    {
      title: 'Charge Name',
      dataIndex: ['chargeMaster', 'name'],
      key: 'name',
      width: 150,
      sorter: true,
    },

    {
      title: 'Amount',
      dataIndex: 'baseAmount',
      key: 'amount',
      width: 110,
      sorter: true,
      render: (v) => v,
    },
    {
      title: 'Discount Amount',
      dataIndex: 'discountAmount',
      key: 'damount',
      width: 170,
      render: (v) => v,
    },
    {
      title: 'final Amount',
      dataIndex: 'finalAmount',
      key: 'famount',
      width: 130,
      render: (v) => v,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      width: 130,
      key: 'pamount',
      render: (v) => v,
    },
    {
      title: 'balance Amount',
      dataIndex: 'balanceAmount',
      width: 160,
      key: 'bamount',
      render: (v) => v,
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 150,
      sorter: true,
      render: (v) => v,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (v) => {
        return v ? new Date(v).toLocaleDateString() : '—';
      },
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 50,
      render: (record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Space>
      ),
    },
  ];

  const filteredColumns = allColumns.filter(
    (c) => selectedColumns.includes(c.key) || c.key === 'actions'
  );

  const onFinish = async (values) => {
    try {
      let res;
      const payload = {
        patient: values.patient,
        chargeMaster: values.chargeMaster,
        balanceAmount: values.balanceAmount,
        baseAmount: values.baseAmount,
        paymentStatus: values.paymentStatus,
        discountAmount: values.discountAmount || 0,
        discountType: values.discountType || 'none',
        paidAmount: values.paidAmount || 0,
        caseContext: {
          caseType: values.caseContext?.caseType,
          caseStatus: values.caseContext?.caseStatus,
        },
      };
      console.log('Payload to backend:', payload);

      if (drawerMode === 'add') {
        res = await dispatch(createCharge(payload)).unwrap();
        message.success(res?.message || 'Charge added successfully');
      } else if (drawerMode === 'edit') {
        const res = await dispatch(
          updateCharge({
            id: editingRecord._id,
            payload,
          })
        ).unwrap();
        message.success(res?.message || 'Charge updated successfully');
      }

      form.resetFields();
      setDrawerOpen(false);
      setDrawerMode('add');

      dispatch(fetchCharges({ page, limit }));
    } catch (err) {
      console.error(err);
      message.error(err?.message || 'Operation failed');
    }
  };

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(
          fetchCharges({
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

  const debouncedChargeSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchChargeMasters({ search: value }));
      }, 400),
    [dispatch]
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const handleTableChange = useCallback(
    (pagination, filters, sorter) => {
      const pageNumber = pagination.current;
      const pageSize = pagination.pageSize;

      let ordering = '-createdAt';

      if (sorter.order) {
        ordering = sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
      }
      dispatch(
        fetchCharges({
          page: pageNumber,
          limit: pageSize,
          search: searchText,
          ordering,
        })
      );
      // --------------------------------
    },
    [dispatch, searchText, searchText, searchText]
  );

  const handleChargeSelect = (chargeId) => {
    const resolvedId =
      typeof chargeId === 'object' && chargeId !== null ? chargeId.value : chargeId;

    const selected = chargeMasters.find((item) => item._id === resolvedId);

    if (!selected) return;

    form.setFieldsValue({
      baseAmount: selected.amount,
      finalAmount: selected.amount,

      discountAmount: 0,
      discountType: 'none',
      paymentStatus: 'unpaid',
    });
  };

  const calculateFinalAmount = useCallback(
    (values) => {
      const { baseAmount = 0, discountAmount = 0, discountType } = values;

      let final = baseAmount;

      if (discountType === 'flat') {
        final = baseAmount - discountAmount;
      } else if (discountType === 'percentage') {
        final = baseAmount - (baseAmount * discountAmount) / 100;
      } else {
        final = baseAmount;
      }

      if (final < 0) final = 0;

      form.setFieldValue('finalAmount', final);
    },
    [form]
  );

  const handleDiscountTypeChange = (value) => {
    if (value === 'none') {
      form.setFieldValue('discountAmount', 0);
      form.setFieldValue('finalAmount', form.getFieldValue('baseAmount'));
    }
  };

  const handlePaymentStatus = useCallback(
    (values) => {
      const finalAmount = values.finalAmount || 0;
      const paidAmount = values.paidAmount || 0;

      let status = 'unpaid';

      if (paidAmount === 0) {
        status = 'unpaid';
      } else if (paidAmount === finalAmount) {
        status = 'paid';
      } else if (paidAmount < finalAmount) {
        status = 'partial';
      }

      form.setFieldValue('paymentStatus', status);
    },
    [form]
  );

  const calculateBalanceAmount = useCallback(
    (values) => {
      const finalAmount = values.finalAmount || 0;
      const paidAmount = values.paidAmount || 0;

      let balance = finalAmount - paidAmount;

      if (balance < 0) balance = 0;

      form.setFieldValue('balanceAmount', balance);
    },
    [form]
  );

  const handleValuesChangeLogic = useCallback(
    (changed, values) => {
      if (changed.discountAmount !== undefined || changed.discountType !== undefined) {
        calculateFinalAmount(values);
      }

      if (changed.finalAmount !== undefined || changed.paidAmount !== undefined) {
        handlePaymentStatus(values);
        calculateBalanceAmount(values); // ← BALANCE ALSO UPDATED HERE
      }
    },
    [calculateFinalAmount, handlePaymentStatus, calculateBalanceAmount]
  );

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title="Charge List"
          showBack
          backTo="/dashboard"
          items={[{ label: 'Charges', href: '/charges' }, { label: 'Charge List' }]}
        />

        <div className="serachbar-bread">
          <Space style={{flexWrap:"wrap"}}>
            <Search
              placeholder="Search charges"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                debouncedFetch(e.target.value);
              }}
              style={{ maxWidth: 220 , width:"100%" }}
            />

            <Button icon={<ReloadOutlined />} onClick={handleReset} />

            <Dropdown
              dropdownRender={() => (
                <div className="column-filter-menu">
                  {allColumns
                    .filter((c) => c.key !== 'actions')
                    .map((col) => (
                      <div key={col.key}>
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

                  <Button type="link" onClick={() => setSelectedColumns(defaultChecked)}>
                    Reset to default
                  </Button>
                </div>
              )}
              trigger={['click']}
            >
              <Button icon={<FilterOutlined />} />
            </Dropdown>

            <RangePicker
              format="YYYY-MM-DD"
              key={pickerKey}
              onChange={(dates) => {
                dispatch(
                  fetchCharges({
                    page: 1,
                    limit: 20,
                    search: searchText,
                    startDate: dates?.[0]?.format('YYYY-MM-DD'),
                    endDate: dates?.[1]?.format('YYYY-MM-DD'),
                  })
                );
              }}
            />
            <Button
              type="primary"
              className="btn"
              onClick={() => {
                setDrawerMode('add');
                form.resetFields();
                setDrawerOpen(true);
              }}
            >
              Add Charge
            </Button>
          </Space>
        </div>

        <div className="table-scroll-container">
          <Spin spinning={loading}>
            <Table
              rowKey="_id"
              columns={filteredColumns}
              dataSource={charges}
              scroll={{ x: 1000 }}
              loading={loading}
              onChange={handleTableChange}
              pagination={{
                current: page,
                pageSize: limit,
                total: total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
                showTotal: (total) => `Total ${total} items`,
              }}
            />
          </Spin>
        </div>

        <Drawer
          title={drawerMode === 'add' ? 'Add Charge' : 'Edit Charge'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Spin spinning={loading}>
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              onValuesChange={(changed, allValues) => {
                handleValuesChangeLogic(changed, allValues);
              }}
            >
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
                  optionLabelProp="children"
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
                name="chargeMaster"
                label="Charge Master"
                rules={[{ required: true, message: 'Charge master is required' }]}
              >
                <Select
                  showSearch
                  placeholder="Select Charge"
                  filterOption={false}
                  onSearch={(value) => debouncedChargeSearch(value)}
                  onChange={handleChargeSelect}
                  optionLabelProp="children"
                >
                  {chargeMasters &&
                    chargeMasters.map((doc) => (
                      <Option key={doc._id} value={doc._id}>
                        {doc.name} (₹ {doc.amount}) {/* show amount separately */}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="baseAmount"
                label="Base Amount"
                rules={[{ required: true, message: 'Base amount is required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} readOnly={true} />
              </Form.Item>

              <Form.Item name="discountType" label="Discount Type" initialValue="none">
                <Select onChange={handleDiscountTypeChange}>
                  <Select.Option value="none">None</Select.Option>
                  <Select.Option value="flat">Flat</Select.Option>
                  <Select.Option value="percentage">Percentage</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item shouldUpdate={(prev, cur) => prev.discountType !== cur.discountType}>
                {({ getFieldValue }) => (
                  <Form.Item
                    name="discountAmount"
                    label="Discount Amount"
                    dependencies={['discountType']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const type = getFieldValue('discountType');

                          if (type === 'none') return Promise.resolve();

                          if (!value || value < 0) {
                            return Promise.reject('Discount amount must be greater than 0');
                          }

                          if (type === 'percentage' && value > 100) {
                            return Promise.reject('Percentage discount cannot exceed 100%');
                          }

                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      disabled={getFieldValue('discountType') === 'none'} // ← ADD THIS
                    />
                  </Form.Item>
                )}
              </Form.Item>

              <Form.Item name="finalAmount" label="Final Amount">
                <InputNumber min={0} style={{ width: '100%' }} readOnly />
              </Form.Item>

              <Form.Item name="paidAmount" label="Paid Amount">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="balanceAmount" label="Balance Amount">
                <InputNumber style={{ width: '100%' }} readOnly />
              </Form.Item>

              <Form.Item
                name={['caseContext', 'caseType']}
                label="Case Type"
                rules={[{ required: true, message: 'Case type is required' }]}
              >
                <Select>
                  <Select.Option value="opd">OPD</Select.Option>
                  <Select.Option value="ipd">IPD</Select.Option>
                  <Select.Option value="emergency">Emergency</Select.Option>
                  <Select.Option value="appointment">Appointment</Select.Option>
                  <Select.Option value="lab">Lab</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name={['caseContext', 'caseStatus']}
                label="Case Status"
                rules={[{ required: true, message: 'Case status is required' }]}
              >
                <Select>
                  <Select.Option value="new">New</Select.Option>
                  <Select.Option value="old">Old</Select.Option>
                  <Select.Option value="followup">Followup</Select.Option>
                  <Select.Option value="emergency">Emergency</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="paymentStatus" label="Payment Status">
                <Select disabled>
                  <Select.Option value="unpaid">Unpaid</Select.Option>
                  <Select.Option value="partial">Partial</Select.Option>
                  <Select.Option value="paid">Paid</Select.Option>
                </Select>
              </Form.Item>

              <Space className="width-space">
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: '100%' }}
                  className="btn-full"
                >
                  {drawerMode === 'add' ? 'Create Charge' : 'Update Charge'}
                </Button>
                <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
              </Space>
            </Form>
          </Spin>
        </Drawer>
      </div>
    </>
  );
};

export default ChargeList;
