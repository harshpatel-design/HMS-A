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
  Form,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import {
  fetchBeds,
  deleteBed,
  createBed,
  updateBed,
  setSort,
  fetchBedById,
  resetSort,
} from "../../slices/badSlice.js";
import { fetchFloors } from "../../slices/floorSlice";
import { fetchRooms } from "../../slices/roomSlice.js";
import { fetchWards } from "../../slices/wardSlice.js";

import Breadcrumbs from "../comman/Breadcrumbs";
import debounce from "lodash/debounce";
import "../../index.css";

const { Search } = Input;

const BedMaster = () => {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const dispatch = useDispatch();
  const { beds, loading, page, limit, total, orderBy, order } = useSelector(
    (state) => state.bed
  );

  const { floors, loading: floorLoading } = useSelector((state) => state.floor);
  const { rooms, loading: roomLoading } = useSelector((state) => state.room);
  const { wards, loading: wardLoading } = useSelector((state) => state.ward);
  const { selectedBed } = useSelector((state) => state.bed);

  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    dispatch(fetchBeds({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (drawerOpen && floors.length === 0) {
      dispatch(fetchFloors({ page: 1, limit: 100 }));
      dispatch(fetchRooms({ page: 1, limit: 100 }));
      dispatch(fetchWards({ page: 1, limit: 100 }));
    }
  }, [drawerOpen, floors.length, rooms.length, wards.length, dispatch]);

  useEffect(() => {
    if (drawerMode === "edit" && selectedBed) {
      form.setFieldsValue({
        bedNumber: selectedBed.bedNumber,
        bedType: selectedBed.bedType,
        floor: selectedBed.floor?._id || selectedBed.floor,
        room: selectedBed.room?._id || null,
        ward: selectedBed.ward?._id || null,
        notes: selectedBed.notes,
        isOccupied: selectedBed.isOccupied,
        isActive: selectedBed.isActive,
      });

      setSelectedRoom(selectedBed.room?._id || null);
      setSelectedWard(selectedBed.ward?._id || null);
    }
  }, [selectedBed, drawerMode]);

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(
          fetchBeds({
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
    if (selectedRoom) {
      form.setFieldsValue({ bedLocationType: "ROOM" });
    } else if (selectedWard) {
      form.setFieldsValue({ bedLocationType: "WARD" });
    }
  }, [selectedRoom, selectedWard, form]);

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);
  const handleTableChange = (pagination, filters, sorter) => {
    if (!sorter.order) {
      dispatch(resetSort());
      dispatch(
        fetchBeds({
          page: pagination.current,
          limit: pagination.pageSize,
          orderBy: "createdAt",
          order: "DESC",
        })
      );
      return;
    }

    const sortOrder = sorter.order === "ascend" ? "ASC" : "DESC";

    dispatch(setSort({ orderBy: sorter.field, order: sortOrder }));

    dispatch(
      fetchBeds({
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
    dispatch(fetchBeds({ page: 1, limit: 10 }));
  };
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Bed?",
      content: `Delete bed "${record.bedNumber}"?`,
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(deleteBed(record._id)).unwrap();
          message.success("Bed deleted");
          dispatch(fetchBeds({ page, limit }));
        } catch (err) {
          message.error(err?.message || "Delete failed");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setDrawerMode("edit");
    setEditingRecord(record);
    setDrawerOpen(true);
    setSelectedRoom(null);
    setSelectedWard(null);
    dispatch(fetchBedById(record._id));
  };

  const defaultChecked = [
    "bedNumber",
    "bedType",
    "floor",
    "room",
    "isOccupied",
    "isActive",
    "ward",
  ];
  const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

  const allColumns = [
    {
      title: "Bed No",
      dataIndex: "bedNumber",
      key: "bedNumber",
      sorter: true,
    },
    {
      title: "Type",
      dataIndex: "bedType",
      key: "bedType",
      sorter: true,
    },
    {
      title: "Floor",
      dataIndex: ["floor", "name"],
      key: "floor",
      render: (v) => v || "—",
    },
    {
      title: "Room",
      dataIndex: ["room", "roomNumber"],
      key: "room",
      render: (v) => v || "—",
    },
    {
      title: "Ward",
      dataIndex: ["ward", "name"],
      key: "ward",
      render: (v) => v || "—",
    },
    {
      title: "Occupied",
      dataIndex: "isOccupied",
      key: "isOccupied",
      sorter: true,
      render: (v) =>
        v ? <Tag color="red">Occupied</Tag> : <Tag color="green">Vacant</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      sorter: true,
      render: (v) =>
        v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
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
      render: (v) => new Date(v).toLocaleString(),
    },
    {
      title: "Created By",
      dataIndex: ["createdBy", "name"],
      render: (v) => v || "—",
    },
    {
      title: "Updated By",
      dataIndex: ["updatedBy", "name"],
      key: "updatedBy" || "-",
      render: (v) => v || "—",
    },
    {
      title: "Updated At",
      dataIndex: ["updatedAt"],
      key: "updatedAt",
      render: (v) => v || "—",
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

  const BED_TYPES = [
    "GENERAL",
    "ICU",
    "VENTILATOR",
    "PRIVATE",
    "DELUXE",
    "PEDIATRIC",
  ];

  const onFinish = async (values) => {
  try {
    const payload = {
      bedNumber: values.bedNumber,
      bedType: values.bedType.toUpperCase(),
      floor: values.floor,
      notes: values.notes,
      isOccupied: values.isOccupied,
      isActive: values.isActive,
    };

    if (values.room) {
      payload.bedLocationType = "ROOM";
      payload.room = values.room;
    }

    if (values.ward) {
      payload.bedLocationType = "WARD";
      payload.ward = values.ward;
    }

    let res;

    if (drawerMode === "add") {
      res = await dispatch(createBed(payload)).unwrap();
      message.success(res?.message || "Bed created successfully");
    } else {
      res = await dispatch(
        updateBed({ id: editingRecord._id, payload })
      ).unwrap();
      message.success(res?.message || "Bed updated successfully");
    }

    form.resetFields();
    setDrawerOpen(false);
    setEditingRecord(null);
    setDrawerMode("add");
    dispatch(fetchBeds({ page, limit }));

  } catch (err) {
    console.error("API Error:", err);

    const errorMsg =
      err?.payload?.message ||
      err?.message ||
      "Something went wrong";

    message.error(errorMsg);
  }
};

  return (
    <>
      <Breadcrumbs title="Bed List" />

      <div className="serachbar-bread">
        <Space>
          <Search
            placeholder="Search bed number"
            allowClear
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              debouncedFetch(e.target.value);
            }}
            style={{ width: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset} />
          <Dropdown dropdownRender={() => columnMenu}>
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
            Add Bed
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={filteredColumns}
        dataSource={beds}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
      <Drawer
        title={drawerMode === "add" ? "Add Bed" : "Edit Bed"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="bedNumber"
            label="Bed Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="bedType"
            label="Bed Type"
            rules={[{ required: true, message: "Please select bed type" }]}
          >
            <Select placeholder="Select Bed Type" allowClear>
              {BED_TYPES.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="floor" label="Floor" rules={[{ required: true }]}>
            <Select placeholder="Select Floor" loading={floorLoading}>
              {floors.map((f) => (
                <Select.Option key={f._id} value={f._id}>
                  {f.name} (Floor {f.floorNumber})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="room"
            label="Room"
            rules={[
              {
                required: !selectedWard,
                message: "Please select room or ward",
              },
            ]}
          >
            <Select
              placeholder="Select Room"
              loading={roomLoading}
              disabled={!!selectedWard} // 🔒 disable if ward selected
              allowClear
              onChange={(value) => {
                setSelectedRoom(value);

                if (value) {
                  setSelectedWard(null); // clear ward state
                  form.setFieldsValue({ ward: null }); // clear ward field
                }
              }}
              onClear={() => setSelectedRoom(null)}
            >
              {rooms.map((r) => (
                <Select.Option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.roomType})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ward"
            label="Ward"
            rules={[
              {
                required: !selectedRoom,
                message: "Please select ward or room",
              },
            ]}
          >
            <Select
              placeholder="Select Ward"
              loading={wardLoading}
              disabled={!!selectedRoom}
              allowClear
              onChange={(value) => {
                setSelectedWard(value);

                if (value) {
                  setSelectedRoom(null);
                  form.setFieldsValue({ room: null });
                }
              }}
              onClear={() => setSelectedWard(null)}
            >
              {wards.map((w) => (
                <Select.Option key={w._id} value={w._id}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {drawerMode === "edit" && (
            <Form.Item
              name="isOccupied"
              label="Occupied"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={true}>Occupied</Select.Option>
                <Select.Option value={false}>Vacant</Select.Option>
              </Select>
            </Form.Item>
          )}

          {drawerMode === "edit" && (
            <Form.Item
              name="isActive"
              label="Active Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea />
          </Form.Item>

          <Button type="primary" htmlType="submit" className="btn">
            {drawerMode === "add" ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </>
  );
};

export default BedMaster;
