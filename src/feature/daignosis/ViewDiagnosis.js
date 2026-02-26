import React, { useEffect } from 'react';
import { Collapse, Tag, Row, Col, Spin, Empty, Button, Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { getAllDiagnosis } from '../../slices/diagnosisSlice';
import Breadcrumbs from '../comman/Breadcrumbs';
import { Header } from 'antd/es/layout/layout';

export default function ViewDiagnosis() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, list } = useSelector((state) => state.diagnosis);

  useEffect(() => {
    if (patientId) {
      dispatch(getAllDiagnosis({ patient: patientId }));
    }
  }, [patientId, dispatch]);

  if (loading) {
    return <Spin spinning style={{ marginTop: '100px', marginLeft: '49%' }} />;
  }

  if (!loading && !list) {
    return null;
  }

  if (!loading && list.length === 0) {
    return <Empty description="No diagnosis found" />;
  }

  const items = list.map((d) => ({
    key: d._id,
    label: (
      <div className="panel-header">
        <span className="panel-date">{dayjs(d.visitDate).format('DD MMM YYYY')}</span>
        <Tag color={d.status === 'completed' ? 'green' : 'orange'} className="panel-status">
          {d.status}
        </Tag>
      </div>
    ),
    children: (
      <Card className="diagnosis-detail-card" bordered={false}>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={8}>
            <div className="info-item">
              <span className="label">Doctor</span>
              <span className="value">{d.doctor?.user?.name}</span>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="info-item">
              <span className="label">Case Type</span>
              <span className="value">{d.caseType}</span>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="info-item">
              <span className="label">Follow-up</span>
              <span className="value">
                {d.followUpDate ? dayjs(d.followUpDate).format('DD MMM YYYY') : '-'}
              </span>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="info-block">
              <span className="label">Chief Complaint</span>
              <p className="text">{d.chiefComplaint || '-'}</p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="info-block">
              <span className="label">Clinical Notes</span>
              <p className="text">{d.clinicalNotes || '-'}</p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="info-block">
              <span className="label">Advice</span>
              <p className="text">{d.advice || '-'}</p>
            </div>
          </Col>
        </Row>
      </Card>
    ),
  }));

  console.log('list', list);

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Diagnosis History"
        showBack
        backTo="/diagnosis"
        items={[{ label: 'Diagnosis List', href: '/diagnosis' }, { label: 'Patient History' }]}
      />

      <div className="view-diagnosis-page">
        <h3>
          {list?.[0]?.patient?.firstName && list?.[0]?.patient?.lastName
            ? `${list[0].patient.firstName} ${list[0].patient.lastName}`
            : 'Patient'}{' '}
          {list?.length || 0} Diagnosis Records
        </h3>
        <Collapse
          accordion
          defaultActiveKey={[list[0]._id]}
          items={items}
          className="diagnosis-collapse"
        />

        <div
          className="page-actions"
          style={{ display: 'flex', justifyContent: 'end', margin: '10px 0' }}
        >
          <Button onClick={() => navigate('/diagnosis')} className="btn">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
