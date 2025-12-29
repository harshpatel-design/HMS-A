import React, { useState } from "react";
import { Row, Col, Form, Input, Button, Divider, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";

import authService from "../../services/AuthService";
import RightLogo from "../../images/logo.png";
import ResetImg from "../../images/resetPassword.png";

export default function ResetPassword() {

    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            return message.error("Passwords do not match");
        }

        try {
            setLoading(true);

            // ⭐ USE GLOBAL SERVICE
            await authService.resetPassword(token, values.password);

            message.success("Password Reset Successfully!");
            navigate("/login");

        } catch (err) {
            message.error(err?.message || "Invalid or expired reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row>
            {/* LEFT SIDE */}
            <Col span={12} className="login-left">
                <img src={ResetImg} alt="reset" style={{ width: "80%", objectFit: "cover" }} />
            </Col>

            {/* RIGHT SIDE */}
            <Col span={12} className="login-right">
                <div className="login-box">

                    <img src={RightLogo} alt="logo" className="login-logo" />
                    <h3 className="login-title">Reset Password</h3>

                    <Form layout="vertical" className="form-container" onFinish={onFinish}>

                        <Form.Item
                            name="password"
                            label="New Password"
                            rules={[{ required: true, message: "Password is required" }]}
                        >
                            <Input.Password
                                placeholder="Enter New Password"
                                iconRender={(visible) =>
                                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            rules={[{ required: true, message: "Confirm Password is required" }]}
                        >
                            <Input.Password
                                placeholder="Confirm Password"
                                iconRender={(visible) =>
                                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                }
                            />
                        </Form.Item>

                        <Button type="primary" block htmlType="submit" loading={loading}>
                            Reset Password
                        </Button>

                        <Divider>OR</Divider>

                        <p className="register-text">
                            Remember your password? <Link to="/login">Login</Link>
                        </p>

                    </Form>

                </div>
            </Col>
        </Row>
    );
}
