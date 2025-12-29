import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import {
  fetchLabTests,
  fetchLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  resetLabTestState,
} from "../../slices/labTestSlice";

import Breadcrumbs from "../comman/Breadcrumbs";
import debounce from "lodash/debounce";
import "../../index.css";

const { Search } = Input;

const CATEGORIES = [
  "PATHOLOGY",
  "RADIOLOGY",
  "MICROBIOLOGY",
  "BIOCHEMISTRY",
  "HEMATOLOGY",
  "IMMUNOLOGY",
];

const LabTest = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { labTests, loading, page, limit, total } = useSelector(
    (state) => state.labTest
  );

  const { selectedLabTest } = useSelector((state) => state.labTest);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchLabTests({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (drawerMode === "edit" && selectedLabTest) {
      form.setFieldsValue({
        name: selectedLabTest.name,
        code: selectedLabTest.code,
        category: selectedLabTest.category,
        unit: selectedLabTest.unit,
        normalRange: selectedLabTest.normalRange,
        sampleType: selectedLabTest.sampleType,
        turnaroundTime: selectedLabTest.turnaroundTime,
        isActive: selectedLabTest.isActive,
      });
    }
  }, [drawerMode, selectedLabTest, form]);
  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(
          fetchLabTests({
            page: 1,
            limit,
            search: value,
          })
        );
      }, 500),
    [dispatch, limit]
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const handleReset = () => {
    setSearchText("");
    dispatch(fetchLabTests({ page: 1, limit: 10 }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (!sorter.order) {
      dispatch(fetchLabTests({ page: pagination.current, limit }));
      return;
    }
    const ordering =
      sorter.order === "ascend" ? sorter.field : `-${sorter.field}`;

    dispatch(
      fetchLabTests({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        ordering,
      })
    );
  };

  const handleEdit = (record) => {
    setDrawerMode("edit");
    setEditingRecord(record);
    setDrawerOpen(true);
    dispatch(fetchLabTestById(record._id));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Lab Test?",
      content: `Delete "${record.name}"?`,
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(deleteLabTest(record._id)).unwrap();
          message.success("Lab test deleted");
          dispatch(fetchLabTests({ page, limit }));
        } catch (err) {
          message.error(err?.message || "Delete failed");
        }
      },
    });
  };

  const defaultChecked = [
    "name",
    "code",
    "category",
    "unit",
    "normalRange",
    "sampleType",
    "turnaroundTime",
    "isActive",
  ];

  const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

  const allColumns = [
    { title: "Name", dataIndex: "name", key: "name", sorter: true },
    { title: "Code", dataIndex: "code", key: "code", sorter: true },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    { title: "Unit", dataIndex: "unit", key: "unit", render: (v) => v || "—" },
    {
      title: "Normal Range",
      dataIndex: "normalRange",
      key: "normalRange",
      render: (v) => v || "—",
    },
    {
      title: "Sample",
      dataIndex: "sampleType",
      key: "sampleType",
    },
    {
      title: "TAT (hrs)",
      dataIndex: "turnaroundTime",
      key: "turnaroundTime",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => new Date(v).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
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
    (c) => selectedColumns.includes(c.key) || c.key === "actions"
  );

  const onFinish = async (values) => {
    try {
      let res;
      if (drawerMode === "add") {
        res = await dispatch(createLabTest(values)).unwrap();
        message.success(res?.message || "Lab test created");
      } else {
        res = await dispatch(
          updateLabTest({ id: editingRecord._id, payload: values })
        ).unwrap();
        message.success(res?.message || "Lab test updated");
      }

      form.resetFields();
      setDrawerOpen(false);
      setDrawerMode("add");
      dispatch(fetchLabTests({ page, limit }));
      dispatch(resetLabTestState());
    } catch (err) {
      message.error(err?.message || "Something went wrong");
    }
  };

  const handlePageChange = (pageNumber, pageSize) => {
    dispatch(
      fetchLabTests({
        page: pageNumber,
        limit: pageSize,
        search: searchText,
      })
    );
  };

  const handlePageSizeChange = (current, size) => {
    dispatch(
      fetchLabTests({
        page: 1,
        limit: size,
        search: searchText,
      })
    );
  };
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
      <Breadcrumbs title="Lab Tests" />

      <div className="serachbar-bread">
        <Space>
          <Search
            placeholder="Search lab test"
            allowClear
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              debouncedFetch(e.target.value);
            }}
            style={{ width: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset} />
          <Dropdown dropdownRender={() => columnMenu} trigger={["click"]}>
            <Button icon={<FilterOutlined />} />
          </Dropdown>

          <Button
            type="primary"
            className="btn"
            onClick={() => {
              setDrawerMode("add");
              form.resetFields();
              setDrawerOpen(true);
            }}
          >
            Add Lab Test
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={filteredColumns}
        dataSource={labTests}
        loading={loading}
        onChange={handleTableChange} // ✅ sorting handler
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100", "500", "1000"],
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange,
          showTotal: (total) => `Total ${total} items`,
          showQuickJumper: limit > 100 && limit < 500,
          locale: {
            items_per_page: "Items / Page",
          },
        }}
      />

      <Drawer
        title={drawerMode === "add" ? "Add Lab Test" : "Edit Lab Test"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select>
              {CATEGORIES.map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="unit" label="Unit">
            <Input />
          </Form.Item>

          <Form.Item name="normalRange" label="Normal Range">
            <Input />
          </Form.Item>

          <Form.Item name="sampleType" label="Sample Type">
            <Input />
          </Form.Item>

          <Form.Item name="turnaroundTime" label="TAT (Hours)">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {drawerMode === "edit" && (
            <Form.Item name="isActive" label="Status">
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit">
            {drawerMode === "add" ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </>
  );
};

export default LabTest;
