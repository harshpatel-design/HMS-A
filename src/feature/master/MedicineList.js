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
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
  FunnelPlotOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  fetchMedicines,
  deleteMedicine,
  createMedicine,
  updateMedicine,
  setSort,
  resetSort,
} from '../../slices/medicineSlice';

import Breadcrumbs from '../comman/Breadcrumbs';
import debounce from 'lodash/debounce';

const { Search } = Input;

const MedicineList = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedForms, setSelectedForms] = useState([]);
  const { medicines, loading, page, limit, total, sortBy, order } = useSelector(
    (state) => state.medicine
  );

  useEffect(() => {
    dispatch(
      fetchMedicines({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'DESC',
        form: selectedForms.join(','),
      })
    );
  }, [dispatch, selectedForms]);

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchMedicines({ page: 1, limit, search: value, sortBy, order }));
      }, 500),
    [dispatch, limit, sortBy, order]
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const handleTableChange = (pagination, filters, sorter) => {
    if (!sorter.order) {
      dispatch(resetSort());
      dispatch(
        fetchMedicines({
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText,
        })
      );
      return;
    }

    const field = sorter.field || sorter.columnKey;
    if (field === 'createdAt') return;
    const sortOrder = sorter.order === 'ascend' ? 'ASC' : 'DESC';

    dispatch(setSort({ sortBy: field, order: sortOrder }));

    dispatch(
      fetchMedicines({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        sortBy: field,
        order: sortOrder,
      })
    );
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Medicine?',
      content: `Are you sure you want to delete "${record.name}"?`,
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteMedicine(record._id)).unwrap();
          message.success('Medicine deleted');
          dispatch(fetchMedicines({ page, limit }));
        } catch (err) {
          message.error(err?.message || 'Delete failed');
        }
      },
    });
  };

  const defaultChecked = ['name', 'code', 'price', 'stock', 'isActive', 'notes', 'createdAt'];
  const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

  const allColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: 200,
      sortOrder: sortBy === 'name' ? (order === 'ASC' ? 'ascend' : 'descend') : null,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      sortOrder: sortBy === 'price' ? (order === 'ASC' ? 'ascend' : 'descend') : null,
      width: 120,
      render: (v) => `₹ ${v}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: true,
      width: 120,
      sortOrder: sortBy === 'stock' ? (order === 'ASC' ? 'ascend' : 'descend') : null,
    },

    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (v) => (v ? <Tag color="green" className="w-100">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      width: 120,
      render: (v) => v || '—',
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      sorter: false,
      sortOrder: 'descend',
      render: (v) => dayjs(v).format('DD-MM-YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (record) => (
        <Space className='action'>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setDrawerMode('edit');
              setEditingRecord(record);
              form.setFieldsValue(record);
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

  const filteredColumns = allColumns.filter(
    (col) => selectedColumns.includes(col.key) || col.key === 'actions'
  );

  const allFilter = ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drop', 'other'];

  const filterMedicine = (
    <div className="column-filter-menu">
      <div className="column-filter-grid">
        {allFilter.map((item) => (
          <Checkbox
            key={item}
            checked={selectedForms.includes(item)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedForms([...selectedForms, item]);
              } else {
                setSelectedForms(selectedForms.filter((f) => f !== item));
              }
            }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </Checkbox>
        ))}
      </div>
    </div>
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
              onChange={(e) =>
                e.target.checked
                  ? setSelectedColumns([...selectedColumns, col.key])
                  : setSelectedColumns(selectedColumns.filter((c) => c !== col.key))
              }
            >
              {col.title}
            </Checkbox>
          ))}
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Floor List"
        items={[{ label: 'Floor List', href: '/floor-master' }, { label: 'Floor List' }]}
      />

      <div className="serachbar-bread">
        <Space>
          <Search
            placeholder="Search medicine..."
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
            onClick={() => dispatch(fetchMedicines({ page: 1, limit }))}
          />
          <Dropdown popupRender={() => columnMenu}>
            <Button icon={<FilterOutlined />} />
          </Dropdown>

          <Dropdown popupRender={() => filterMedicine} >
            <Button icon={<FunnelPlotOutlined />} />
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
            Add Medicine
          </Button>
        </Space>
      </div>

      <div className="table-scroll-container">
        <Table
          columns={filteredColumns}
          dataSource={medicines}
          rowKey="_id"
          scroll={{ x: 1000 }}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
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
        title={drawerMode === 'add' ? 'Add Medicine' : 'Edit Medicine'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values) => {
            try {
              if (drawerMode === 'add') {
                await dispatch(createMedicine(values)).unwrap();
                message.success('Medicine created');
              } else {
                await dispatch(updateMedicine({ id: editingRecord._id, data: values })).unwrap();
                message.success('Medicine updated');
              }

              setDrawerOpen(false);
              dispatch(fetchMedicines({ page, limit }));
            } catch (err) {
              message.error(err?.message);
            }
          }}
        >
          <Form.Item
            name="name"
            label="Medicine Name"
            rules={[{ required: true, message: 'Please enter medicine name' }]}
          >
            <Input placeholder="Enter medicine name (e.g. Paracetamol)" />
          </Form.Item>

          <Form.Item name="genericName" label="Generic Name">
            <Input placeholder="Enter generic name" />
          </Form.Item>

          <Form.Item name="brandName" label="Brand Name">
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item name="strength" label="Strength">
            <Input placeholder="Enter strength (e.g. 500mg)" />
          </Form.Item>

          <Form.Item name="form" label="Form" initialValue="tablet">
            <Select placeholder="Select medicine form">
              <Select.Option value="tablet">Tablet</Select.Option>
              <Select.Option value="capsule">Capsule</Select.Option>
              <Select.Option value="syrup">Syrup</Select.Option>
              <Select.Option value="injection">Injection</Select.Option>
              <Select.Option value="ointment">Ointment</Select.Option>
              <Select.Option value="drop">Drop</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="unit" label="Unit" initialValue="Nos">
            <Input placeholder="Enter unit (e.g. Nos, Bottle, Strip)" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber placeholder="Enter price" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="stock" label="Stock" initialValue={0}>
            <InputNumber placeholder="Enter available stock" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Input placeholder="Enter category (e.g. Antibiotic)" />
          </Form.Item>

          <Form.Item name="manufacturer" label="Manufacturer">
            <Input placeholder="Enter manufacturer name" />
          </Form.Item>
          {drawerMode === 'edit' && (
            <Form.Item name="isActive" label="Status">
              <Select placeholder="Select status">
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={3} placeholder="Enter additional remarks" />
          </Form.Item>

          <Space className="width-space">
            <Button type="primary" htmlType="submit" className="btn-full">
              {drawerMode === 'add' ? 'Create' : 'Update'}
            </Button>
            <Button onClick={() => setDrawerOpen(false)} style={{ display: 'block' }}>
              Cancel
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default MedicineList;
