import React, { useEffect, useState } from 'react';
import DashboardCountNumber from '../../components/DashboradCountNumber';
import AppointsmentDashbordList from '../../components/AppointsmentDashbordList';
import { useNavigate } from 'react-router-dom';
import { Card, Modal, Spin, Tag } from 'antd';
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
  console.log('doc', doctors);

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
                  <div className="doctor-list-wrapper">
                    {doctors.map((doctor) => (
                      <Card key={doctor.id} size="small" className="doctor-card-2">
                        <div className="doctor-card-header">
                          <div>
                            <h3 className="doctor-name">{doctor.name}</h3>

                            <p className="doctor-specialization">{doctor.specialization}</p>
                          </div>

                          <Tag color="green">{doctor.status?.toUpperCase()}</Tag>
                        </div>

                        <div className="doctor-schedule-wrapper">
                          {doctor.schedule.map((schedule) => (
                            <Card key={schedule._id} size="small" className="schedule-card">
                              <div className="schedule-header">
                                <h3>{schedule.day}</h3>
                              </div>

                              <div className="session-wrapper">
                                {schedule.sessions.map((session) => (
                                  <div key={session._id} className="session-card">
                                    <p className="session-name">{session.sessionName}</p>

                                    <div className="session-time">
                                      <Tag color="purple">{session.from}</Tag>

                                      <span>to</span>

                                      <Tag color="cyan">{session.to}</Tag>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
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
