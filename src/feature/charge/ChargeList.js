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
  Tooltip,
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
  const baseAmount = Form.useWatch('baseAmount', form);

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

      // ✅ Fetch patient ledger (this is correct)
      const res = await dispatch(fetchChargeById(record.patient._id)).unwrap();

      if (!res?.charges?.length) {
        message.error('No charge data found');
        return;
      }

      // ✅ FIND the exact charge document user clicked
      const charge = res.charges.find((c) => c._id === record._id);

      if (!charge) {
        message.error('Selected charge not found');
        return;
      }

      form.setFieldsValue({
        patient: charge.patient._id,
        charges: charge.charges.map((c) => c.chargeMaster._id),
        baseAmount: charge.baseAmount,
        discountAmount: charge.discountAmount,
        discountType: charge.discountType,
        finalAmount: charge.finalAmount,
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

  const defaultChecked = ['name', 'amount', 'famount', 'damount', 'patient', 'createdAt'];

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
      title: 'Charge Names',
      key: 'name',
      maxWidth: 250,
      render: (_, record) => {
        return (
          <Tooltip
            title={record.charges?.map((c) => (
              <div key={c._id}>{c.name}</div>
            ))}
            placement="topLeft"
          >
            <div
              style={{
                maxWidth: 250,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
              }}
            >
              {record.charges?.map((c, index) => (
                <span key={c._id || index}>
                  {c.name}
                  {index < record.charges.length - 1 ? ', ' : ''}
                </span>
              )) || '—'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'baseAmount',
      key: 'amount',
      width: 110,
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
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
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
        charges: values.charges.map((id) => ({
          chargeMaster: id,
        })),
        discountAmount: values.discountAmount || 0,
        discountType: values.discountType || 'none',
        baseAmount: baseAmount || 0,
        paidAmount: values.paidAmount || 0,
        caseContext: {
          caseType: values.caseContext?.caseType,
          caseStatus: values.caseContext?.caseStatus,
        },
      };
      
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
      console.error('error in charge drawer submit:', err);
      message.error(err || 'Operation failed');
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

      let orderBy = 'createdAt';
      let order = 'DESC';

      if (sorter && sorter.order && sorter.columnKey) {
        orderBy = sorter.columnKey;
        order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      }
      dispatch(
        fetchCharges({
          page: pageNumber,
          limit: pageSize,
          search: searchText,
          orderBy,
          order,
        })
      );
    },
    [dispatch, searchText]
  );
  const handleChargeSelect = (ids) => {
    const selectedCharges = chargeMasters.filter((c) => ids.includes(c._id));

    const baseAmount = selectedCharges.reduce((sum, c) => sum + (c.amount || 0), 0);

    const discountAmount = form.getFieldValue('discountAmount') || 0;
    const discountType = form.getFieldValue('discountType') || 'none';

    let finalAmount = baseAmount;

    if (discountType === 'flat') {
      finalAmount -= discountAmount;
    } else if (discountType === 'percentage') {
      finalAmount -= (baseAmount * discountAmount) / 100;
    }

    form.setFieldsValue({
      baseAmount,
      finalAmount: Math.max(finalAmount, 0),
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
          <Space style={{ flexWrap: 'wrap' }}>
            <Search
              placeholder="Search charges"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                debouncedFetch(e.target.value);
              }}
              style={{ maxWidth: 220, width: '100%' }}
            />

            <Button icon={<ReloadOutlined />} onClick={handleReset} />

            <Dropdown
              popupRender={() => (
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
                name="charges"
                label="Charge Master"
                rules={[{ required: true, message: 'Charge master is required' }]}
              >
                <Select
                  showSearch
                  placeholder="Select Charge"
                  filterOption={false}
                  mode="multiple"
                  onSearch={(value) => debouncedChargeSearch(value)}
                  onChange={handleChargeSelect}
                  optionLabelProp="children"
                >
                  {chargeMasters &&
                    chargeMasters.map((doc) => (
                      <Option key={doc._id} value={doc._id}>
                        {doc.name} (₹ {doc.amount})
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
