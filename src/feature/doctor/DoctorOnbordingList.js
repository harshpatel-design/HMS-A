import { Card, Row, Col, Button, Tag, Dropdown, Spin, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, MoreOutlined, FundViewOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, deleteDoctor } from '../../slices/doctorSlice';
import '../../index.css';
import Search from 'antd/es/transfer/search';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

export default function DoctorOnbordingList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { doctors = [], loading, total, page, limit } = useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchDoctors({ page: 1, limit: 12 }));
  }, [dispatch]);

  const handleDelete = async (userId) => {
    const res = await dispatch(deleteDoctor(userId));

    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(fetchDoctors({ page: 1, limit: 12 }));
    }
  };

  return (
    <div className="doctor-container">
      <div className="doctor-header">
        <h2 className="title">Doctor Onboarding</h2>
        <div className="doctor-actions">
          <Search placeholder="Search Doctors" style={{ width: 200 }} />
          <Button
            type="primary"
            className="btn"
            icon={<PlusOutlined />}
            onClick={() => navigate('/add-edit-doctor')}
          >
            Add Doctor
          </Button>
        </div>
      </div>

      <div className="total-box">
        <Tag color="processing">Total Doctors: {total}</Tag>
      </div>
      {loading ? (
        <div className="loader-box">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16,16]}>
          {doctors.map((doc) => {
            console.log(doc);

            let imageUrl = doc?.image
              ? `${process.env.REACT_APP_API_URL}/uploads/users/${
                  doc.image.includes('.') ? doc.image : `${doc.image}.png`
                }`
              : `https://ui-avatars.com/api/?name=${doc.name}&background=random&color=fff`;

            return (
              <Col xs={24} lg={8} key={doc.doctorid}>
                <Card className="doctor-card">
                  <Row gutter={12} className="doctor-flex-wrapper">
                    <Col span={6} style={{border:"1px solid red"}}>
                      <div className="doctor-left" style={{border:"1px solid red"}}>
                        <img
                          src={imageUrl}
                          className="doctor-img"
                          alt={doc.name}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${doc.name}&background=random&size=256`;
                          }}
                        />
                      </div>
                    </Col>

                    <Col span={16}>
                      <div className="doctor-right">
                        <div className="header-row">
                          <div>
                            <h3>{doc.name}</h3>

                            <p
                              style={{
                                fontSize: 12,
                                color: '#7c7c7c',
                                marginBottom: 4,
                                marginTop: -4,
                              }}
                            >
                              {doc.specialization}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              <p className="header-p">{doc.phone}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: 'edit',
                                    label: 'Edit',
                                    icon: <EditOutlined />,
                                    onClick: () => navigate(`/add-edit-doctor/${doc.doctorid}`),
                                  },
                                  {
                                    key: 'view',
                                    label: 'View',
                                    icon: <FundViewOutlined />,
                                    onClick: () => navigate(`/view-doctor/${doc.doctorid}`),
                                  },
                                  {
                                    key: 'delete',
                                    label: <span style={{ color: 'red' }}>Delete</span>,
                                    icon: <DeleteOutlined style={{ color: 'red' }} />,
                                    onClick: () => handleDelete(doc.doctorid),
                                  },
                                ],
                              }}
                            >
                              <MoreOutlined className="menu-icon" />
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row className="schedule-wrapper" gutter={[8,8]}>
                    {doc.schedule?.map((s) => (
                      <Col span={8} key={s._id} className="schedule-day">
                        <div className="day-title">{s.day}</div>

                        <div className="session-list">
                          {s.sessions?.map((sess) => (
                            <div className="session-chip" key={sess._id}>
                              <span className="session-name">{sess.sessionName}</span>
                              <p className="session-time">
                                {sess.from} – {sess.to}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <div className="pagination-fixed">
        <Pagination
          current={page}
          total={total}
          pageSize={limit || 12}
          onChange={(p) => dispatch(fetchDoctors({ page: p, limit: 12 }))}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}
