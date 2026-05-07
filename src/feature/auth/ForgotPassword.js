import { Col, Row, Form, Input, Button, Divider, message } from 'antd';
import '../../hcss.css';
import leftImg from '../../images/sign.png';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../images/logo.png';
import authService from '../../services/AuthService';

function ForgotPassword() {
  const { loading } = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    const email = values.email;
    const data = await authService.forgotPassword(email);
    if (data.success) {
      messageApi.success(data.message);
    } else {
      messageApi.error(data.message);
    }
  };



  return (
    <>
      {contextHolder}
      <div className="page-wrapper">
        <Row className="loging-wapper">
          <div className="login-page">
            <Col xs={24} lg={12} md={24} className="login-left">
              <img src={leftImg} alt="forget-password" />
            </Col>

            <Col xs={24} lg={12} md={24} className="login-right">
              <Row className="login-content">
                <Col className="login-logo">
                  <img src={logo} alt="logo" />
                </Col>
                <Col className="login-box">
                  <Form layout="vertical" className="form-container" onFinish={onFinish}>
                    <h3 className="login-title">Forgot Password</h3>
                    <p className="login-title-p">No worries, we’ll send you reset instructions</p>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[{ required: true, message: 'Email is required' }]}
                    >
                      <Input placeholder="Enter Email" />
                    </Form.Item>

                    <Button
                      type="primary"
                      className="login-btn"
                      block
                      htmlType="submit"
                      loading={loading}
                    >
                      Submit
                    </Button>

                    <Divider className="login-divider">OR</Divider>
                    <p className="register-text">
                      Remember your password? <Link to="/login">Sign In</Link>
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

export default ForgotPassword;
