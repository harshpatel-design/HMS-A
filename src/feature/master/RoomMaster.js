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
    Drawer,
    Select,
    Form,
    Spin,
} from "antd";
import dayjs from "dayjs";
import {
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    FilterOutlined,
} from "@ant-design/icons";

import {
    fetchRooms,
    deleteRoom,
    createRoom,
    updateRoom,
    setSort,
    resetSort,
} from "../../slices/roomSlice";
import { fetchFloors } from "../../slices/floorSlice";
import Breadcrumbs from "../comman/Breadcrumbs";
import debounce from "lodash/debounce";
import "../../index.css";

const { Search } = Input;

const ROOM_TYPES = [
    "GENERAL",
    "PRIVATE",
    "DELUXE",
    "SUITE",
    "ICU",
    "NICU",
    "PICU",
    "ISOLATION",
    "OPERATION_THEATRE",
    "RECOVERY",
    "EMERGENCY",
];

const RoomMaster = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const {
        rooms,
        loading,
        page,
        limit,
        total,
        orderBy,
        order,
    } = useSelector((state) => state.room);

    const { floors, loading: floorLoading } = useSelector(
        (state) => state.floor
    );

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("add"); // add | edit
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        dispatch(fetchRooms({ page: 1, limit: 10 }));
    }, [dispatch]);

    useEffect(() => {
        if (drawerOpen && floors.length === 0) {
            dispatch(fetchFloors({ page: 1, limit: 100 }));
        }
    }, [drawerOpen, floors.length, dispatch]);

    useEffect(() => {
        if (editingRecord) {
            form.setFieldsValue({
                ...editingRecord,
                floor: editingRecord.floor?._id || editingRecord.floor,
            });
        }
    }, [editingRecord, form]);

    const debouncedFetch = useMemo(
        () =>
            debounce((value) => {
                dispatch(
                    fetchRooms({
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

    useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

    const handleReset = () => {
        setSearchText("");
        dispatch(fetchRooms({ page: 1, limit: 10 }));
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (!sorter.order) {
            dispatch(resetSort());
            dispatch(
                fetchRooms({
                    page: pagination.current,
                    limit: pagination.pageSize,
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
            fetchRooms({
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                orderBy: sorter.field,
                order: sortOrder,
            })
        );
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: "Delete Room?",
            content: `Are you sure you want to delete "${record.roomNumber}"?`,
            okType: "danger",
            onOk: async () => {
                try {
                    await dispatch(deleteRoom(record._id)).unwrap();
                    message.success("Room deleted successfully");
                    dispatch(fetchRooms({ page, limit }));
                } catch (err) {
                    message.error(err?.message || "Delete failed");
                }
            },
        });
    };

    const columns = [
        {
            title: "Floor",
            dataIndex: "floor",
            key: "floor",
            render: (v) => (v ? v.name : "—"),
        },
        {
            title: "Room Number",
            dataIndex: "roomNumber",
            key: "roomNumber",
            sorter: true,
        },
        {
            title: "Room Type",
            dataIndex: "roomType",
            key: "roomType",
            sorter: true,
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            key: "capacity",
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
            render: (v) =>
                v ? dayjs(v).format("DD-MM-YYYY HH:mm:ss") : "—",
        },
        {
            title: "Actions",
            key: "actions",
            render: (record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setDrawerMode("edit");
                            setEditingRecord(record);
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

    return (
        <>
            <Breadcrumbs title="Room List" items={[{ label: "Room List" }]} />

            <div className="serachbar-bread">
                <Space>
                    <Search
                        placeholder="Search room"
                        allowClear
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            debouncedFetch(e.target.value);
                        }}
                        style={{ width: 260 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={handleReset} />
                    <Button
                        type="primary"
                        onClick={() => {
                            setDrawerMode("add");
                            setEditingRecord(null);
                            form.resetFields();
                            setDrawerOpen(true);
                        }}
                    >
                        Add Room
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={rooms}
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                }}
            />

            <Drawer
                title={drawerMode === "add" ? "Add Room" : "Edit Room"}
                width={420}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                destroyOnClose
            >
                {loading ? (
                    <Spin />
                ) : (
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={async (values) => {
                            try {
                                if (drawerMode === "add") {
                                    await dispatch(createRoom(values)).unwrap();
                                    message.success("Room created");
                                } else {
                                    await dispatch(
                                        updateRoom({
                                            id: editingRecord._id,
                                            data: values,
                                        })
                                    ).unwrap();
                                    message.success("Room updated");
                                }
                                setDrawerOpen(false);
                                dispatch(fetchRooms({ page, limit }));
                            } catch (err) {
                                message.error(err?.message || "Failed");
                            }
                        }}
                    >
                        <Form.Item
                            name="floor"
                            label="Floor"
                            rules={[{ required: true }]}
                        >
                            <Select
                                placeholder="Select Floor"
                                loading={floorLoading}
                            >
                                {floors.map((f) => (
                                    <Select.Option key={f._id} value={f._id}>
                                        {f.name} (Floor {f.floorNumber})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="roomNumber"
                            label="Room Number"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="roomType"
                            label="Room Type"
                            rules={[{ required: true }]}
                        >
                            <Select placeholder="Select Room Type">
                                {ROOM_TYPES.map((type) => (
                                    <Select.Option key={type} value={type}>
                                        {type}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="capacity"
                            label="Capacity"
                            rules={[{ required: true }]}
                        >
                            <Input type="number" />
                        </Form.Item>

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
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        <Space>
                            <Button type="primary" htmlType="submit">
                                {drawerMode === "add" ? "Create" : "Update"}
                            </Button>
                            <Button onClick={() => setDrawerOpen(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form>
                )}
            </Drawer>
        </>
    );
};

export default RoomMaster;
