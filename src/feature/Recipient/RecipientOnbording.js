import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    Tag,
    Dropdown,
    Spin,
    Pagination,
    Input
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    MoreOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Slice
import {
    fetchRecipients,
    deleteRecipient
} from "../../slices/recipientSlice";

import "../../index.css";

const { Search } = Input; // ✅ Correct Search Component

export function RecipientOnboarding() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [search, setSearch] = useState("");

    const {
        recipients = [],
        loading,
        total,
        page,
        limit
    } = useSelector((state) => state.recipient);

    /* FETCH DATA */
    useEffect(() => {
        dispatch(fetchRecipients({ page: 1, limit: 12, search: "" }));
    }, [dispatch]);

    /* DELETE */
    const handleDelete = async (userId) => {
        const res = await dispatch(deleteRecipient(userId));

        if (res.meta.requestStatus === "fulfilled") {
            dispatch(fetchRecipients({ page: 1, limit: 12, search }));
        }
    };


    return (
        <div className="recipient-container">

            {/* HEADER */}
            <div className="doctor-header ">
                <h2 style={{ textAlign: "left" }}>Recipient Onboarding</h2>
                <div className="doctor-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }} >
                        <Search
                            placeholder="Search Recipient"
                            allowClear
                            style={{ width: "100%" }}
                            value={search}

                            onChange={(e) => {
                                setSearch(e.target.value);
                                dispatch(fetchRecipients({ page: 1, limit: 12, search: e.target.value }));
                            }}
                        />

                        <Button
                            type="primary"
                            className="btn"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/add-edit-recipient")}
                        >
                            Add Recipient
                        </Button>
                    </div>
                </div>
            </div>

            <div className="total-box">
                <Tag color="processing">Total Recipients: {total}</Tag>
            </div>

            {/* LOADER */}
            {loading ? (
                <div className="loader-box">
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[20, 20]} style={{marginBottom:30}}>
                    {recipients.map((r) => {
                        const imageUrl = r?.image
                            ? `${process.env.REACT_APP_API_URL}/uploads/users/${r.image}`
                            : `https://ui-avatars.com/api/?name=${r.name}&background=random&color=fff`;

                        return (
                            <Col xs={24} lg={6} key={r._id}>
                                <Card className="recipient-card doctor-card">
                                    <div className="recipient-flex-wrapper doctor-flex-wrapper">

                                        {/* IMAGE */}
                                        <div className="recipient-left doctor-left">
                                            <img
                                                src={imageUrl}
                                                className="recipient-img doctor-img"
                                                alt={r.name}
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${r.name}&background=random&size=256`;
                                                }}
                                            />
                                        </div>

                                        <div className="recipient-right doctor-right">

                                            <div className="header-row">
                                                <h3 style={{ display: "flex", gap: 10 }}>
                                                    {r.name}
                                                    <Tag color={r.status === "active" ? "green" : "red"}>
                                                        {r.status}
                                                    </Tag>
                                                </h3>

                                                <Dropdown
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: "edit",
                                                                label: "Edit",
                                                                icon: <EditOutlined />,
                                                                onClick: () => navigate(`/add-edit-recipient/${r.userId}`) 
                                                            },
                                                            {
                                                                key: "delete",
                                                                label: <span style={{ color: "red" }}>Delete</span>,
                                                                icon: <DeleteOutlined style={{ color: "red" }} />,
                                                                onClick: () => handleDelete(r.userId) // use userId
                                                            }

                                                        ]
                                                    }}
                                                >
                                                    <MoreOutlined className="menu-icon" />
                                                </Dropdown>
                                            </div>

                                            <p><b>Email:</b> {r.email}</p>
                                            <p><b>Phone:</b> {r.phone}</p>
                                            <p><b>Gender:</b> {r.gender}</p>
                                            <p><b>Age:</b> {r.age}</p>

                                            <p><b>Salary:</b> <Tag color="purple">₹{r.salary}</Tag></p>
                                            <p><b>Shift:</b> {r.shift}</p>
                                            <p><b>Time:</b> {r.time}</p>

                                            <p><b>Address:</b> {r.address}</p>
                                            <p><b>Emergency Contact:</b> {r.emergencyContact}</p>

                                            <p><b>Aadhar:</b> {r.aadharNumber}</p>
                                            <p><b>PAN:</b> {r.panNumber}</p>

                                            <p><b>Note:</b> {r.note}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* PAGINATION */}
            <div className="pagination-fixed">
                <Pagination
                    current={page}
                    total={total}
                    pageSize={limit || 12}
                    onChange={(p) => dispatch(fetchRecipients({ page: p, limit: 12, search }))}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
}

export default RecipientOnboarding;
