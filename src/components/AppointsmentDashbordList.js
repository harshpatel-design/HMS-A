import { Avatar, Card, Col, Row, Select } from 'antd'
import React, { useState } from 'react'
import "../hcss.css"
import StackedBarChart from './StackedBarChart';

import { UserOutlined } from "@ant-design/icons";
import AppointmentsWidget from './AppointmentsWidget';


const { Option } = Select;
function AppointsmentDashbordList() {
    const [filter, setFilter] = useState("7days");

    const FILTER_OPTIONS = [
        { label: "Last 7 Days", value: "7days" },
        { label: "This Week", value: "week" },
        { label: "This Month", value: "month" },
        { label: "This Year", value: "year" },
    ];
    const doctors = [
        {
            name: "Dr. Mick Thompson",
            specialty: "Cardiologist",
            bookings: 258,
            image: "",
        },
        {
            name: "Dr. Emily Carter",
            specialty: "Pediatrician",
            bookings: 125,
            image: "",
        },
        {
            name: "Dr. David Lee",
            specialty: "Gynecologist",
            bookings: 115,
            image: null,
        },
    ];


    return (
        <>
            <div className="appointment-dashboard">
                <Row gutter={[24,24]} >
                    <Col span={15} style={{background:"#fff"}}>
                        <Row>
                            <Col span={24} >
                                <div className='app-heading'>
                                    <h1 className='dashbord-heading'>
                                        Appointment Statistic
                                    </h1>
                                    <Select
                                        value={filter}
                                        onChange={setFilter}
                                        style={{ width: 160 }}
                                    >
                                        {FILTER_OPTIONS.map((item) => (
                                            <Option key={item.value} value={item.value}>
                                                {item.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <Row gutter={[16, 24]} style={{ marginTop: 12 }}>

                                    <Col span={6}>
                                        <div className="dash-card">
                                            <span className="dash-title">All Appointments</span>
                                            <h2 className="dash-count">6314</h2>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div className="dash-card">
                                            <span className="dash-title">Canclled</span>
                                            <h2 className="dash-count">343</h2>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div className="dash-card">
                                            <span className="dash-title">Reschedule</span>
                                            <h2 className="dash-count">543</h2>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div className="dash-card">
                                            <span className="dash-title">Complated</span>
                                            <h2 className="dash-count">314</h2>
                                        </div>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                                    <Col span={24}>
                                        <Card title="Product Statistics">
                                            <StackedBarChart />
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <div className='app-heading'>
                                            <h1 className='dashbord-heading'>
                                                Appointment Statistic
                                            </h1>
                                            <Select
                                                value={filter}
                                                onChange={setFilter}
                                                style={{ width: 160 }}
                                            >
                                                {FILTER_OPTIONS.map((item) => (
                                                    <Option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <Row gutter={16} style={{ border: "1px solid #0000001f", padding:"16px 6px" , borderRadius:10 }}>
                                            {doctors.map((doc, index) => (
                                                <Col span={8} key={index} >
                                                    <Card className="doctor-card">
                                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                            {doc.image ? (
                                                                <img
                                                                    src={doc.image}
                                                                    alt={doc.name}
                                                                    style={{
                                                                        width: 48,
                                                                        height: 48,
                                                                        borderRadius: "50%",
                                                                        objectFit: "cover",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Avatar size={48} icon={<UserOutlined />} />
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{doc.name}</div>
                                                                <div style={{ fontSize: 12, color: "#888" }}>
                                                                    {doc.specialty}
                                                                </div>
                                                                <div style={{ marginTop: 4, fontSize: 12 }}>
                                                                    <b>{doc.bookings}</b> Bookings
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>


                    <Col span={9}>
                        <div className="full-height">
                            <AppointmentsWidget />
                        </div>
                    </Col>
                </Row >
            </div>
        </>

    )
}

export default AppointsmentDashbordList