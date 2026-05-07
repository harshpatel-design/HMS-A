import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, Divider, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';

import authService from '../../services/AuthService';
import logo from '../../images/logo.png';
import leftImg from '../../images/sign.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      return message.error('Passwords do not match');
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, values.password);

      message.success('Password Reset Successfully!');
      navigate('/login');
    } catch (err) {
      message.error(err?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <Row className="loging-wapper">
          <div className="login-page">
            <Col xs={24} md={24} lg={12} className="login-left">
              <img src={leftImg} alt="login" />
            </Col>

            <Col xs={24} md={24} lg={12} className="login-right">
              <Row className="login-content">
                <Col className="login-logo">
                  <img src={logo} alt="logo" />
                </Col>
                <Col className="login-box">
                  <Form layout="vertical" className="form-container" onFinish={onFinish}>
                    <h3 className="login-title">Reset Password</h3>
                    <p className="login-title-p">
                      Please enter below details to access the dashboard
                    </p>
                    <Form.Item
                      name="password"
                      label="New Password"
                      rules={[{ required: true, message: 'Password is required' }]}
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
                      rules={[{ required: true, message: 'Confirm Password is required' }]}
                    >
                      <Input.Password
                        placeholder="Confirm Password"
                        iconRender={(visible) =>
                          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      className="login-btn"
                      block
                      htmlType="submit"
                      loading={loading}
                    >
                      Reset Password
                    </Button>

                    <Divider className="login-divider">OR</Divider>
                    <p className="register-text">
                      Back to login? <Link to="/login">Login</Link>
                    </p>
                  </Form>
                </Col>
              </Row>
            </Col>
          </div>
        </Row>
      </div>
    </>
  );
}
