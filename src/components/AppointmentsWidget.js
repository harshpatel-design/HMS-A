import React, { useState, useEffect } from 'react';
import { Card, Calendar, Select, List, Spin } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '../hcss.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientVisits } from '../slices/patientVisitSlice';
import { Link } from 'react-router-dom';


const AppointmentsWidget = () => {
  const dispatch = useDispatch();

  const [value, setValue] = useState(dayjs());
  const [caseType, setCaseType] = useState('');

  const { visits, loading } = useSelector((state) => state.patientVisit);

  useEffect(() => {
    const params = {
      page: 1,
      limit: 10,
      caseType,
    };

    if (value) {
      params.startDate = dayjs(value).format('YYYY-MM-DD');
      params.endDate = dayjs(value).format('YYYY-MM-DD');
    }

    dispatch(fetchPatientVisits(params));
  }, [dispatch, caseType, value]);

  return (
    <div className="app-widgest full-height">
      <Card
        title="Patient Visits"
        className="full-height dashbordVisitCard"
        extra={
          <Select size="small" defaultValue="" onChange={(value) => setCaseType(value)}>
            <Select.Option value="">All Type</Select.Option>
            <Select.Option value="opd">OPD</Select.Option>
            <Select.Option value="ipd">IPD</Select.Option>
          </Select>
        }
        styles={{
          body: {
            padding: '10px',
          },
        }}
      >
        <Calendar
          fullscreen={false}
          value={value}
          className="dashCal"
          onSelect={(val) => setValue(val)}
          headerRender={({ value, onChange }) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
                alignItems: 'center',
              }}
            >
              <LeftOutlined onClick={() => onChange(value.clone().subtract(1, 'month'))} />

              <strong>{value.format('MMMM YYYY')}</strong>

              <RightOutlined onClick={() => onChange(value.clone().add(1, 'month'))} />
            </div>
          )}
        />

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              width: '100%',
            }}
          >
            <Spin size="small" />
          </div>
        ) : (
          <List
            style={{ marginTop: 12, borderRadius: '10px', padding: '10px 0px' }}
            dataSource={visits?.slice(0, 5) || []}
            className="dashBordWCon"
            renderItem={(item) => (
              <List.Item
                classNames="abcd2"
                style={{
                  borderRadius: '10px',
                  marginBottom: 8,
                  padding: '10px 12px',
                }}
                className="dashappLi"
              >
                <List.Item.Meta
                  title={
                    <strong>
                      {item?.caseType === 'opd'
                        ? 'General OPD'
                        : item?.caseType === 'ipd'
                          ? 'IPD Visit'
                          : item?.caseType}
                    </strong>
                  }
                  description={
                    <>
                      <CalendarOutlined />{' '}
                      {item?.visitDate ? dayjs(item.visitDate).format('DD-MMM-YYYY') : 'No date'}
                    </>
                  }
                />

                <div>{item?.doctor?.specialization?.name || 'N/A'}</div>
              </List.Item>
            )}
          />
        )}
        <div
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          <Link to="/patient-visit">View All Visits</Link>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentsWidget;
