import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Tooltip,
  Modal,
  message,
  Checkbox,
  Select,
  Drawer,
  Dropdown,
  Form
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined
} from "@ant-design/icons";
import {
  deleteFloor,
  fetchFloors,
  setSort,
  resetSort,
  createFloor,
  updateFloor
} from "../../slices/floorSlice";
import "../../index.css";
import Breadcrumbs from "../comman/Breadcrumbs";
import debounce from "lodash/debounce";
import "../../index.css"

const { Search } = Input

const FloorList = () => {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingRecord, setEditingRecord] = useState(null);

  const dispatch = useDispatch();
  const {
    floors,
    loading,
    page,
    limit,
    total,
    orderBy,
    order,
  } = useSelector((state) => state.floor);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchFloors({ page: 1, limit: 10 }));
  }, [dispatch]);

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(
          fetchFloors({
            page: 1,
            limit,
            search: value,
            orderBy,
            order,
          })
        );
      }, 500),
    [dispatch, limit, orderBy, order]
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const defaultChecked = [
    "name",
    "code",
    "floorNumber",
    "isActive",
    "notes",
  ];
  const [selectedColumns, setSelectedColumns] = useState(defaultChecked || []);

  const loadData = (pageNum = 1, pageSize = limit, search = searchText, order, orderBy) => {
    if (loading) return;

    dispatch(
      fetchFloors({
        page: pageNum,
        limit: pageSize,
        search,
        orderBy,
        order

      })
    );
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (!sorter.order) {
      dispatch(resetSort());
      dispatch(
        fetchFloors({
          page: pagination.current,
          limit: pagination.pageSize,
          orderBy: "createdAt",
          order: "DESC",
        })
      );
      return;
    }
    const sortOrder = sorter.order === "ascend" ? "ASC" : "DESC";

    dispatch(
      setSort({
        orderBy: sorter.field,
        order: sortOrder,
      })
    );

    dispatch(
      fetchFloors({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        orderBy: sorter.field,
        order: sortOrder,
      })
    );
  };

  const handleReset = () => {
    setSearchText("");
    dispatch(fetchFloors({ page: 1, limit: 10 }));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Floor?",
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await dispatch(deleteFloor(record._id)).unwrap();

          message.success("Floor deleted successfully");
          dispatch(fetchFloors({ page, limit }));
        } catch (err) {
          message.error(err?.message || "Failed to delete floor");
        }
      },
    });
  };

  const allColumns = [
    {
      title: "Floor Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        orderBy === "name"
          ? order === "ASC"
            ? "ascend"
            : "descend"
          : null,
      render: (text) => (
        <Tooltip title={text}>
          <strong>{text}</strong>
        </Tooltip>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: true,
      sortOrder:
        orderBy === "code"
          ? order === "ASC"
            ? "ascend"
            : "descend"
          : null,
    },
    {
      title: "Floor No",
      dataIndex: "floorNumber",
      key: "floorNumber",
      sorter: true,
      sortOrder:
        orderBy === "floorNumber"
          ? order === "ASC"
            ? "ascend"
            : "descend"
          : null,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      sorter: true,
      render: (v) =>
        v === true ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (v) => v || "—",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (value) =>
        value ? new Date(value).toLocaleString() : "—",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (user) =>
        user ? (
          <Tooltip title={user.email}>
            {user.name}
          </Tooltip>
        ) : "—",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      render: (value) =>
        value ? new Date(value).toLocaleString() : "—",
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
      render: (user) =>
        user ? (
          <Tooltip title={user.email}>
            {user.name}
          </Tooltip>
        ) : "—",
    },
    {
      title: "Actions",
      key: "actions",
      width:100,
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setDrawerMode("edit");
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
    (col) =>
      selectedColumns.includes(col.key) || col.key === "actions"
  );


  const columnMenu = (
    <div className="column-filter-menu">
      <div className="column-filter-grid">
        {allColumns
          .filter((c) => c.key !== "actions")
          .map((col) => (
            <div key={col.key} className="column-filter-item">
              <Checkbox
                checked={selectedColumns.includes(col.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns([...selectedColumns, col.key]);
                  } else {
                    setSelectedColumns(
                      selectedColumns.filter((c) => c !== col.key)
                    );
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
        onClick={() => setSelectedColumns(defaultChecked)}
      >
        Reset to default
      </Button>
    </div>
  );


  return (
    <>
      <div className="page-wrapper">
        <Breadcrumbs
          title="Floor List"
          showBack
          backTo="/dashboard"
          items={[{ label: 'Floor List', href: '/floor-master' }, { label: 'Floor List' }]}
        />

        <div className="serachbar-bread">
          <Space>
            <Search
              placeholder="Search floor name or code"
              allowClear
              value={searchText}
              onChange={(e) => {
                const value = e.target.value;
                setSearchText(value);
                debouncedFetch(value);
              }}
              onSearch={(value) => {
                setSearchText(value);
                loadData(1, limit);
              }}
              style={{ width: '100%', maxWidth: 260 }}
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
                setEditingRecord(null);
                form.resetFields();
                setDrawerOpen(true);
              }}
            >
              Add Floor
            </Button>
          </Space>
        </div>

        <div className="table-scroll-container">
          <Table
            columns={filteredColumns}
            scroll={{ x: 1000}}
            dataSource={floors}
            loading={loading}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize: limit,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              onChange: handleTableChange,
              showTotal: (totalRecord) => `Total ${totalRecord} items`,
              showQuickJumper: limit > 100 && limit < 500,
              locale: {
                items_per_page: 'Items / Page',
              },
            }}
          />

          <Drawer
            title={drawerMode === 'add' ? 'Add Floor' : 'Edit Floor'}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            destroyOnClose
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={async (values) => {
                try {
                  if (drawerMode === 'add') {
                    await dispatch(createFloor(values)).unwrap();
                    message.success('Floor created successfully');
                  } else {
                    await dispatch(updateFloor({ id: editingRecord._id, data: values })).unwrap();
                    message.success('Floor updated successfully');
                  }

                  setDrawerOpen(false);
                  dispatch(fetchFloors({ page, limit }));
                } catch (err) {
                  message.error(err?.message || 'Something went wrong');
                }
              }}
            >
              <Form.Item name="name" label="Floor Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="code" label="Floor Code" rules={[{ required: true }]}>
                <Input disabled={drawerMode === 'edit'} />
              </Form.Item>

              <Form.Item name="floorNumber" label="Floor Number" rules={[{ required: true }]}>
                <Input type="number" />
              </Form.Item>

              {drawerMode === 'edit' && (
                <Form.Item
                  name="isActive"
                  label="Active Status"
                  rules={[{ required: true, message: 'Please select active status' }]}
                >
                  <Select placeholder="Select Active Status">
                    <Select.Option value={true}>Active</Select.Option>
                    <Select.Option value={false}>Inactive</Select.Option>
                  </Select>
                </Form.Item>
              )}
              <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Space className="width-space">
                <Button type="primary" htmlType="submit" className="btn-full">
                  {drawerMode === 'add' ? 'Create' : 'Update'}
                </Button>
                <Button onClick={() => setDrawerOpen(false)} style={{display:"block"}}>Cancel</Button>
              </Space>
            </Form>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default FloorList;
