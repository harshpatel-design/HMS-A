import React from 'react';
import { Row, Col } from 'antd';
import doctoricon from '../images/Icon Container.png';
import doctorpolygon from '../images/doctor polygon.png';
import doctorchart from '../images/doctor  chart.png';
import patienticon from '../images/patient icon.png';
import patientpolygon from '../images/patient Polygon.png';
import appointmenticon from '../images/Appointment icon.png';
import apppolygon from '../images/appointment polygon.png';
import revicon from '../images/rev icon.png';
import revpolygon from '../images/rev polygon.png';

function DashboardCountNumber() {
  return (
    <div className="dash-count">
      <Row gutter={[16, 16]}>
        <Col  xs={12}  sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={doctorpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={doctoricon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+95%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className='count-body-number'>
                <h3 className="count-item">Doctors</h3>
                <h2 className="count-number">247</h2>
              </div>
              <img src={doctorchart} height={'100%'} alt="polygone" />
            </div>
          </div>
        </Col>
        <Col  xs={12}  sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={apppolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={appointmenticon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+75%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className='count-body-number'>
                <h3 className="count-item">Appointments</h3>
                <h2 className="count-number">2497</h2>
              </div>
              <img src={doctorchart} height={'100%'} alt="polygone" />
            </div>
          </div>
        </Col>
        <Col   xs={12}  sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={revpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={revicon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+95%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className='count-body-number'>
                <h3 className="count-item">Revnew</h3>
                <h2 className="count-number">2447</h2>
              </div>
              <img src={doctorchart} height={'100%'} alt="polygone" />
            </div>
          </div>
        </Col>
        <Col  xs={12}  sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={patientpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={patienticon} alt="patients" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+95%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className='count-body-number'>
                <h3 className="count-item">Patients</h3>
                <h2 className="count-number">8247</h2>
              </div>
              <img src={doctorchart} height={'100%'} alt="polygone" />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardCountNumber;
