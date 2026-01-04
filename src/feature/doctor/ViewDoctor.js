import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchDoctorById } from '../../slices/doctorSlice';
import { Button, Card, Col, Divider, Row, Spin, Tag } from 'antd';
import Breadcrumbs from '../comman/Breadcrumbs';
import '../../hcss.css';
import { PhoneOutlined } from '@ant-design/icons';
import e1 from "../../images/Vector 7.png"
import e2 from "../../images/Vector 8.png"
import Availability from '../../components/Availability';

function ViewDoctor() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedDoctor, loading } = useSelector((state) => state.doctor);

  useEffect(() => {

    if (id) dispatch(fetchDoctorById(id));
  }, [id, dispatch]);

  if (loading || !selectedDoctor) {
    return <Spin fullscreen size="large" tip="Loading..." />;
  }

  const doctor = selectedDoctor.doctor.user;
  const imageUrl = doctor.image
    ? `${process.env.REACT_APP_API_URL}${doctor.image}`
    : `https://ui-avatars.com/api/?name=${doctor.name}&background=random&color=fff`;

    console.log('====================================');
    console.log("doctor",selectedDoctor);
    console.log('====================================');

  return (
    <>
      <Breadcrumbs
        title="View Doctor"
        showBack
        backTo="/doctor-onbording"
        items={[{ label: 'Doctors', href: '/doctor-onbording' }, { label: 'View Doctor' }]}
      />

      <div className="profile-card">
        <Row gutter={16}>
          <Col md={3} xs={8}>
            <img
              src={imageUrl}
              alt={doctor.name}
              className="profile-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${doctor.name}&background=random&size=256`;
              }}
            />
          </Col>

          <Col md={15} xs={16}>
            <div className="flex-column-between">
              <div className="profile-details">
                <div className="doctor-profile-effect-1">
                  <img src={e1} alt="e1" />
                </div>
                <div className="doctor-profile-effect-2">
                  <img src={e2} alt="e1" />
                </div>
                <h3 className="profile-name">
                  <span className="profile-name-heading">{doctor.name}</span>
                  <span className="profile-speciality">
                    {' '}
                    • {selectedDoctor.doctor.profile.specialization.name}
                  </span>
                </h3>

                <div className="profile-education">
                  {selectedDoctor?.doctor?.profile?.education?.length > 0 ? (
                    selectedDoctor.doctor.profile.education.map((data) => (
                      <div key={data._id} className="education-item">
                        <p className="education-degree">{data.degree}</p>
                        <p className="education-institute">
                          {data.institute} {''} {data.year}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No education details available</p>
                  )}
                </div>

                <div className="profile-location">
                  <PhoneOutlined /> {doctor.phone}
                </div>
              </div>

              <div>
                {
                  <span className="profile-availability">
                    • {selectedDoctor?.doctor?.profile?.status}
                  </span>
                }
              </div>
            </div>
          </Col>
          <Col span={6} xs={0} xm={0} className="profile-action ">
            <div className="flex-column-between">
              <p className="education-degree"> {selectedDoctor.doctor.user.email}</p>
              <div className="flex-end">
                <Button type="primary" className="btn">
                  Book Appointment
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>


      <div style={{ marginTop: 12 }}>
        <Row gutter={[16, 16]}>
          <Col xm={16} xs={24}>
            <Card title="Availability" className="Availability-doc-card">
              <Row gutter={[16, 16]}>
                {selectedDoctor?.doctor?.profile?.schedule?.map((day) => (
                  <Col key={day._id} xs={12} sm={12} md={8} lg={4}>
                    <div className="availability-day">
                      <div className="day-title">{day.day}</div>

                      <div className="slot-list">
                        {day.sessions.map((slot) => (
                          <Tag key={slot._id} className="time-slot">
                            {slot.from} - {slot.to}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card title="Short Bio" className="Availability-doc-card">
              <Row gutter={[16, 16]}>
                <Col>
                  <p className="doc-bio">{selectedDoctor?.doctor?.profile.bio}</p>
                </Col>
              </Row>
            </Card>
            <Card title="Eduction Information" className="Availability-doc-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  {selectedDoctor?.doctor?.profile?.education?.map((educ) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: '600px', fontSize: 16 }}>*</span>
                      <div key={educ._id}>
                        <h4 className="doc-edu-heading">{educ.degree}</h4>
                        <p className="doc-edu-details">{educ.institute}</p>
                        <p className="doc-edu-details">{educ.year}</p>
                      </div>
                    </div>
                  ))}
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} xm={8}>
            {/* <Row gutter={[10, 10]}>
             {selectedDoctor.doctor.user.map((data) => {
                 <Col span={24}>
                  {data.name}
                 </Col>
             })}
            </Row> */}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ViewDoctor;
