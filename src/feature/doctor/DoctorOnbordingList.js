import React, { useEffect } from "react";
import { Card, Row, Col, Button, Tag, Dropdown, Spin, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors, deleteDoctor } from "../../slices/doctorSlice";
import "../../index.css";
import Search from "antd/es/transfer/search";
import { useNavigate } from "react-router-dom";

export default function DoctorOnbordingList() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { doctors = [], loading, total, page, limit } =
        useSelector((state) => state.doctor);

    useEffect(() => {
        dispatch(fetchDoctors({ page: 1, limit: 12 }));
    }, [dispatch]);

    const handleDelete = async (userId) => {
        const res = await dispatch(deleteDoctor(userId));

        if (res.meta.requestStatus === "fulfilled") {
            dispatch(fetchDoctors({ page: 1, limit: 12 })); // 🔥 reload data after delete
        }
    };

    return (
        <div className="doctor-container">

            {/* HEADER */}
            <div className="doctor-header">
                <h2 className="title">Doctor Onboarding</h2>
                <div className="doctor-actions">
                    <Search placeholder="Search Doctors" style={{ width: 200 }} />
                    <Button type="primary" className="btn" icon={<PlusOutlined />} onClick={() => navigate("/add-edit-doctor")}>
                        Add Doctor
                    </Button>
                </div>
            </div>

            <div className="total-box">
                <Tag color="processing">Total Doctors: {total}</Tag>
            </div>

            {/* LOADER */}
            {loading ? <div className="loader-box"><Spin size="large" /></div> : (

                <Row gutter={[20, 20]} style={{ marginBottom: 30 }}>
                    {doctors.map((doc) => {
                        let imageUrl = doc?.image
                            ? `${process.env.REACT_APP_API_URL}/uploads/users/${doc.image.includes(".") ? doc.image : `${doc.image}.png`}`
                            : `https://ui-avatars.com/api/?name=${doc.name}&background=random&color=fff`;

                        return (
                            <Col xs={24} lg={6} key={doc.userId}>
                                <Card className="doctor-card">
                                    <div className="doctor-flex-wrapper">

                                        {/* IMAGE */}
                                        <div className="doctor-left">
                                            <img
                                                src={imageUrl}
                                                className="doctor-img"
                                                alt={doc.name}
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${doc.name}&background=random&size=256`;
                                                }}
                                            />
                                        </div>

                                        {/* DETAILS */}
                                        <div className="doctor-right">
                                            <div className="header-row">
                                                <h3 style={{ display: "flex", gap: 10 }}>
                                                    {doc.name}
                                                    <Tag color={doc.status === "active" ? "green" : "red"}>
                                                        {doc.status}
                                                    </Tag>
                                                </h3>

                                                {/* MENU FIXED HERE 🔥 */}
                                                <Dropdown
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: "edit",
                                                                label: "Edit",
                                                                icon: <EditOutlined />,
                                                                onClick: () => navigate(`/add-edit-doctor/${doc.userId}`) // must be userId 🔥
                                                            },
                                                            {
                                                                key: "delete",
                                                                label: <span style={{ color: "red" }}>Delete</span>,
                                                                icon: <DeleteOutlined style={{ color: "red" }} />,
                                                                onClick: () => handleDelete(doc.userId)
                                                            }
                                                        ]
                                                    }}
                                                >
                                                    <MoreOutlined className="menu-icon" />
                                                </Dropdown>
                                            </div>

                                            <p><b>Email:</b> {doc.email}</p>
                                            <p><b>Phone:</b> {doc.phone}</p>
                                            <p><b>Specialization:</b> {doc.specialization} ({doc.department})</p>
                                            <p><b>Experience:</b> {doc.experience} Years</p>
                                            <b>Availability:</b>
                                            <p>
                                                {Object.keys(doc.availability ?? {})
                                                    .filter((day) => doc.availability[day])
                                                    .map((day) => (
                                                        <Tag key={day} color="blue" style={{ margin: "3px 5px 2px 0" }}>
                                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                                        </Tag>
                                                    ))
                                                }
                                            </p>
                                            <b>Education:</b>
                                            {doc.education?.length ? (
                                                doc.education.map((e) => (
                                                    <p key={e._id}>
                                                        <Tag color="green"> 🎓 {e.degree} — {e.institute} ({e.year})</Tag>
                                                    </p>
                                                ))
                                            ) : (
                                                <span>No Records</span>
                                            )}
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
                    onChange={(p) => dispatch(fetchDoctors({ page: p, limit: 12 }))}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
}
