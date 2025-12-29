import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Select,
    DatePicker,
    Card,
    Row,
    Col,
    Button,
    Spin,
    message
} from "antd";

import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import Breadcrumbs from "../comman/Breadcrumbs";
import doctorService from "../../services/doctorService"
import {
    fetchPatientById,
    createPatient,
    updatePatient
} from "../../slices/patientSlice";

const { Option } = Select;

export function AddEditPatient() {
    const { id } = useParams();
    const isEdit = Boolean(id);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form] = Form.useForm();

    const { patient, loading } = useSelector((state) => state.patient);

    const [caseType, setCaseType] = useState(null);
    const [doctorNames, setDoctorNames] = useState([]);
    const [doctorLoading, setDoctorLoading] = useState(false);

    // 1️⃣ Fetch patient on edit mode
    useEffect(() => {
        if (isEdit) {
            dispatch(fetchPatientById(id));
        }
    }, [isEdit, id]);

    // 2️⃣ Fill form when patient data loads
    useEffect(() => {
        if (patient && isEdit) {
            // patient already contains the actual object
            const p = patient;

            setCaseType(p.caseType);

            const formatted = {
                ...p,
                dob: p.dob ? dayjs(p.dob) : null,

                opd: p.opd
                    ? {
                        ...p.opd,
                        lastVisit: p?.opd?.lastVisit ? dayjs(p.opd.lastVisit) : null,
                    }
                    : undefined,

                ipd: p.ipd
                    ? {
                        ...p.ipd,
                        admissionDate: p.ipd.admissionDate ? dayjs(p.ipd.admissionDate) : null,
                        dischargeDate: p.ipd.dischargeDate ? dayjs(p.ipd.dischargeDate) : null,
                    }
                    : undefined,
            };

            form.setFieldsValue(formatted);
        }
    }, [patient, isEdit, form]);

    // 3️⃣ Auto age calculation + case type switching
    const handleValuesChange = (changed, all) => {
        if (changed.caseType) setCaseType(changed.caseType);

        if (changed.dob) {
            const dob = changed.dob;
            if (dob) {
                const today = new Date();
                const birth = new Date(dob);

                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }

                form.setFieldsValue({ age });
            }
        }
    };

    const fetchDoctorNames = async () => {
        try {
            setDoctorLoading(true);
            const res = await doctorService.getDoctorNames({ search: "", sort: "asc" });
            setDoctorNames(res.doctors || []);
        } catch (err) {
            setDoctorNames([]);
        } finally {
            setDoctorLoading(false);
        }
    };

    const onFinishFailed = ({ errorFields }) => {
        const allErrors = errorFields
            .flatMap(field => field.errors)
            .map(err => `• ${err}`)
            .join("\n");

        message.error({
            content: allErrors,
            duration: 4,
            style: { whiteSpace: "pre-line" }
        });
    };

    const onFinish = async (values) => {
        try {
            const payload = { ...values };

            if (payload.dob) payload.dob = payload.dob.toISOString();

            if (payload.opd?.lastVisit)
                payload.opd.lastVisit = payload.opd.lastVisit.toISOString();

            if (payload.ipd?.admissionDate)
                payload.ipd.admissionDate = payload.ipd.admissionDate.toISOString();

            if (payload.ipd?.dischargeDate)
                payload.ipd.dischargeDate = payload.ipd.dischargeDate.toISOString();

            if (payload.ipd) {
                if (!payload.ipd.admissionDate) delete payload.ipd.admissionDate;
                if (!payload.ipd.dischargeDate) delete payload.ipd.dischargeDate;
            }

            if (payload.opd && !payload.opd.doctor) delete payload.opd.doctor;
            if (payload.ipd && !payload.ipd.doctor) delete payload.ipd.doctor;

            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "object" && payload[key] !== null) {
                    payload[key] = JSON.stringify(payload[key]);
                }
            });


            let res;

            if (isEdit) {
                res = await dispatch(updatePatient({ id, data: payload })).unwrap();
            } else {
                res = await dispatch(createPatient(payload)).unwrap();
            }


            if (!res || res.success === false || res.details) {

                const msg = Array.isArray(res?.details)
                    ? res.details.map((d) => d.replace(/"/g, "")).join("\n")
                    : res?.message || "Something went wrong!";

                message.error({
                    content: msg,
                    duration: 3,
                    style: { whiteSpace: "pre-line" }
                });

                return; // STOP → no success, no navigation
            }


            message.success(
                res.message || (isEdit ? "Patient updated successfully" : "Patient created successfully")
            );

            navigate("/patitent-onboarding");
        } catch (err) {
            let errorMsg = "";

            if (Array.isArray(err?.response?.data?.details)) {
                errorMsg = err.response.data.details
                    .map((d) => d.replace(/"/g, ""))
                    .join("\n");
            } else {
                errorMsg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save patient";
            }

            message.error({
                content: errorMsg,
                duration: 4,
                style: { whiteSpace: "pre-line" }
            });
        }
    };

    console.log("doctorNames", doctorNames);


    return (
        <>
            {loading && (
                <Spin fullscreen size="large" tip="Loading..." />
            )}
            <Breadcrumbs
                title="View Patient"
                showBack={true}
                backTo="/patitent-onboarding"
                items={[
                    { label: "Patient List", href: "/patitent-onboarding" },
                    { label: "View Patient" }
                ]}
            />

            <div className="doctor-container patient-container">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={handleValuesChange}
                    disabled={loading}
                >
                    {/* BASIC INFORMATION */}
                    <Card title="Basic Information" style={{ marginBottom: 20 }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                    <Input placeholder="Enter first name" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="lastName" label="Last Name">
                                    <Input placeholder="Enter last name" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                                    <Select placeholder="Select gender">
                                        <Option value="male">Male</Option>
                                        <Option value="female">Female</Option>
                                        <Option value="other">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="dob"
                                    label="Date of Birth"
                                >
                                    <DatePicker placeholder="Select DOB" style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="age"
                                    label="Age"
                                    rules={[{ required: true, message: "Please enter age" }]}
                                >
                                    <Input type="number" placeholder="Enter age" />
                                </Form.Item>
                            </Col>


                            <Col span={8}>
                                <Form.Item name="bloodGroup" label="Blood Group">
                                    <Select placeholder="Select blood group">
                                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                            <Option key={bg}>{bg}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                                    <Input placeholder="Primary phone" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="altPhone" label="Alt Phone">
                                    <Input placeholder="Alternate phone" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="email" label="Email">
                                    <Input placeholder="Enter email" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* ADDRESS */}
                    <Card title="Address Information" style={{ marginBottom: 20 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={["address", "line1"]}
                                    label="Address Line 1"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="Line 1" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name={["address", "line2"]} label="Address Line 2">
                                    <Input placeholder="Line 2" />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item name={["address", "city"]} label="City" rules={[{ required: true }]}>
                                    <Input placeholder="City" />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item name={["address", "state"]} label="State" rules={[{ required: true }]}>
                                    <Input placeholder="State" />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item name={["address", "zip"]} label="ZIP" rules={[{ required: true }]}>
                                    <Input placeholder="ZIP Code" />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item
                                    name={["address", "country"]}
                                    label="Country"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="Country" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* VITALS */}
                    <Card title="Vitals" style={{ marginTop: 20 }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name={["vitals", "height"]} label="Height (cm)">
                                    <Input type="number" placeholder="Enter height" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name={["vitals", "weight"]} label="Weight (kg)">
                                    <Input type="number" placeholder="Enter weight" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name={["vitals", "temperature"]} label="Temperature (°C)">
                                    <Input type="number" placeholder="Enter temperature" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name={["vitals", "bloodPressure"]} label="Blood Pressure">
                                    <Input placeholder="e.g., 120/80" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name={["vitals", "pulse"]} label="Pulse">
                                    <Input type="number" placeholder="Pulse rate" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name={["vitals", "spo2"]} label="SpO2 (%)">
                                    <Input type="number" placeholder="Oxygen level" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* CASE TYPE */}
                    <Card title="Case Type">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="caseType" label="Case Type" rules={[{ required: true }]}>
                                    <Select placeholder="Select OPD / IPD / Emergency">
                                        <Option value="opd">OPD</Option>
                                        <Option value="ipd">IPD</Option>
                                        <Option value="emergency">Emergency</Option>
                                        <Option value="appointment">Appointment</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* OPD */}
                    {caseType === "opd" && (
                        <Card title="OPD Details" style={{ marginTop: 20 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="case" label="Case" rules={[{ required: true }]}>
                                        <Select placeholder="Select Old / New">
                                            <Option value="old">Old</Option>
                                            <Option value="new">New</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={["opd", "doctor"]}
                                        label="Doctor"
                                        rules={[{ required: true, message: "Please select a doctor" }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Select Doctor"
                                            loading={doctorLoading}
                                            allowClear
                                            filterOption={false}
                                            onClick={() => {
                                                if (doctorNames.length === 0) {
                                                    fetchDoctorNames();   // API hit on click
                                                }
                                            }}
                                        >
                                            {doctorNames.map((d) => (
                                                <Select.Option key={d._id} value={d._id}>
                                                    {d.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["opd", "visitReason"]} label="Visit Reason">
                                        <Input placeholder="Reason for visit" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["opd", "visitCount"]} label="Visit Count">
                                        <Input type="number" placeholder="Visit count" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["opd", "lastVisit"]} label="Last Visit">
                                        <DatePicker style={{ width: "100%" }} placeholder="Select date" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* IPD */}
                    {caseType === "ipd" && (
                        <Card title="IPD Details" style={{ marginTop: 20 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name={["ipd", "doctor"]}
                                        label="Doctor"
                                        rules={[{ required: true, message: "Please select a doctor" }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Select Doctor"
                                            loading={doctorLoading}
                                            allowClear
                                            filterOption={false}
                                            onClick={() => {
                                                if (doctorNames.length === 0) {
                                                    fetchDoctorNames();
                                                }
                                            }}
                                        >
                                            {doctorNames.map((d) => (
                                                <Select.Option key={d.id} value={d.id}>
                                                    {d.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>


                                <Col span={8}>
                                    <Form.Item name={["ipd", "ward"]} label="Ward">
                                        <Input placeholder="Ward name" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["ipd", "roomNumber"]} label="Room Number">
                                        <Input placeholder="Room number" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["ipd", "bedNumber"]} label="Bed Number">
                                        <Input placeholder="Bed number" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["ipd", "admissionDate"]} label="Admission Date">
                                        <DatePicker style={{ width: "100%" }} placeholder="Select admission date" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* EMERGENCY */}
                    {caseType === "emergency" && (
                        <Card title="Emergency Details" style={{ marginTop: 20 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name={["emergency", "level"]} label="Emergency Level">
                                        <Select placeholder="Select level">
                                            <Option value="low">Low</Option>
                                            <Option value="medium">Medium</Option>
                                            <Option value="high">High</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name={["emergency", "broughtBy"]} label="Brought By">
                                        <Input placeholder="Name of person" />
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <Form.Item
                                        name={["emergency", "conditionNotes"]}
                                        label="Condition Notes"
                                    >
                                        <Input.TextArea placeholder="Enter patient condition notes" rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* BUTTONS */}
                    <div style={{ textAlign: "right", marginTop: 20 }}>
                        <Button
                            style={{ marginRight: 10 }}
                            onClick={() => navigate("/patients-list")}
                        >
                            Cancel
                        </Button>

                        <Button type="primary" htmlType="submit" style={{ background: "#001a33" }}>
                            {isEdit ? "Update Patient" : "Add Patient"}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    );
}

export default AddEditPatient;
