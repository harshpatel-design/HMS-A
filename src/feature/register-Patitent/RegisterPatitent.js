// import React from "react";
// import { Row, Col, Form, Input, Button, Checkbox } from "antd";
// import "./RegisterPage.css";
// import { useTranslation } from "react-i18next";
// import "../../index.css"
// import {
//     UserOutlined,
//     MailOutlined,
//     PhoneOutlined,
//     LockOutlined,
//     FacebookFilled,
//     GoogleOutlined,
//     AppleFilled,

// } from "@ant-design/icons";
// import doctorImg from "../../images/img.png";
// import ImgContainer from "../comman/ImgContainer";
// import logo from "../../images/logo.png"

// const RegisterPage = () => {
//     const { t } = useTranslation();


//     return (
//         <>
//             {/* <div className="container"> */}
//             <div className="register-container ">
//                 {/* LEFT SIDE */}
//                 <Row>
//                     <Col span={12} >
//                         <ImgContainer
//                             title="Seamless healthcare access with smart, modern clinic"
//                             description="Experience efficient, secure, and user-friendly healthcare management designed for modern clinics and growing practices."
//                             image={doctorImg}
//                             imageHeight={320}
//                         />
//                     </Col>

//                     <Col className="form-container">
//                         <div className="logo">Preclinic</div>

//                         <h2 className="title">Register</h2>
//                         <p className="subtitle">Please enter your details to create account</p>

//                         <Form layout="vertical" className="register-form">

//                             <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
//                                 <Input prefix={<UserOutlined />} placeholder="Enter Name" />
//                             </Form.Item>

//                             <Form.Item name="email" label="Email Address" rules={[{ required: true }]}>
//                                 <Input prefix={<MailOutlined />} placeholder="Enter Email Address" />
//                             </Form.Item>

//                             <Form.Item name="password" label="Password" rules={[{ required: true }]}>
//                                 <Input.Password prefix={<LockOutlined />} placeholder="************" />
//                             </Form.Item>

//                             <Form.Item
//                                 name="confirmPassword"
//                                 label="Confirm Password"
//                                 dependencies={["password"]}
//                                 rules={[
//                                     { required: true },
//                                     ({ getFieldValue }) => ({
//                                         validator(_, value) {
//                                             if (!value || value === getFieldValue("password"))
//                                                 return Promise.resolve();
//                                             return Promise.reject("Passwords do not match");
//                                         },
//                                     }),
//                                 ]}
//                             >
//                                 <Input.Password prefix={<LockOutlined />} placeholder="************" />
//                             </Form.Item>

//                             <Form.Item>
//                                 <Checkbox>
//                                     I agree to the Terms of Service Privacy Policy
//                                 </Checkbox>
//                             </Form.Item>

//                             <Button type="primary" htmlType="submit" className="register-btn">
//                                 Register
//                             </Button>
//                         </Form>

//                         <div className="divider">OR</div>

//                         <div className="social-btns">
//                             <Button icon={<FacebookFilled />} className="social-box" />
//                             <Button icon={<GoogleOutlined />} className="social-box" />
//                             <Button icon={<AppleFilled />} className="social-box" />
//                         </div>

//                         <p className="footer-text">
//                             Already have an account yet? <span className="login-link">Login</span>
//                         </p>

//                         <p className="copyright">Copyright ©2025 - Preclinic</p>
//                     </Col>
//                 </Row>
//             </div>
//         </>

//     );
// };

// export default RegisterPage;
