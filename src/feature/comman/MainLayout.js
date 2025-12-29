import React, { useState } from "react";
import { Layout, message } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../slices/authSlice";

import "../../hcss.css";
import logo from "../../images/logo.png";
import logo2 from "../../images/logo2.png";
import SidebarMenu from "../comman/SidebarMenu";  // 👈 Sidebar Component Imported
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
const { Sider, Content } = Layout;

export default function MainLayout() {

    const [collapsed, setCollapsed] = useState(false);
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
            okText: "Logout",
            cancelText: "Cancel",
            className: "custom-logout-modal",
            centered: true,

            onOk: async () => {
                await dispatch(logoutUser());
                message.success("Logged Out Successfully!");
                navigate("/login");
            }
        });
    };

    return (
        <Layout className="layout-wrapper">

            {/* HEADER */}
            <header className="head">
                <div className="head-left">
                    <img src={collapsed ? logo2 : logo} className="brand-logo" alt="logo" />
                </div>

                <div className="head-right">
                    <img src={logo2} className="avatar profile-btn" alt="user" />
                    <LogoutOutlined className="logout-icon" onClick={handleLogout} />
                </div>
            </header>

            <Layout className="layout-body">

                {/* SIDEBAR */}
                <Sider collapsed={collapsed} width={240} collapsedWidth={75} trigger={null} className="sidebar">

                    {/* Toggle Button */}
                    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
                        <div
                            className="sidebar-toggle-right"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </div>

                        {/* sidebar content */}
                    </div>

                    {/* 👉 SEPARATE COMPONENT HERE */}
                    <SidebarMenu collapsed={collapsed} />

                </Sider>

                {/* MAIN CONTENT */}
                <Content className={`content ${collapsed ? "collapsed" : ""}`}>

                    <Outlet /> {/* Renders pages */}

                </Content>

            </Layout>

        </Layout>
    );
}
