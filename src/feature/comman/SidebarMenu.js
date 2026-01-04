import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SidebarMenu({ collapsed, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const rootSubmenuKeys = [
    "master",
    "chargeMaster",
    "doctor",
    "recipient",
    "patient",
    "appointments",
    "services",
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    onMenuClick?.();
  };

  // 🔥 AUTO OPEN MENU BASED ON URL
  const getOpenKey = () => {
    if (
      location.pathname.startsWith("/floor") ||
      location.pathname.startsWith("/ward") ||
      location.pathname.startsWith("/room") ||
      location.pathname.startsWith("/bed") ||
      location.pathname.startsWith("/lab") ||
      location.pathname.startsWith("/department")
    ) return ["master"];

    if (location.pathname.startsWith("/charge")) return ["chargeMaster"];
    if (location.pathname.startsWith("/doctor")) return ["doctor"];
    if (location.pathname.startsWith("/recipient")) return ["recipient"];
    if (location.pathname.startsWith("/patitent")) return ["patient"];
    if (location.pathname.startsWith("/appointments")) return ["appointments"];
    if (location.pathname.startsWith("/services")) return ["services"];

    return [];
  };

  useEffect(() => {
    setOpenKeys(getOpenKey());
  }, [location.pathname]);

  // 🔥 ONLY ONE MAIN MENU OPEN
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find(
      (key) => !openKeys.includes(key)
    );

    if (rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };

  const parentRouteMap = {
  master: "/floor-master",
  chargeMaster: "/charge-master",
  doctor: "/doctor-onbording",
  recipient: "/recipient-onboarding",
  patient: "/patitent-onboarding",
  appointments: "/appointments",
  services: "/services",
};

  const handleTitleClick = ({ key }) => {
    const route = parentRouteMap[key];

    if (route) {
      navigate(route);
    }

    onMenuClick?.(); // 🔥 close sidebar on mobile
  };
  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      openKeys={collapsed ? [] : openKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick}
      onTitleClick={handleTitleClick}
      items={[
        { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        {
          key: "master",
          icon: <UserOutlined />,
          label: "Master",
          children: [
            { key: "/floor-master", label: "Floor" },
            { key: "/ward-master", label: "Ward" },
            { key: "/room-master", label: "Room" },
            { key: "/bed-master", label: "Bed" },
            { key: "/lab-test", label: "Lab Test" },
            { key: "/department-master", label: "Department" },
          ],
        },
        {
          key: "chargeMaster",
          icon: <UserOutlined />,
          label: "Charge Master",
          children: [{ key: "/charge-master", label: "Charge" }],
        },
        {
          key: "doctor",
          icon: <UserOutlined />,
          label: "Doctor",
          children: [{ key: "/doctor-onbording", label: "Doctor List" }],
        },
        {
          key: "recipient",
          icon: <UserOutlined />,
          label: "Recipient",
          children: [{ key: "/recipient-onboarding", label: "Recipient List" }],
        },
        {
          key: "patient",
          icon: <UserOutlined />,
          label: "Patients",
          children: [{ key: "/patitent-onboarding", label: "Patient List" }],
        },
        // {
        //   key: "appointments",
        //   icon: <CalendarOutlined />,
        //   label: "Appointments",
        //   children: [
        //     { key: "/appointments", label: "All Appointments" },
        //     { key: "/add-appointment", label: "New Appointment" },
        //   ],
        // },
        // {
        //   key: "services",
        //   icon: <AppstoreOutlined />,
        //   label: "Services",
        //   children: [
        //     { key: "/services", label: "Service List" },
        //     { key: "/add-service", label: "Add Service" },
        //   ],
        // },
        { key: "/profile", icon: <UserOutlined />, label: "Profile" },
      ]}
    />
  );
}
