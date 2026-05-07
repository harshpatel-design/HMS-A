import { Avatar, Card, Col, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import '../hcss.css';
import StackedBarChart from './StackedBarChart';

import { UserOutlined } from '@ant-design/icons';
import AppointmentsWidget from './AppointmentsWidget';
import { fetchAppointments } from '../../src/slices/appointmentSlice';
import { useDispatch, useSelector } from 'react-redux';

const { Option } = Select;
function AppointsmentDashbordList() {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('7days');

  const {
    appointments,
    total: apponitmenLength,
    loading,
  } = useSelector((state) => state.appointment);

  console.log('appointments', appointments);

  const cancelledApp = appointments.filter((e) => {
    return e.status === 'cancelled';
  });
  const scheduledApp = appointments.filter((e) => {
    return e.status === 'scheduled';
  });
  const completedApp = appointments.filter((e) => {
    return e.status === 'completed';
  });

  const FILTER_OPTIONS = [
    { label: 'Last 7 Days', value: '7days' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];
  const doctors = [
    {
      name: 'Dr. Mick Thompson',
      specialty: 'Cardiologist',
      bookings: 258,
      image: '',
    },
    {
      name: 'Dr. Emily Carter',
      specialty: 'Pediatrician',
      bookings: 125,
      image: '',
    },
    {
      name: 'Dr. David Lee',
      specialty: 'Gynecologist',
      bookings: 115,
      image: null,
    },
  ];
  const getDateRange = (filterType) => {
    const now = new Date();

    let startDate;

    let endDate = new Date();

    // full current day include
    endDate.setHours(23, 59, 59, 999);

    switch (filterType) {
      case '7days':
        startDate = new Date();

        startDate.setDate(now.getDate() - 6);

        // start of day
        startDate.setHours(0, 0, 0, 0);

        break;

      case 'week':
        startDate = new Date();

        const day = now.getDay();

        const diff = day === 0 ? 6 : day - 1;

        startDate.setDate(now.getDate() - diff);

        startDate.setHours(0, 0, 0, 0);

        break;

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        startDate.setHours(0, 0, 0, 0);

        break;

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);

        startDate.setHours(0, 0, 0, 0);

        break;

      default:
        startDate = new Date();

        startDate.setDate(now.getDate() - 6);

        startDate.setHours(0, 0, 0, 0);
    }

    return {
      startDate: startDate.toISOString(),

      endDate: endDate.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange(filter);

  useEffect(() => {
    dispatch(
      fetchAppointments({
        page: 1,
        limit: 10,
        startDate,
        endDate,
      })
    );
  }, [dispatch, filter]);

  return (
    <>
      <div className="appointment-dashboard">
        <Row gutter={[24, 24]}>
          <Col sm={24} md={15} style={{ background: '#fff' }}>
            <Row style={{ padding: '8px 0px' }}>
              <Col span={24}>
                <div className="app-heading">
                  <h1 className="dashbord-heading">Appointment Statistic</h1>
                  <Select value={filter} onChange={setFilter}>
                    {FILTER_OPTIONS.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <Row gutter={[16, 24]} style={{ marginTop: 12 }}>
                  <Col xs={12} md={6}>
                    <div className="dash-card">
                      <span className="dash-title">All Appointments</span>
                      <h2 className="dash-count">{loading ? '...' : apponitmenLength}</h2>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="dash-card">
                      <span className="dash-title">Canclled</span>
                      <h2 className="dash-count">{loading ? '...' : cancelledApp?.length}</h2>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="dash-card">
                      <span className="dash-title">Schedule</span>
                      <h2 className="dash-count">{loading ? '...' : scheduledApp?.length}</h2>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="dash-card">
                      <span className="dash-title">Complated</span>
                      <h2 className="dash-count">{loading ? '...' : completedApp?.length}</h2>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                  <Col span={24}>
                    <Card title="Product Statistics">
                      <StackedBarChart appointments={appointments} />
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Row gutter={[16, 10]}>
                  <Col span={24}>
                    <Row gutter={16} className="doctor-grid-dashbord">
                      {doctors.map((doc, index) => (
                        <Col xs={24} sm={12} md={12} lg={8} key={index}>
                          <Card className="doctor-card">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              {doc.image ? (
                                <img
                                  src={doc.image}
                                  alt={doc.name}
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <Avatar size={48} icon={<UserOutlined />} />
                              )}
                              <div>
                                <div style={{ fontWeight: 600 }}>{doc.name}</div>
                                <div style={{ fontSize: 12, color: '#888' }}>{doc.specialty}</div>
                                <div style={{ marginTop: 4, fontSize: 12 }}>
                                  <b>{doc.bookings}</b> Bookings
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          <Col sm={24} md={9}>
            <div className="full-height">
              <AppointmentsWidget />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default AppointsmentDashbordList;
