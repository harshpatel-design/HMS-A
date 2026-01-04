import { Col, Row, Form, Input, Button, Checkbox, Divider, message } from "antd"
import "../../hcss.css";
import leftImg from "../../images/sign.png";
import RightLogo from "../../images/logo.png";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../slices/authSlice";

function Login() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const onFinish = async (values) => {
    const result = await dispatch(loginUser(values));

    if (result.meta.requestStatus === "fulfilled") {
      message.success("Login Successful 🎉");
      navigate("/dashboard");
    } else {
      const err = result.payload;
      console.log(err);

      message.error(err?.message || "Invalid Email or Password");
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <Row className="loging-wapper">
          <div className="login-page">
            <Col xs={0} md={12} className="login-left">
              <img src={leftImg} alt="login" />
            </Col>

            <Col xs={24} md={12} className="login-right">
              <div className="login-box">
                <Form layout="vertical" className="form-container" onFinish={onFinish}>
                  <h3 className="login-title">Login</h3>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[{ required: true, message: 'Email is required' }]}
                  >
                    <Input placeholder="Enter Email" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Password is required' }]}
                  >
                    <Input.Password
                      placeholder="Enter Password"
                      iconRender={(v) => (v ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

                  <Button type="primary" block htmlType="submit" loading={loading}>
                    Login
                  </Button>

                  <Divider>OR</Divider>
                  <p className="register-text">
                    Don't have an account? <Link to="/register">Register</Link>
                  </p>
                </Form>
              </div>
            </Col>
          </div>
        </Row>
      </div>
    </>
  );
}

export default Login;
