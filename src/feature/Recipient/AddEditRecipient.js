import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    Row,
    Col,
    Card,
    Button,
    Upload,
    InputNumber,
    Select,
    message,
    Spin
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
    fetchRecipientById,
    updateRecipient,
    createRecipient
} from "../../slices/recipientSlice";

import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../comman/Breadcrumbs";

const { TextArea } = Input;
const { Option } = Select;

export default function AddEditRecipient() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [oldImage, setOldImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const buildImageUrl = (img) => {
        if (!img) return null;

        if (img.startsWith("http")) return img;
        if (img.startsWith("/uploads/users/")) {
            return `${process.env.REACT_APP_API_URL}${img}`;
        }

        return `${process.env.REACT_APP_API_URL}/uploads/users/${img}`;
    };

    useEffect(() => {
        if (isEdit) {
            setLoading(true);

            dispatch(fetchRecipientById(id))
                .unwrap()
                .then((res) => {
                    const recipient =
                        res.recipient?.recipient ||
                        res.recipient ||
                        res.data?.recipient ||
                        res.data ||
                        res;

                    console.log("recipient", recipient);

                    if (!recipient) return;
                    form.setFieldsValue({
                        name: recipient.name,
                        email: recipient.email,
                        phone: recipient.phone,
                        gender: recipient.gender,
                        age: recipient.age,
                        status: recipient.status,

                        salary: recipient.salary,
                        shift: recipient.shift,
                        time: recipient.time,

                        address: recipient.address,
                        emergencyContact: recipient.emergencyContact,

                        aadharNumber: recipient.aadharNumber,
                        panNumber: recipient.panNumber,

                        note: recipient.note
                    });

                    if (recipient.image) {
                        setPreview(buildImageUrl(recipient.image));
                        setOldImage(recipient.image);
                    }
                })
                .catch(() => message.error("Failed to load recipient"))
                .finally(() => setLoading(false));
        }
    }, [isEdit, id, dispatch, form]);

    const handleImageChange = (info) => {
        const file = info.file;
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            return message.error("Only image files allowed");
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };


    /* ======================================================
        SUBMIT FORM
    ====================================================== */
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();

            if (imageFile) {
                formData.append("image", imageFile);
            } else if (isEdit && oldImage && !preview) {
                formData.append("image", "");
            }

            Object.keys(values).forEach((key) => {
                formData.append(key, values[key]);
            });

            let result;

            if (isEdit) {
                result = await dispatch(updateRecipient({ id, data: formData })).unwrap();

                return message.success({
                    content: "Recipient updated successfully!",
                    duration: 1,
                    onClose: () => navigate("/recipient-onboarding")
                });
            }

            result = await dispatch(createRecipient(formData)).unwrap();

            return message.success({
                content: "Recipient created successfully!",
                duration: 1,
                onClose: () => navigate("/recipient-onboarding")
            });

        } catch (error) {
            const backendMsg =
                error?.response?.data?.details?.[0] ||
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong!";

            message.error(backendMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {loading && <Spin fullscreen size="large" tip="Loading..." />}

            <Breadcrumbs
                title={isEdit ? "Edit Recipient" : "Add New Recipient"}
                showBack={true}
                backTo="/recipient-onboarding"
                items={[
                    { label: "Recipients", href: "/recipient-onboarding" },
                    { label: isEdit ? "Edit Recipient" : "Add New Recipient" }
                ]}
            />

            <div
                className="doctor-form-wrapper"
                style={{
                    opacity: loading ? 0.5 : 1,
                    marginBottom: 30
                }}>
                <Form layout="vertical" form={form} onFinish={onFinish}>

                    {/* IMAGE UPLOAD */}
                    <Card className="doctor-card">
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={() => false}
                            accept="image/*"
                            onChange={handleImageChange}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="recipient"
                                    style={{ width: "100%", height: "100%", borderRadius: 8 }}
                                />
                            ) : (
                                <div>
                                    <PlusOutlined style={{ fontSize: 24 }} />
                                    <div>Upload Photo</div>
                                    {!isEdit && <span style={{ color: "red", fontSize: 12 }}>* Required</span>}
                                </div>
                            )}
                        </Upload>
                    </Card>

                    {/* BASIC INFORMATION */}
                    <Card title="Basic Information" className="doctor-card">
                        <Row gutter={15}>
                            <Col span={8}>
                                <Form.Item
                                    name="name"
                                    label="Full Name"
                                    rules={[{ required: true, message: "Name is required" }]}
                                >
                                    <Input disabled={loading} />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: "Email is required" },
                                        { type: "email", message: "Enter a valid email" },
                                    ]}
                                >
                                    <Input disabled={loading} />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="phone"
                                    label="Phone"
                                    rules={[
                                        { required: true, message: "Phone is required" },
                                        { len: 10, message: "Phone must be 10 digits" },
                                    ]}
                                >
                                    <Input maxLength={10} disabled={loading} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={15}>
                            <Col span={8}>
                                <Form.Item
                                    name="gender"
                                    label="Gender"
                                    rules={[{ required: true }]}
                                >
                                    <Select disabled={loading}>
                                        <Option value="male">Male</Option>
                                        <Option value="female">Female</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="age"
                                    label="Age"
                                    rules={[{ required: true }]}
                                >
                                    <InputNumber style={{ width: "100%" }} disabled={loading} />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="status"
                                    label="Status"
                                    rules={[{ required: true }]}
                                >
                                    <Select disabled={loading}>
                                        <Option value="active">Active</Option>
                                        <Option value="inactive">Inactive</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* JOB INFO */}
                    <Card title="Job Information" className="doctor-card">
                        <Row gutter={15}>
                            <Col span={8}>
                                <Form.Item
                                    name="salary"
                                    label="Salary"
                                    rules={[{ required: true }]}
                                >
                                    <InputNumber style={{ width: "100%" }} disabled={loading} />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="shift"
                                    label="Shift"
                                    rules={[{ required: true }]}
                                >
                                    <Select disabled={loading}>
                                        <Option value="day">Day</Option>
                                        <Option value="night">Night</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="time"
                                    label="Working Hours"
                                    rules={[{ required: true }]}
                                >
                                    <Input disabled={loading} placeholder="10 AM - 6 PM" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* PERSONAL INFO */}
                    <Card title="Personal & Identity Info" className="doctor-card">
                        <Row gutter={15}>
                            <Col span={12}>
                                <Form.Item
                                    name="address"
                                    label="Address"
                                    rules={[{ required: true }]}
                                >
                                    <TextArea rows={3} disabled={loading} />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="emergencyContact"
                                    label="Emergency Contact"
                                    rules={[
                                        { required: true },
                                        { len: 10, message: "Must be 10 digits" }
                                    ]}
                                >
                                    <Input maxLength={10} disabled={loading} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={15}>
                            <Col span={12}>
                                <Form.Item
                                    name="aadharNumber"
                                    label="Aadhar Number"
                                    rules={[
                                        { required: true },
                                        { len: 12, message: "Aadhar must be 12 digits" }
                                    ]}
                                >
                                    <Input maxLength={12} disabled={loading} />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="panNumber"
                                    label="PAN Number"
                                    rules={[
                                        { required: true },
                                        {
                                            pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                                            message: "Invalid PAN Format"
                                        }
                                    ]}
                                >
                                    <Input maxLength={10} disabled={loading} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="note" label="Note">
                            <TextArea rows={3} disabled={loading} />
                        </Form.Item>
                    </Card>

                    {/* SUBMIT */}
                    <div style={{ textAlign: "right", marginTop: 10 }}>
                        <Button type="primary" htmlType="submit" disabled={loading} className="btn">
                            {loading ? "Processing..." : isEdit ? "Update Recipient" : "Create Recipient"}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    );
}
