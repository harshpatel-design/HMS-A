import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
    fetchServices,
    deleteService,
} from "../../slices/serviceSlice";

import {
    Table, Button, Space, Input, Dropdown,
    Checkbox, Pagination, Tooltip, Modal, message
} from "antd";

import {
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    FilterOutlined,
} from "@ant-design/icons";

import Breadcrumbs from "../comman/Breadcrumbs";
import "../../hcss.css";

const { Search } = Input;

const ServiceList = () => {
    const dispatch = useDispatch();

    const {
        services,
        total,
        page,
        limit,
        loading,
    } = useSelector((state) => state.service);

    /* ==========================================
            Column Show / Hide States FIXED
    ========================================== */
    const defaultChecked = ["serviceName", "department", "price", "description", "createdAt"];

    const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

    const [searchText, setSearchText] = useState("");
    const [ordering, setOrdering] = useState("-createdAt");

    useEffect(() => {
        loadData(1, ordering);
    }, []);

    const loadData = (pageNum, orderingValue = ordering) => {
        dispatch(
            fetchServices({
                page: pageNum,
                limit: limit,
                search: searchText,
                ordering: orderingValue,
            })
        );
    };

    const handlePageChange = (newPage) => {
        loadData(newPage, ordering);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: "Delete Service?",
            content: `Are you sure you want to delete "${record?.serviceName?.name}"?`,
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await dispatch(deleteService(record._id)).unwrap();
                    message.success("Service deleted successfully!");
                    loadData(page);
                } catch (err) {
                    message.error(err || "Failed to delete service");
                }
            },
        });
    };

    const handleTableChange = (pagination, filters, sorter) => {
        let orderString = "-createdAt";

        if (sorter.order === "ascend") {
            orderString = sorter.field;
        } else if (sorter.order === "descend") {
            orderString = `-${sorter.field}`;
        }

        setOrdering(orderString);
        loadData(pagination.current, orderString);
    };

    const onSearch = (value) => {
        setSearchText(value);
        loadData(1, ordering);
    };

    /* ============================
        ALL TABLE COLUMNS
    ============================ */
    const allColumns = [
        {
            key: "serviceName",
            title: "Service Name",
            dataIndex: "serviceName",
            render: (val) => val || "N/A",
        },
        {
            key: "department",
            title: "Department",
            dataIndex: "department",
            render: (val) => val || "N/A",
        },
        {
            key: "price",
            title: "Price",
            dataIndex: "price",
            sorter: true,
            render: (price) => `₹${price}`,
        },
        {
            key: "description",
            title: "Description",
            dataIndex: "description",
            render: (text) => text || "—",
        },
        {
            key: "createdAt",
            title: "Created At",
            dataIndex: "createdAt",
            sorter: true,
            render: (date) => new Date(date).toLocaleDateString("en-IN"),
        },
        {
            key: "actions",
            title: "Actions",
            render: (record) => (
                <Space>
                    <Link to={`/edit-service/${record._id}`}>
                        <Button type="text" icon={<EditOutlined />} />
                    </Link>

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

    /* SHOW ONLY SELECTED COLUMNS */
    const filteredColumns = allColumns.filter(
        (col) => selectedColumns.includes(col.key) || col.key === "actions"
    );

    /* ============================
        COLUMN FILTER MENU
    ============================ */
    const columnMenu = (
        <div className="column-filter-menu">
            <div className="column-filter-grid">
                {defaultChecked.map((key) => {
                    const col = allColumns.find((c) => c.key === key);
                    return (
                        <Checkbox
                            key={col.key}
                            checked={selectedColumns.includes(col.key)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedColumns([...selectedColumns, col.key]);
                                } else {
                                    setSelectedColumns(selectedColumns.filter((x) => x !== col.key));
                                }
                            }}
                        >
                            {col.title}
                        </Checkbox>
                    );
                })}
            </div>

            <Button
                type="link"
                onClick={() => setSelectedColumns(defaultChecked)}
            >
                Reset to default
            </Button>
        </div>
    );

    const handleReset = () => {
        setSearchText("");
        setOrdering("-createdAt");
        loadData(1, "-createdAt");
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Breadcrumbs
                    title="Services List"
                    showBack={true}
                    backTo="/services"
                    items={[
                        { label: "Services", href: "/services" },
                        { label: "Services List" },
                    ]}
                />
            </div>

            <div className="serachbar-bread">
                <Space>
                    <Search
                        placeholder="Search services..."
                        onSearch={onSearch}
                        allowClear
                        style={{ width: 280 }}
                    />

                    <Button
                        onClick={handleReset}
                        type="default"
                        icon={<ReloadOutlined />}
                    />

                    <Dropdown
                        dropdownRender={() => columnMenu}
                        trigger={["click"]}
                    >
                        <Button className="column-btn" icon={<FilterOutlined />} />
                    </Dropdown>

                    <Link to="/add-service">
                        <Button type="primary">Add Service</Button>
                    </Link>
                </Space>
            </div>

            <div className="table-scroll-container">
                <Table
                    columns={filteredColumns}
                    dataSource={services}
                    loading={loading}
                    pagination={false}
                    rowKey="_id"
                    onChange={handleTableChange}
                />
            </div>

            <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={handlePageChange}
                className="table-pagination"
            />
        </>
    );
};

export default ServiceList;
