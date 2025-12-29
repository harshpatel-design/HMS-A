import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    Form,
    Input,
    Button,
    Select,
    DatePicker,
    TimePicker,
    Card,
    Row,
    Col,
    Divider,
    Space,
    Typography,
    message,
} from "antd";

import dayjs from "dayjs";

import {
    createAppointment,
    updateAppointment,
    fetchAppointmentById,
} from "../../slices/appointmentSlice";

import doctorService from "../../services/doctorService";
import patientService from "../../services/patientService";

const { TextArea } = Input;
const { Title } = Typography;

const AddEditAppointment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [doctorList, setDoctorList] = useState([]);
    const [patientList, setPatientList] = useState([]);

    const { appointment, loading } = useSelector((state) => state.appointment);
    const [form] = Form.useForm();

    /* ---------------------------------------------------
       LOAD APPOINTMENT IN EDIT MODE
    --------------------------------------------------- */
    useEffect(() => {
        if (isEdit) dispatch(fetchAppointmentById(id));
    }, [id]);

    useEffect(() => {
        if (isEdit && appointment) {
            // Build full name for patient
            const fullName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;

            // Insert patient option if missing
            setPatientList(prev => {
                const exists = prev.some(p => p.value === appointment.patient._id);
                if (!exists) {
                    return [
                        ...prev,
                        { label: fullName, value: appointment.patient._id }
                    ];
                }
                return prev;
            });

            setDoctorList(prev => {
                const exists = prev.some(d => d.value === appointment.doctor._id);
                if (!exists) {
                    return [
                        ...prev,
                        { label: appointment.doctor.name, value: appointment.doctor._id }
                    ];
                }
                return prev;
            });
        }
    }, [appointment]);


    useEffect(() => {
        if (isEdit && appointment) {
            const start = dayjs(appointment.startTime, "HH:mm");
            const end = dayjs(appointment.endTime, "HH:mm");
            fetchDoctorNames();
            fetchPatientNames();

            form.setFieldsValue({
                patient: appointment.patient?._id,
                doctor: appointment.doctor?._id,
                appointmentDate: dayjs(appointment.appointmentDate),
                startTime: start,
                endTime: end,
                type: appointment.type,
                reason: appointment.reason,
                notes: appointment.notes,
                status: appointment.status,
            });
        }
    }, [appointment]);

    /* ---------------------------------------------------
       FETCH DOCTOR LIST
    --------------------------------------------------- */
    const fetchDoctorNames = async () => {
        try {
            if (doctorList.length > 0) return;
            const res = await doctorService.getDoctorNames();
            setDoctorList(
                res.doctors?.map((doc) => ({
                    label: doc.name.toUpperCase(),
                    value: doc.id,
                }))
            );
        } catch {
            message.error("Failed to load doctors");
        }
    };

    /* ---------------------------------------------------
       FETCH PATIENT LIST
    --------------------------------------------------- */
    const fetchPatientNames = async () => {
        try {
            const res = await patientService.getPatientNames({ search: "" });
            setPatientList(
                res.patients?.map((p) => ({
                    label: `${p.name}`,
                    value: p._id,
                })) || []
            );
        } catch {
            message.error("Failed to load patients");
        }
    };

    /* ---------------------------------------------------
       CALCULATE DURATION
    --------------------------------------------------- */
    const calculateDuration = () => {
        const { startTime, endTime } = form.getFieldsValue();
        if (!startTime || !endTime) return 0;

        const diff = dayjs(endTime).diff(dayjs(startTime), "minute");
        return diff > 0 ? diff : 0;
    };

    /* ---------------------------------------------------
       SUBMIT FORM
    --------------------------------------------------- */
    const onFinish = async (values) => {
        const payload = {
            patient: values.patient,
            doctor: values.doctor,
            appointmentDate: values.appointmentDate.format("YYYY-MM-DD"), // FIXED
            startTime: values.startTime.format("HH:mm"),
            endTime: values.endTime.format("HH:mm"),
            duration: calculateDuration(),
            type: values.type ?? "consultation",
            reason: values.reason ?? "",
            notes: values.notes ?? "",
            status: values.status ?? "scheduled",
        };

        try {
            if (isEdit) {
                await dispatch(updateAppointment({ id, data: payload })).unwrap();
                message.success("Appointment updated successfully");
            } else {
                await dispatch(createAppointment(payload)).unwrap();
                message.success("Appointment created successfully");
            }

            navigate("/appointments");
        } catch (err) {
            console.log("err", err);

            message.error(err);
        }
    };

    return (
        <div className="p-6">
            <Card style={{ borderRadius: 12 }}>
                <Title level={3}>{isEdit ? "Edit Appointment" : "Create Appointment"}</Title>

                <Divider />

                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Row gutter={16}>
                        {/* Patient */}
                        <Col span={8}>
                            <Form.Item name="patient" label="Patient" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Select Patient"
                                    onClick={fetchPatientNames}
                                    options={patientList}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>

                        {/* Doctor */}
                        <Col span={8}>
                            <Form.Item name="doctor" label="Doctor" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Select Doctor"
                                    onClick={fetchDoctorNames}
                                    options={doctorList}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>

                        {/* Appointment Type */}
                        <Col span={8}>
                            <Form.Item name="type" label="Appointment Type" rules={[{ required: true }]}>
                                <Select placeholder="Select Type">
                                    <Select.Option value="consultation">Consultation</Select.Option>
                                    <Select.Option value="follow-up">Follow-Up</Select.Option>
                                    <Select.Option value="check-up">Check-Up</Select.Option>
                                    <Select.Option value="procedure">Procedure</Select.Option>
                                    <Select.Option value="other">Other</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Date */}
                        <Col span={4}>
                            <Form.Item
                                name="appointmentDate"
                                label="Date"
                                rules={[{ required: true }]}
                            >
                                <DatePicker
                                    className="w-full"
                                    format="YYYY-MM-DD"
                                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                                />
                            </Form.Item>
                        </Col>

                        {/* Start Time */}
                        <Col span={4}>
                            <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" className="w-full" disabledTime={() => ({})} />
                            </Form.Item>
                        </Col>

                        {/* End Time */}
                        <Col span={4}>
                            <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" className="w-full" disabledTime={() => ({})} />
                            </Form.Item>
                        </Col>


                        <Col span={4}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: "Please select status" }]}
                            >
                                <Select placeholder="Select Status" style={{ paddingLeft: 8, paddingRight: 8 }}>
                                    <Select.Option value="scheduled">Scheduled</Select.Option>
                                    <Select.Option value="completed">Completed</Select.Option>
                                    <Select.Option value="cancelled">Cancelled</Select.Option>
                                    <Select.Option value="no-show">No Show</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                    </Row>

                    {/* Reason */}
                    <Form.Item name="reason" label="Reason">
                        <Input placeholder="Reason for appointment" />
                    </Form.Item>

                    {/* Notes */}
                    <Form.Item name="notes" label="Notes">
                        <TextArea rows={3} />
                    </Form.Item>

                    {/* Submit */}
                    <div style={{ textAlign: "right" }}>
                        <Space>
                            <Button onClick={() => navigate("/appointments")} style={{ borderRadius: 8, padding: "6px 14px", height: 32 }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" className="btn" loading={loading}>
                                {isEdit ? "Update" : "Create"}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AddEditAppointment;
