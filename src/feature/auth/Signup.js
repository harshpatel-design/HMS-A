import { Col, Row, Form, Input, Button, Checkbox, Divider } from "antd";
import "../../hcss.css";
import leftImg from "../../images/sign.png";
import RightLogo from "../../images/logo.png";
import { Link } from "react-router-dom";

import {
    EyeInvisibleOutlined,
    EyeOutlined,
    FacebookFilled,
    GoogleOutlined,
    AppleFilled,
} from "@ant-design/icons";

function Signup() {
    return (
        <>
            <Row>
                <Col span={12} className="login-left">
                    <img
                        src={leftImg}
                        alt="left"
                        style={{ width: "60%", height: "60%", objectFit: "cover" }}
                    />
                </Col>

                <Col span={12} className="login-right">
                    <div className="login-box">
                        <img src={RightLogo} alt="logo" className="login-logo" />
                        <h3 className="login-title">Sign In</h3>
                        <Form layout="vertical">
                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[{ required: true, message: "Email required" }]}
                            >
                                <Input placeholder="Enter Email Address" />
                            </Form.Item>

                            {/* Password */}
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: "Password required" }]}
                            >
                                <Input.Password
                                    placeholder="Enter Password"
                                    iconRender={(visible) =>
                                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                    }
                                />
                            </Form.Item>

                            {/* Remember + Forgot */}
                            <div className="login-row">
                                <Checkbox>Remember me</Checkbox>
                                <Link to="#">Forgot password?</Link>
                            </div>

                            {/* Login Button */}
                            <Button type="primary" block className="btn">
                                Login
                            </Button>

                            {/* Divider OR */}
                            <Divider>OR</Divider>

                            {/* ----- Social Icons ----- */}
                            <div className="social-row">
                                <div className="social-icon fb"><FacebookFilled /></div>
                                <div className="social-icon google"><GoogleOutlined /></div>
                                <div className="social-icon apple"><AppleFilled /></div>
                            </div>

                            <p className="register-text">
                                Don’t have an account yet? <Link>Register</Link>
                            </p>
                        </Form>
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default Signup
