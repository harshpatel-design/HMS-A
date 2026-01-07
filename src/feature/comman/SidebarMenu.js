import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function SidebarMenu({ collapsed, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const rootSubmenuKeys = [
  'master',
  'charge',
  'doctor',
  'recipient',
  'patient',
  'appointments',
  'services'
];


  const handleMenuClick = ({ key }) => {
    navigate(key);
    onMenuClick?.();
  };

  const getOpenKey = () => {
    if (
      location.pathname.startsWith('/floor') ||
      location.pathname.startsWith('/ward') ||
      location.pathname.startsWith('/room') ||
      location.pathname.startsWith('/bed') ||
      location.pathname.startsWith('/lab') ||
      location.pathname.startsWith('/department') ||
      location.pathname.startsWith('/charge-master')
    )
      return ['master'];

     if (location.pathname.startsWith("/charge-list")) {
      return ["chargesList"];
    }

   if (
      location.pathname.startsWith("/doctor") ||
      location.pathname.startsWith("/recipient")
    ) {
      return ["user"];
    }
   if (
      location.pathname.startsWith("/patitent") ||
      location.pathname.startsWith("/patient-visit")
    ) {
      return ["patient"];
    }

    if (location.pathname.startsWith('/appointments')) return ['appointments'];
    if (location.pathname.startsWith('/services')) return ['services'];

    return [];
  };

  useEffect(() => {
    setOpenKeys(getOpenKey());
  }, [location.pathname]);

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));

    if (rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };

 return (
   <Menu
     theme='dark'
     mode="inline"
     selectedKeys={[location.pathname]}
     inlineCollapsed={collapsed}
     triggerSubMenuAction="hover"
     onOpenChange={onOpenChange}
     onClick={handleMenuClick}
     items={[
       { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },

       {
         key: '/user',
         icon: <UserOutlined />,
         label: 'User',
         children: [
           {
             key: '/doctor-onbording',
             label: 'Doctor List',
           },
           {
             key: '/recipient-onboarding',
             label: 'Recipient List',
           },
         ],
       },

       {
         key: '/master',
         icon: <AppstoreOutlined />,
         label: 'Master',
         children: [
           { key: '/floor-master', label: 'Floor' },
           { key: '/ward-master', label: 'Ward' },
           { key: '/room-master', label: 'Room' },
           { key: '/bed-master', label: 'Bed' },
           { key: '/lab-test', label: 'Lab Test' },
           { key: '/department-master', label: 'Department' },
           { key: '/charge-master', label: 'Charge Master' },
         ],
       },
       {
         key: '/chargesList',
         icon: <CreditCardOutlined />,
         label: 'Charges',
         children: [{ key: '/charge-list', label: 'Charge' }],
       },
       {
         key: '/patient',
         icon: <UserOutlined />,
         label: 'Patient',
         children: [
           { key: '/patitent-onboarding', label: 'Patient' },
           { key: '/patient-visit', label: 'Patient Visit' },
         ],
       },
       { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
     ]}
   />
 );

}
