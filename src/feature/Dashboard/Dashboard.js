import React from 'react'
import DashboardCountNumber from '../../components/DashboradCountNumber'
import AppointsmentDashbordList from '../../components/AppointsmentDashbordList'
import { Col, Row } from 'antd'

function Dashboard() {
  return (
    <>
      <div className="heder-dashboard">
        <h2 className="heading-title">Admin Dashboard</h2>
        <div className="header-btn">
          <button className="btn">New Appointment</button>
          <button>Schedule Availability</button>
        </div>
      </div>

      <section>
        <DashboardCountNumber />
      </section>

      <section>
        <AppointsmentDashbordList />
      </section>
    </>
  );
}

export default Dashboard
