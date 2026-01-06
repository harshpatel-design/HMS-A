import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Checkbox,
  Select,
  Drawer,
  Dropdown,
  Form,
  InputNumber,
  Switch,
} from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';

import {
  fetchChargeMasters,
  fetchChargeMasterById,
  createChargeMaster,
  updateChargeMaster,
  deleteChargeMaster,
  resetChargeMasterState,
} from '../../slices/chargeMasterSlice';
import { fetchLabTests } from '../../slices/labTestSlice';
import { fetchDoctors } from '../../slices/doctorSlice';
import { fetchDepartments } from '../../slices/departmentSlice';

import Breadcrumbs from '../comman/Breadcrumbs';
import debounce from 'lodash/debounce';
import '../../index.css';
import { useParams } from 'react-router-dom';

const { Search } = Input;

const CHARGE_TYPES = ['OPD', 'IPD', 'EMERGENCY', 'APPOINTMENT', 'LAB', 'PROCEDURE', 'SERVICE'];

export const CHARGE_STATUS_OPTIONS = [
  { label: 'Old', value: 'old' },
  { label: 'New', value: 'new' },
  { label: 'Follow Up', value: 'followup' },
  { label: 'Emergency', value: 'emergency' },
];

const GST_RATES = [0, 5, 12, 18];
const GST_TYPES = ['CGST_SGST', 'IGST'];

const ChargeMaster = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { chargeMasters, loading, page, limit, total, selectedChargeMaster } = useSelector(
    (state) => state.chargeMaster
  );
  const { labTests } = useSelector((state) => state.labTest);
  const { doctors } = useSelector((state) => state.doctor);
  const { departments } = useSelector((state) => state.department);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchChargeMasters({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchLabTests({ page: 1, pazeSize: 400 }));
      dispatch(fetchDoctors({ page: 1, limit: 500 }));
      dispatch(fetchDepartments());
    }
  }, [drawerOpen, dispatch]);

  useEffect(() => {
    if (drawerMode === 'edit' && selectedChargeMaster) {
      form.setFieldsValue({
        ...selectedChargeMaster,
        gstApplicable: !!selectedChargeMaster.gstApplicable,
        taxInclusive: !!selectedChargeMaster.taxInclusive,
        isActive: selectedChargeMaster.isActive ?? true,
        caseStatus: selectedChargeMaster.caseStatus || "",
      });
    }
  }, [drawerMode, selectedChargeMaster, form]);

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchChargeMasters({ page: 1, limit, search: value }));
      }, 500),
    [dispatch, limit]
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const handleReset = () => {
    setSearchText('');
    dispatch(fetchChargeMasters({ page: 1, limit: 20 }));
  };

  const handleEdit = (record) => {
    setDrawerMode('edit');
    setEditingRecord(record);
    setDrawerOpen(true);
    dispatch(fetchChargeMasterById(record._id));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Charge?',
      content: `Delete "${record.name}"?`,
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteChargeMaster(record._id)).unwrap();
          message.success('Charge deleted');
          dispatch(fetchChargeMasters({ page, limit }));
        } catch (err) {
          message.error(err?.message || 'Delete failed');
        }
      },
    });
  };

  const defaultChecked = [
    'name',
    'code',
    'caseType',
    'amount',
    'gstRate',
    'taxInclusive',
    'isActive',
  ];

  const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

  const allColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Code', dataIndex: 'code', key: 'code', sorter: true },
    {
      title: 'Type',
      dataIndex: 'caseType',
      key: 'caseType',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v) => `₹${v}`,
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsnCode',
      key: 'hsnCode',
      render: (v) => v,
    },
    {
      title: 'GST %',
      dataIndex: 'gstRate',
      key: 'gstRate',
      render: (v) => `${v}%`,
    },
    {
      title: 'Tax Inclusive',
      dataIndex: 'taxInclusive',
      key: 'taxInclusive',
      width: 60,
      render: (v) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        return date ? new Date(date).toLocaleDateString('en-GB') : '-';
      },
    },
    {
      title: 'updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => {
        return date ? new Date(date).toLocaleDateString('en-GB') : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => {
        return (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Space>
        );
      },
    },
  ];

  const filteredColumns = allColumns.filter(
    (c) => selectedColumns.includes(c.key) || c.key === 'actions'
  );

  const onFinish = async (values) => {
    try {
      let res;
      if (drawerMode === 'add') {
        res = await dispatch(createChargeMaster(values)).unwrap();
        message.success(res?.message || 'Charge created');
      } else {
        res = await dispatch(
          updateChargeMaster({ id: editingRecord._id, payload: values })
        ).unwrap();
        message.success(res?.message || 'Charge updated');
      }
      form.resetFields();
      setDrawerOpen(false);
      setDrawerMode('add');
      dispatch(fetchChargeMasters({ page, limit }));
      dispatch(resetChargeMasterState());
    } catch (err) {
      message.error(err?.message || 'Something went wrong');
    }
  };

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

  const handleTableChange = (pagination, filters, sorter) => {
    let ordering = '-createdAt';

    if (sorter?.order === 'ascend') {
      ordering = sorter.field;
    } else if (sorter?.order === 'descend') {
      ordering = `-${sorter.field}`;
    }

    dispatch(
      fetchChargeMasters({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        ordering,
      })
    );
  };

  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title={isEdit ? 'Edit Charge' : 'Charge List'}
          showBack={true}
          items={[{ label: 'Charge', href: '/charge-master' }, { label: 'Charge List' }]}
        />
        <div className="serachbar-bread">
          <Space>
            <Search
              placeholder="Search charge"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                debouncedFetch(e.target.value);
              }}
              style={{ maxWidth: 200, width: '100%' }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleReset} />
            <Dropdown dropdownRender={() => columnMenu} trigger={['click']}>
              <Button icon={<FilterOutlined />} />
            </Dropdown>
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
          <Table
            rowKey="_id"
            columns={filteredColumns}
            scroll={{ x: 1200 }}
            dataSource={chargeMasters}
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              showTotal: (totalRecord) => `Total ${totalRecord} items`,
              showQuickJumper: limit > 100 && limit < 500,
              locale: {
                items_per_page: 'Items / Page',
              },
            }}
          />
        </div>
        <Drawer
          title={drawerMode === 'add' ? 'Add Charge' : 'Edit Charge'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={420}
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              name="code"
              label="Code"
              rules={[
                { required: true },
                { pattern: /^[A-Z0-9_]+$/, message: 'Only uppercase letters & numbers' },
              ]}
            >
              <Input
                onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })}
              />
            </Form.Item>

            <Form.Item name="doctor" label="Doctor">
              <Select allowClear placeholder="Select Doctor">
                {doctors.map((d) => (
                  <Select.Option key={d.doctorid} value={d.doctorid}>
                    {d?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="department" label="Department">
              <Select allowClear placeholder="Select Department">
                {departments.map((d) => (
                  <Select.Option key={d._id} value={d._id}>
                    {d.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="labTest" label="Lab Test">
              <Select allowClear placeholder="Select Lab Test">
                {labTests.map((t) => (
                  <Select.Option key={t._id} value={t._id}>
                    {t.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="caseType" label="Charge Type" rules={[{ required: true }]}>
              <Select
                placeholder="Select charge status">
                {CHARGE_TYPES.map((c) => (
                  <Select.Option key={c} value={c}>
                    {c}
                  </Select.Option>
                ))}
              </Select>

            </Form.Item>
            <Form.Item
              name="caseStatus"
              label="Case Status"
              rules={[{ required: true, message: 'Charge status is required' }]}
            >
              <Select
                placeholder="Select charge status"
                options={CHARGE_STATUS_OPTIONS}
                allowClear
              />
            </Form.Item>

            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="gstApplicable" label="GST Applicable" valuePropName="checked">
              <Switch
                onChange={(checked) => {
                  if (!checked) {
                    form.setFieldsValue({
                      gstRate: 0,
                      gstType: 'CGST_SGST',
                      hsnCode: undefined,
                    });
                  }
                }}
              />
            </Form.Item>

            <Form.Item shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue('gstApplicable') && (
                  <>
                    <Form.Item name="gstRate" label="GST Rate" rules={[{ required: true }]}>
                      <Select>
                        {GST_RATES.map((r) => (
                          <Select.Option key={r} value={r}>
                            {r}%
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="gstType" label="GST Type">
                      <Select>
                        {GST_TYPES.map((t) => (
                          <Select.Option key={t} value={t}>
                            {t}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="hsnCode" label="HSN / SAC">
                      <Input />
                    </Form.Item>
                  </>
                )
              }
            </Form.Item>

            <Form.Item name="taxInclusive" label="Tax Inclusive" valuePropName="checked">
              <Switch />
            </Form.Item>

            {drawerMode === 'edit' && (
              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch />
              </Form.Item>
            )}

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

export default ChargeMaster;
