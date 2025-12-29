import { Menu } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    CalendarOutlined,
    AppstoreOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../../hcss.css";  // if sidebar styles exist here

export default function SidebarMenu({ collapsed }) {

    const navigate = useNavigate();
    const location = useLocation();
    const handleMenuClick = ({ key }) => {
        navigate(key);
    };
    const menuItems = [
        { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },

        {
            key: "master",
            icon: <UserOutlined />,
            label: "Master",
            children: [
                { label: "Floor" , key: "/floor-master" },
                { label: "Ward" , key: "/ward-master" },
                { label: "room" , key: "/room-master" },
                { label: "bad" , key: "/bed-master" },
                { label: "Lab Test" , key: "/lab-test" },
                { label: "Department" , key: "/department-master" },
            ]
        },
        {
            key: "chargeMaster",
            icon: <UserOutlined />,
            label: "Charge Master",
            children: [
                { label: "Charge" , key: "/charge-master" },
                
            ]
        },
        {
            key: "doctor",
            icon: <UserOutlined />,
            label: "Doctor",
            children: [
                { key: "/doctor-onbording", label: "Doctor List" }
            ]
        },

        {
            key: "recipient",
            icon: <UserOutlined />,
            label: "Recipient",
            children: [
                { key: "/recipient-onboarding", label: "Recipient List" }
            ]
        },

        {
            key: "patitent",
            icon: <UserOutlined />,
            label: "Patients",
            children: [
                { key: "/patitent-onboarding", label: "Patitent List" }
            ]
        },

        {
            key: "appointments",
            icon: <CalendarOutlined />,
            label: "Appointments",
            children: [
                { key: "/appointments", label: "All Appointments" },
                { key: "/add-appointment", label: "New Appointment" }
            ]
        },

        /* 🔥 NEW — SERVICE MENU ADDED */
        {
            key: "services",
            icon: <AppstoreOutlined />,
            label: "Services",
            children: [
                { key: "/services", label: "Service List" },
                { key: "/add-service", label: "Add Service" }
            ]
        },

        { key: "/profile", icon: <UserOutlined />, label: "Profile" }
    ];

    return (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={[
                location.pathname.startsWith("/doctor") ? "doctor" :
                    location.pathname.startsWith("/recipient") ? "recipient" :
                        location.pathname.startsWith("/patitent") ? "patitent" :
                            location.pathname.startsWith("/appointments") ? "appointments" :
                                location.pathname.startsWith("/services") ? "services" : ""
            ]}
            items={menuItems}
            onClick={handleMenuClick}
        />
    );
}
