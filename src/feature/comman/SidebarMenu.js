import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function SidebarMenu({ collapsed, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const handleMenuClick = ({ key, keyPath }) => {
    navigate(key);
    onMenuClick?.();

    if (!collapsed && keyPath.length > 1) {
      setOpenKeys([]);
    }
  };

  const onOpenChange = (keys) => {
    if (collapsed) {
      setOpenKeys(keys);
      return;
    }

    setOpenKeys(keys);
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      openKeys={openKeys}
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
            { key: '/doctor-onbording', label: 'Doctor List' },
            { key: '/recipient-onboarding', label: 'Recipient List' },
          ],
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
          key: '/ipd',
          icon: <MedicineBoxOutlined />,
          label: 'IPD Patient',
          children: [{ key: '/ipd-patient-list', label: 'IPD Patient' }],
        },
        {
          key: '/chargesList',
          icon: <CreditCardOutlined />,
          label: 'Charges',
          children: [
            { key: '/charge-list', label: 'Charge' },
            { key: '/receive-charge', label: 'Receive Charge' },
            { key: '/patient-ledger', label: 'Patient Ledger' },
          ],
        },
      ]}
    />
  );
}
