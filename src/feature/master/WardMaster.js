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
    Dropdown,
    Form,
    Spin,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import {
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    FilterOutlined,
} from "@ant-design/icons";

import {
    fetchWards,
    deleteWard,
    createWard,
    updateWard,
    setSort,
    resetSort,
} from "../../slices/wardSlice";

import Breadcrumbs from "../comman/Breadcrumbs";
import debounce from "lodash/debounce";
import "../../index.css";
import { fetchFloors } from "../../slices/floorSlice";

const { Search } = Input;
dayjs.extend(customParseFormat);

const WardMaster = () => {
    const [form] = Form.useForm();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("add"); // add | edit
    const [editingRecord, setEditingRecord] = useState(null);

    const dispatch = useDispatch();
    const {
        wards,
        loading,
        page,
        limit,
        total,
        orderBy,
        order,
    } = useSelector((state) => state.ward);

    const { floors, loading: floorLoading } = useSelector((state) => state.floor);

    const WARD_TYPES = [
        "GENERAL",
        "SEMI_PRIVATE",
        "PRIVATE",
        "DELUXE",
        "SUITE",
        "ICU",
        "NICU",
        "PICU",
        "CCU",
        "HDU",
    ];
    const [searchText, setSearchText] = useState("");
    useEffect(() => {
        dispatch(fetchWards({ page: 1, limit: 10 }));
    }, [dispatch]);

    useEffect(() => {
        if (drawerOpen && !floorLoading && floors.length === 0) {
            dispatch(fetchFloors({ page: 1, limit: 100 }));
        }
    }, [drawerOpen, floors.length, dispatch, floorLoading]);

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
                    fetchWards({
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
        return () => debouncedFetch.cancel();
    }, [debouncedFetch]);

    const defaultChecked = [
        "name",
        "code",
        "wardType",
        "isActive",
        "notes",
        "floor"
    ];
    const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

    const handleReset = () => {
        setSearchText("");
        dispatch(fetchWards({ page: 1, limit: 10 }));
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (!sorter.order) {
            dispatch(resetSort());
            dispatch(
                fetchWards({
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
            fetchWards({
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
            title: "Delete Ward?",
            content: `Are you sure you want to delete "${record.name}"?`,
            okType: "danger",
            onOk: async () => {
                try {
                    await dispatch(deleteWard(record._id)).unwrap();
                    message.success("Ward deleted successfully");
                    dispatch(fetchWards({ page, limit }));
                } catch (err) {
                    message.error(err?.message || "Delete failed");
                }
            },
        });
    };

    const allColumns = [
        {
            title: "Floor Name",
            dataIndex: "floor",
            key: "floor",
            render: (floor) => (floor ? <strong>{floor.name}</strong> : "—"),
        },
        {
            title: "Ward Name",
            dataIndex: "name",
            key: "name",
            sorter: true,
            sortOrder:
                orderBy === "name"
                    ? order === "ASC"
                        ? "ascend"
                        : "descend"
                    : null,
            render: (text) => text,
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
            title: "Ward Type",
            dataIndex: "wardType",
            key: "wardType",
            sorter: true,
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
            render: (v) => (v ? dayjs(v, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss") : "—"),
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            key: "createdBy",
            sorter: true,
            render: (v) => (v.name ? v.name : "—"),
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            sorter: true,
            render: (v) => (v ? dayjs(v, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss") : "—"),
        },
        {
            title: "Updated By",
            dataIndex: "updatedBy",
            key: "updatedBy",
            sorter: true,
            render: (v) => (v ? v.name : "—"),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
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
        (col) => selectedColumns.includes(col.key) || col.key === "actions"
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
            <Breadcrumbs title="Ward List" items={[{ label: "Ward List" }]} />

            <div className="serachbar-bread ">
                <Space>
                    <Search
                        placeholder="Search ward"
                        allowClear
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            debouncedFetch(e.target.value);
                        }}
                        style={{ width: 260 }}
                    />

                    <Button icon={<ReloadOutlined />} onClick={handleReset} />

                    <Dropdown dropdownRender={() => columnMenu}>
                        <Button icon={<FilterOutlined />} />
                    </Dropdown>

                    <Button
                        type="primary"
                        className="btn"
                        style={{ width: 160 }}
                        onClick={() => {
                            setDrawerMode("add");
                            setEditingRecord(null);
                            form.resetFields();
                            setDrawerOpen(true);
                        }}
                    >
                        Add Ward
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="_id"
                columns={filteredColumns}
                className="wardTabel"
                dataSource={wards}
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50", "100"],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} wards`,
                }}
            />

            {/* DRAWER */}
            <Drawer
                title={drawerMode === "add" ? "Add Ward" : "Edit Ward"}
                width={420}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                destroyOnClose
            >
                {loading ? (
                    <div style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <Spin />
                    </div>
                ) : (
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={async (values) => {
                            try {
                                if (drawerMode === "add") {
                                    await dispatch(createWard(values)).unwrap();
                                    message.success("Ward created");
                                } else {
                                    await dispatch(
                                        updateWard({ id: editingRecord._id, data: values })
                                    ).unwrap();
                                    message.success("Ward updated");
                                }

                                setDrawerOpen(false);
                                dispatch(fetchWards({ page, limit }));
                            } catch (err) {
                                message.error(err?.message || "Failed");
                            }
                        }}
                    >

                        <Form.Item
                            name="floor"
                            label="Floor"
                            rules={[{ required: true, message: "Please select floor" }]}
                        >
                            <Select
                                placeholder="Select Floor"
                                loading={floorLoading}
                                allowClear
                            >
                                {floors.map((floor) => (
                                    <Select.Option key={floor._id} value={floor._id}>
                                        {floor.name} (Floor {floor.floorNumber})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="name" label="Ward Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="code" label="Ward Code" rules={[{ required: true }]}>
                            <Input disabled={drawerMode === "edit"} />
                        </Form.Item>

                        <Form.Item
                            name="wardType"
                            label="Ward Type"
                            rules={[{ required: true, message: "Please select ward type" }]}
                        >
                            <Select placeholder="Select Ward Type">
                                {WARD_TYPES.map((type) => (
                                    <Select.Option key={type} value={type}>
                                        {type}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {drawerMode === "edit" && (
                            <Form.Item
                                name="isActive"
                                label="Active Status"
                                rules={[{ required: true, message: "Please select active status" }]}
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

                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading} >
                                {drawerMode === "add" ? "Create" : "Update"}
                            </Button>
                            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                        </Space>
                    </Form>
                )}
            </Drawer>
        </>
    );
};

export default WardMaster;
