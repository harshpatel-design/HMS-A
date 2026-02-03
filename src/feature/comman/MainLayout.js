import React, { useState } from 'react';
import { Layout, message, Tooltip } from 'antd';
import {
  MenuUnfoldOutlined,
  LogoutOutlined,
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../slices/authSlice';

import '../../hcss.css';
import logo from '../../images/logo.png';
import logo2 from '../../images/logo2.png';
import SidebarMenu from '../comman/SidebarMenu';
import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
const { Sider, Content } = Layout;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    Modal.confirm({
      title: null,
      icon: null,
      content: (
        <div className="logout-modal-content">
          <div className="logout-icon">
            <ExclamationCircleFilled />
          </div>
          <h2>Confirm Logout</h2>
          <p>Are you sure you want to logout from your account?</p>
        </div>
      ),
      okText: 'Logout',
      cancelText: 'Cancel',
      className: 'custom-logout-modal',
      centered: true,

      onOk: async () => {
        await dispatch(logoutUser());
        message.success('Logged Out Successfully!');
        navigate('/login');
      },
    });
  };

  return (
    <Layout className="layout-wrapper">
      <header className="head">
        <div className="head-left">
          {isMobile && (
            <MenuUnfoldOutlined
              className="mobile-menu-btn"
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <Link to="/dashbord">
            {' '}
            <img
              src={collapsed ? logo : logo}
              className={collapsed ? ' brand-logo' : 'brand-logo-col'}
              alt="logo"
            />
          </Link>
        </div>

        <div className="head-right">
          <img src={logo2} className="avatar profile-btn" alt="user" />
          <LogoutOutlined className="logout-icon" onClick={handleLogout} />
        </div>
      </header>

      <Layout className="layout-body">
        <Sider
          collapsed={collapsed}
          collapsedWidth={isMobile ? 0 : 75}
          width={isMobile ? '100%' : 240}
          trigger={null}
          className={`sidebar ${isMobile ? 'mobile-sidebar' : ''} ${
            !collapsed && isMobile ? 'open' : ''
          }`}
          breakpoint="md"
          onBreakpoint={(broken) => {
            setIsMobile(broken);
            setCollapsed(broken);
          }}
        >
          <Tooltip title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
            <div className="sidebar-toggle-right" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </div>
          </Tooltip>

          <SidebarMenu
            collapsed={collapsed}
            onMenuClick={() => {
                setCollapsed(true);
            }}
          />
        </Sider>

        <Content className={`content ${collapsed ? 'collapsed' : ''}`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
