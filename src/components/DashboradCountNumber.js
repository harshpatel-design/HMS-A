import React, { useEffect } from 'react';
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
import { fetchDoctorsName } from '../slices/doctorSlice';
import { fetchAppointments } from '../slices/appointmentSlice';
import { fetchCharges } from '../slices/chargeSlice';
import { fetchPatientName } from '../slices/patientSlice';
import { useDispatch, useSelector } from 'react-redux';
import ApexChart from './MiniBarChart';

function DashboardCountNumber() {
  const dispatch = useDispatch();

  const { doctorNames, loading } = useSelector((state) => state.doctor);
  const { appointments } = useSelector((state) => state.appointment);
  const { charges } = useSelector((state) => state.charge);
  const { patientName } = useSelector((state) => state.patient);

  const patientCount = patientName?.count || 0;
  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6,
    0,
    0,
    0,
    0
  ).toISOString();

  const endDate = new Date().toISOString();

  useEffect(() => {
    dispatch(fetchDoctorsName());
    dispatch(fetchAppointments());
    dispatch(fetchPatientName());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCharges({
        page: 1,
        limit: 100,
        startDate,
        endDate,
      })
    );
  }, [dispatch]);

  const getLast7DaysPercentage = (data = [], field = null) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();

      d.setDate(d.getDate() - (6 - i));

      return d.toISOString().split('T')[0];
    });

    const last7DaysData = data.filter((item) => {
      if (!item?.createdAt) return false;

      const date = new Date(item.createdAt);

      if (isNaN(date.getTime())) return false;

      const createdDate = date.toISOString().split('T')[0];

      return last7Days.includes(createdDate);
    });

    const totalValue = field
      ? data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
      : data.length;

    const last7DaysValue = field
      ? last7DaysData.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
      : last7DaysData.length;

    const percentage = totalValue > 0 ? (last7DaysValue / totalValue) * 100 : 0;

    return {
      totalValue,
      last7DaysValue,
      percentage: percentage.toFixed(0),
    };
  };

  const getLast7DaysChartData = (data = [], field = null) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();

      d.setDate(d.getDate() - (6 - i));

      return d.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const filteredData = data.filter((item) => {
        if (!item?.createdAt) return false;

        const itemDate = new Date(item.createdAt);

        if (isNaN(itemDate.getTime())) return false;

        const createdDate = itemDate.toISOString().split('T')[0];

        return createdDate === date;
      });

      const originalValue = field
        ? filteredData.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
        : filteredData.length;

      return {
        value: originalValue === 0 ? 1 : originalValue,
        originalValue,
      };
    });
  };
  const doctorStats = getLast7DaysPercentage(doctorNames);
  const patientStats = getLast7DaysPercentage(patientName?.patients || []);
  const appointmentStats = getLast7DaysPercentage(appointments);
  const revenueStats = getLast7DaysPercentage(charges, 'finalAmount');

  const doctorChartData = getLast7DaysChartData(doctorNames);
  const patientChartData = getLast7DaysChartData(patientName?.patients || []);
  const appointmentChartData = getLast7DaysChartData(appointments);
  const revenueChartData = getLast7DaysChartData(charges, 'finalAmount');

  return (
    <div className="dash-count">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} xl={6}>
          <div className="count-card">
            <div className="counter-effect">
              <img src={doctorpolygon} alt="polygone" />
            </div>
            <div className="count-header">
              <img src={doctoricon} alt="Doctor" className="count-icon" />

              <div className="count-growth">
                <span className="growth-percent">+{doctorStats.percentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Doctors</h3>
                <h2 className="count-number">
                  {loading ? 'Loading...' : doctorNames?.length || 0}
                </h2>
              </div>
              <ApexChart data={doctorChartData} />
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
                <span className="growth-percent">+{appointmentStats.percentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Appointments</h3>
                <h2 className="count-number">
                  {loading ? 'Loading...' : appointments?.length || 0}
                </h2>
              </div>
              <ApexChart data={appointmentChartData} color="#06B6D4" />
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
                <span className="growth-percent">+{revenueStats.percentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Revenue</h3>
                <h2 className="count-number">
                  {loading
                    ? 'Loading...'
                    : charges
                        ?.reduce((sum, charge) => sum + charge.finalAmount, 0)
                        .toLocaleString() || 0}
                </h2>
              </div>
              <ApexChart data={revenueChartData} color="#059669" />
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
                <span className="growth-percent">+{patientStats.percentage}%</span>
                <span className="growth-days">In 7 days</span>
              </div>
            </div>

            <div className="count-body">
              <div className="count-body-number">
                <h3 className="count-item">Patients</h3>
                <h2 className="count-number">{loading ? 'Loading...' : patientCount || 0}</h2>
              </div>
              <ApexChart data={patientChartData} color="#EA580C" />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardCountNumber;
