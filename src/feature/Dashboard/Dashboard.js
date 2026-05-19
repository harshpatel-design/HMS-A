import React, { useEffect, useState } from 'react';
import DashboardCountNumber from '../../components/DashboradCountNumber';
import AppointsmentDashbordList from '../../components/AppointsmentDashbordList';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Modal, Row, Spin, Tag } from 'antd';
import { fetchDoctors } from '../../slices/doctorSlice';
import { useDispatch, useSelector } from 'react-redux';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors({ page: 1, limit: 100 }));
  }, [dispatch]);

  const { doctors, loading } = useSelector((state) => state.doctor);

  return (
    <>
      <div className="heder-dashboard">
        <h2 className="heading-title">Admin Dashboard</h2>
        <div className="header-btn">
          <button className="btn" onClick={() => navigate('/add-appointment')}>
            New Appointment
          </button>
          <button
            onClick={() => {
              setShowModel(true);
              console.log('Schedule Availability clicked');
            }}
          >
            Schedule Availability
          </button>
        </div>
      </div>
      <section>
        <DashboardCountNumber />
      </section>

      <section>
        <AppointsmentDashbordList />
      </section>

      <Modal
        open={showModel}
        className="SeduleModel"
        onCancel={() => setShowModel(false)}
        footer={null}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            {doctors ? (
              <>
                <Card title="Doctors List" className="doctor-list-card">
                  <Row className="doctor-list-wrapper">
                    {doctors.map((doctor) => (
                      <Col key={doctor.id} span={24}>
                        <Card size="small" className="doctor-card-2">
                          <div className="doctor-card-header">
                            <div className='doctor-card-header-details'>
                              <h3 className="doctor-name">{doctor.name}</h3>
                              <p className="doctor-specialization">{doctor.specialization}</p>
                            </div>

                            <Tag color="green">{doctor.status?.toUpperCase()}</Tag>
                          </div>

                          <Row gutter={[16, 16]} className="doctor-schedule-wrapper">
                            {doctor.schedule.map((schedule) => (
                              <Col key={schedule._id} md={12} xs={24}>
                                <Card size="small" className="schedule-card">
                                  <div className="schedule-header">
                                    <h3>{schedule.day}</h3>
                                  </div>

                                  <div className="session-wrapper">
                                    {schedule.sessions.map((session) => (
                                      <div key={session._id} className="session-card">
                                        <p className="session-name">{session.sessionName}</p>

                                        <div className="session-time">
                                          {session.from}
                                          <span>to</span>
                                          {session.to}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </>
            ) : (
              <div>No doctors found</div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

export default Dashboard;
