import React, { useEffect } from 'react';
import { Row, Col, Spin, Space, DatePicker } from 'antd';
import doctoricon from '../images/Icon Container.png';
import doctorpolygon from '../images/doctor polygon.png';
import patienticon from '../images/patient icon.png';
import patientpolygon from '../images/patient Polygon.png';
import appointmenticon from '../images/Appointment icon.png';
import apppolygon from '../images/appointment polygon.png';
import revicon from '../images/rev icon.png';
import revpolygon from '../images/rev polygon.png';
import { useDispatch, useSelector } from 'react-redux';
import ApexChart from './MiniBarChart';
import { getDashBoardCount } from '../slices/countSlice';

function DashboardCountNumber() {
  const dispatch = useDispatch();
  const { RangePicker } = DatePicker;
  
  
  const { counts, loading } = useSelector((state) => state.count);

  const patientCount = counts?.counts?.patientCount || 0;
  const doctorCount = counts?.counts?.doctorCount || 0;
  const appointmentCount = counts?.counts?.appointments?.total || 0;
  const totalRevenue = counts?.counts?.totalRevenue || 0;

  const doctorChartData = counts?.counts?.charts?.doctors || [];
  const patientChartData = counts?.counts?.charts?.patients || [];
  const appointmentChartData = counts?.counts?.charts?.appointments || [];

  const revenueChartData = counts?.counts?.charts?.revenue || [];

  const getLast7DaysPercentage = (chartData = []) => {
    if (!chartData.length) {
      return 0;
    }
    const total = chartData.reduce((sum, item) => sum + Number(item?.count || item?.total || 0), 0);
    const lastValue = Number(
      chartData[chartData.length - 1]?.count || chartData[chartData.length - 1]?.total || 0
    );
    if (total === 0) return 0;
    return Math.round((lastValue / total) * 100);
  };

  const doctorPercentage = getLast7DaysPercentage(doctorChartData);
  const patientPercentage = getLast7DaysPercentage(patientChartData);
  const appointmentPercentage = getLast7DaysPercentage(appointmentChartData);
  const revenuePercentage = getLast7DaysPercentage(revenueChartData);

  useEffect(() => {
    dispatch(getDashBoardCount());
  }, [dispatch]);

  return (
    <div className="dash-count">
      <Row gutter={[16, 16]}>
        <Col span={24} className='dashboard-ant-picker'>
          <div className="serachbar-bread">
            <Space style={{ flexWrap: 'wrap' ,width: '100%'}}>
              <RangePicker
                format="DD/MM/YYYY"
                onChange={(dates) => {
                  dispatch(getDashBoardCount({ startDate: dates?.[0], endDate: dates?.[1] }));
                }}
              />
            </Space>
          </div>
        </Col>
        <Col xs={12} sm={12} xl={6} style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="count-card">
            <div className="counter-effect" style={{ borderRadius: '16px' }}>
              <img src={doctorpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={doctoricon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+{doctorPercentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Doctors</h3>
                <h2 className="count-number">
                  {loading ? <Spin style={{ marginLeft: '10px' }} size="small" /> : doctorCount}
                </h2>
              </div>
              <ApexChart data={doctorChartData} label="Doctor" />
            </div>
          </div>
        </Col>

        <Col xs={12} sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={apppolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={appointmenticon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+{appointmentPercentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Appointments</h3>
                <h2 className="count-number">
                  {loading ? (
                    <Spin style={{ marginLeft: '10px' }} size="small" />
                  ) : appointmentCount ? (
                    appointmentCount
                  ) : (
                    0
                  )}
                </h2>
              </div>
              <ApexChart data={appointmentChartData} color="#06B6D4" label="Appointments" />
            </div>
          </div>
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={revpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={revicon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+{revenuePercentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Revenue</h3>
                <h2 className="count-number">
                  {loading ? (
                    <Spin style={{ marginLeft: '10px' }} size="small" />
                  ) : totalRevenue ? (
                    totalRevenue
                  ) : (
                    0
                  )}
                </h2>
              </div>
              <ApexChart data={revenueChartData} color="#059669" label="Revenue" />
            </div>
          </div>
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={patientpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={patienticon} alt="patients" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+{patientPercentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Patients</h3>
                <h2 className="count-number">
                  {loading ? (
                    <Spin style={{ marginLeft: '10px' }} size="small" />
                  ) : patientCount ? (
                    patientCount
                  ) : (
                    0
                  )}
                </h2>
              </div>
              <ApexChart data={patientChartData} color="#EA580C" label="Patients" />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardCountNumber;
