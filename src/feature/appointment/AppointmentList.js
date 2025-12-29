import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAppointments } from "../../slices/appointmentSlice";
import { FilterOutlined } from "@ant-design/icons";
import Breadcrumbs from "../comman/Breadcrumbs";
import "../../hcss.css";
import { EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { deleteAppointment } from "../../slices/appointmentSlice";

import { Table, Tag, Button, Space, Input, Dropdown, Checkbox, Pagination, Tooltip, Modal, message, DatePicker } from "antd";

const { Search } = Input;

const AppointmentList = () => {
    const dispatch = useDispatch();
    const { RangePicker } = DatePicker;
    const {
        appointments,
        total,
        page,
        limit,
        loading
    } = useSelector((state) => state.appointment);

    const [searchText, setSearchText] = useState("");
    const [ordering, setOrdering] = useState("-appointmentDate");
    const [dateRange, setDateRange] = useState(null);


    // 🔥 Default Visible Columns
    const defaultChecked = [
        "date",
        "time",
        "patientName",
        "doctorId",
        "reason",
        "type",
        "status",
        "phone"
    ];

    const [selectedColumns, setSelectedColumns] = useState(defaultChecked);

    useEffect(() => {
        loadData(1, ordering);
    }, []);
    const loadData = (pageNum, orderingValue = ordering) => {
        dispatch(
            fetchAppointments({
                page: pageNum,
                limit: 10,
                search: searchText,
                ordering: orderingValue,
                startDate: dateRange?.[0]?.startOf("day").toISOString(),
                endDate: dateRange?.[1]?.endOf("day").toISOString(),
            })
        );
    };

    const handlePageChange = (newPage) => {
        let startDate = null,
            endDate = null;

        if (dateRange) {
            startDate = dateRange[0].startOf("day").toISOString();
            endDate = dateRange[1].endOf("day").toISOString();
        }

        loadData(newPage, ordering, startDate, endDate);
    };



    const handleDelete = (record) => {
        Modal.confirm({
            title: "Cancel Appointment?",
            content: `Are you sure you want to cancel this appointment?`,
            okText: "Yes, Cancel",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await dispatch(deleteAppointment(record._id)).unwrap();
                    message.success("Appointment cancelled successfully!");
                    // refresh table
                    dispatch(fetchAppointments());
                } catch (err) {
                    message.error(err || "Failed to cancel appointment");
                }
            },
        });
    };

    const handleTableChange = (pagination, filters, sorter) => {
        let orderString = "-appointmentDate";

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

        dispatch(
            fetchAppointments({
                page: 1,
                limit: 10,
                search: value,
                ordering,
            })
        );
    };


    // Status colors
    const statusColors = {
        scheduled: "blue",
        completed: "green",
        cancelled: "red",
        "no-show": "orange",
    };

    // 🔥 MASTER COLUMN LIST (All columns)
    const allColumns = [
        {
            key: "patientName",
            title: "Patient",
            fixed: "left",
            width: 150,   // FIX WIDTH
            render: (r) => {

                const name = `${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`;
                return (
                    <Tooltip title={name}>
                        <div
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%",
                                textTransform: "capitalize",
                                fontWeight: 500
                            }}
                        >
                            {name}
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            key: "date",
            title: "Date",
            render: (r) =>
                new Date(r.appointmentDate).toLocaleDateString("en-IN"),
            sorter: true
        },
        {
            key: "time",
            title: "Time",
            render: (r) => `${r.startTime} - ${r.endTime}`
        },
        {
            key: "doctorId",
            title: "Dr. Name",
            width: 150,   // FIX WIDTH
            render: (r) => {
                const docName = r.doctor?.name || "N/A";
                return (
                    <Tooltip title={docName}>
                        <div
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%",
                                fontWeight: 600,
                                textTransform: "capitalize"
                            }}
                        >
                            {docName}
                        </div>
                    </Tooltip>
                );
            }
        },

        {
            key: "type",
            title: "Type",
            dataIndex: "type"
        },
        {
            key: "status",
            title: "Status",
            dataIndex: "status",
            render: (status) => {
                const color = statusColors[status?.toLowerCase()] || "default";

                return <Tag color={color} style={{ fontSize: 14, margin: 0 }}> {status}</Tag>;
            }
        },
        {
            key: "reason",
            title: "Reason",
            dataIndex: "reason",
            render: (r) => {
                return r || "—";
            }
        },
        {
            key: "notes",
            title: "Notes",
            dataIndex: "notes"
        },
        {
            key: "phone",
            title: "Phone No",
            render: (record) => record.patient?.phone || "—"
        },
        {
            key: "createdBy",
            title: "Created By",
            render: (r) => r.createdBy?.name
        },
        {
            key: "updatedBy",
            title: "Updated By",
            render: (r) => r.updatedBy?.name || "—"
        },
        {
            key: "actions",
            title: "Actions",
            render: (record) => (
                <Space size="middle">

                    {/* Edit */}
                    <Link to={`/edit-appointment/${record._id}`}>
                        <Button type="text" icon={<EditOutlined />} />
                    </Link>

                    {/* Cancel */}
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        }
    ];

    // 🔥 Filter which columns are visible
    const filteredColumns = allColumns.filter((col) =>
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

    const handleReset = () => {
        setSearchText("");
        setOrdering("-appointmentDate");

        dispatch(
            fetchAppointments({
                page: 1,
                limit: 10,
                search: "",
                ordering: "-appointmentDate"
            })
        );
    };



    return (
        <>
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Breadcrumbs
                    title="Appointments List"
                    showBack={true}
                    backTo="/appointments"
                    items={[
                        { label: "Appointments", href: "/appointments" },
                        { label: "Appointments List" },
                    ]}
                />
            </div>

            <div className="serachbar-bread">
                <Space>


                    <Search
                        placeholder="Search patient or doctor"

                        onSearch={onSearch}
                        allowClear
                        style={{ width: 280 }}
                    />

                    <Button onClick={handleReset} type="default" icon={<ReloadOutlined />} />

                    <RangePicker
                        format="YYYY-MM-DD"
                        onChange={(dates) => {
                            const startDate = dates ? dates[0].startOf("day").toISOString() : null;
                            const endDate = dates ? dates[1].endOf("day").toISOString() : null;

                            dispatch(
                                fetchAppointments({
                                    page: 1,
                                    limit: 10,
                                    search: searchText,
                                    ordering,
                                    startDate,
                                    endDate,
                                })
                            );
                        }}
                    />
                    <Dropdown dropdownRender={() => columnMenu} trigger={["click"]}>
                        <Button className="column-btn" icon={<FilterOutlined />}></Button>
                    </Dropdown>

                    <Link to="/add-appointment">
                        <Button type="primary" className="btn">
                            Add Appointment
                        </Button>
                    </Link>

                </Space>
            </div>

            <div className="table-scroll-container">
                <Table
                    columns={filteredColumns}
                    dataSource={appointments}
                    loading={loading}
                    pagination={false}
                    rowKey="_id"
                    onChange={handleTableChange}
                />
            </div>
            <div>
                <Pagination
                    current={page}
                    total={total}
                    pageSize={limit}
                    onChange={handlePageChange}
                    className="table-pagination"
                />
            </div>
        </>
    );
};

export default AppointmentList;
