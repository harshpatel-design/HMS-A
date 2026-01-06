import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  InputNumber,
  Upload,
  message,
  Spin,
  Select,
  Collapse,
  TimePicker,
  DatePicker,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchDoctorById, updateDoctor, createDoctor } from '../../slices/doctorSlice';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../comman/Breadcrumbs';
import doctorService from '../../services/doctorService';

export default function AddEditDoctor() {
  const { Panel } = Collapse;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [oldImage, setOldImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [specLoading, setSpecLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [degrees, setDegrees] = useState([]);
  const [degreeLoading, setDegreeLoading] = useState(false);
  const [sessions, setSessions] = useState([0]);
  const appointmentDay = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];
  const [selectedDays, setSelectedDays] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [daySessions, setDaySessions] = useState({});

  const buildImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads/users/')) {
      return `${process.env.REACT_APP_API_URL}${img}`;
    }
    return `${process.env.REACT_APP_API_URL}/uploads/users/${img}`;
  };

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    Promise.all([
      doctorService.getSpecializations(),
      doctorService.getDepartments(),
      dispatch(fetchDoctorById(id)).unwrap(),
    ])
      .then(([specRes, deptRes, doctorRes]) => {
        setSpecializations(specRes.specializations || []);
        setDepartments(deptRes.departments || []);
        const doctor = doctorRes?.doctor;
        if (!doctor) return;

        const profile = doctor.profile || {};
        form.setFieldsValue({
          name: doctor.user?.name,
          email: doctor.user?.email,
          phone: doctor.user?.phone,
          age: doctor.user?.age,
          gender: doctor.user?.gender,

          bio: profile.bio,
          specialization: profile.specialization,
          department: profile.department,
          experience: profile.experience,

          appointmentType: profile.appointmentType,
          advanceBookingDays: profile.advanceBookingDays,
          slotDuration: profile.slotDuration,
          maxBookingsPerSlot: profile.maxBookingsPerSlot,

          address: profile.address,

          education: profile.education?.length
            ? profile.education
            : [{ degree: '', institute: '', year: '' }],

          awards: Array.isArray(profile.awards)
            ? profile.awards.map((a) => ({
                ...a,
                date: a.date ? dayjs(a.date) : null,
              }))
            : [],
        });
        if (doctor.user?.image) {
          setPreview(buildImageUrl(doctor.user.image));
          setOldImage(doctor.user.image);
        }
        if (profile.schedule?.length) {
          const days = profile.schedule.map((d) => d.day);
          setSelectedDays(days);

          const ds = {};
          const formSessions = {};

          profile.schedule.forEach((dayObj) => {
            ds[dayObj.day] = dayObj.sessions.map((_, i) => i);

            dayObj.sessions.forEach((s, i) => {
              formSessions[`${dayObj.day}_${i}`] = {
                session: s.sessionName,
                from: dayjs(s.from, 'HH:mm'),
                to: dayjs(s.to, 'HH:mm'),
              };
            });
          });

          setDaySessions(ds);
          form.setFieldsValue({ sessions: formSessions });
        }
      })
      .catch(() => message.error('Failed to load doctor'))
      .finally(() => setLoading(false));
  }, [id, isEdit, dispatch, form]);

  const fetchSpecializations = () => {
    setSpecLoading(true);

    doctorService
      .getSpecializations()
      .then((res) => {
        setSpecializations(res.specializations || []);
      })
      .finally(() => setSpecLoading(false));
  };

  const fetchDepartments = () => {
    setDeptLoading(true);
    doctorService
      .getDepartments()
      .then((res) => {
        setDepartments(res.departments || []);
      })
      .finally(() => setDeptLoading(false));
  };

  const fetchDegreesList = async () => {
    try {
      setDegreeLoading(true);
      const res = await doctorService.getDegrees({ page: 1, limit: 200 });
      setDegrees(res.degrees || []);
    } catch (error) {
      setDegrees([]);
    } finally {
      setDegreeLoading(false);
    }
  };

  const handleImageChange = (info) => {
    const file = info.file;

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return message.error('Only image files allowed');
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };
  const onFinish = async (values) => {
    console.log('value', values);

    try {
      setLoading(true);
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const education = Array.isArray(values.education)
        ? values.education.map((edu) => ({
            ...edu,
            year: Number(edu.year),
          }))
        : [];

      const awards = Array.isArray(values.awards)
        ? values.awards.map((a) => ({
            name: a.name,
            date: a.date ? a.date.toISOString() : null,
          }))
        : [];

      const address = values.address || {};
      const appointmentSettings = {
        appointmentType: values.appointmentType,
        advanceBookingDays: Number(values.advanceBookingDays),
        slotDuration: Number(values.slotDuration),
        maxBookingsPerSlot: Number(values.maxBookingsPerSlot),
      };
      const schedule = selectedDays.map((day) => ({
        day,
        sessions: (daySessions[day] || [0])
          .map((_, index) => {
            const key = `${day}_${index}`;
            const s = values?.sessions?.[key];
            if (!s?.session || !s?.from || !s?.to) return null;

            return {
              sessionName: s.session.toUpperCase(),
              from: s.from.format('HH:mm'),
              to: s.to.format('HH:mm'),
            };
          })
          .filter(Boolean),
      }));

      [
        'name',
        'email',
        'phone',
        'age',
        'gender',
        'bio',
        'specialization',
        'department',
        'experience',
      ].forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      formData.append('education', JSON.stringify(education));
      formData.append('awards', JSON.stringify(awards));
      formData.append('address', JSON.stringify(address));
      formData.append('appointmentSettings', JSON.stringify(appointmentSettings));
      formData.append('schedule', JSON.stringify(schedule));

      const result = isEdit
        ? await dispatch(updateDoctor({ id, data: formData })).unwrap()
        : await dispatch(createDoctor(formData)).unwrap();

      console.log(result);
      message.success(isEdit ? 'Doctor updated successfully!' : 'Doctor created successfully!');
      navigate('/doctor-onbording');
    } catch (error) {
      message.error(error?.message || 'Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

    setDaySessions((prev) => {
      if (selectedDays.includes(day)) {
        const copy = { ...prev };
        delete copy[day];
        return copy;
      }
      return prev;
    });
  };

  const allPanelKeys = ['basic', 'address', 'appointment', 'professional', 'education'];

  return (
    <>
      <div className="page-wrapper">
        {loading && <Spin fullscreen size="large" tip="Loading..." />}
        <Breadcrumbs
          title={isEdit ? 'Edit Docotr' : 'Add New Doctor'}
          showBack={true}
          backTo="/doctor-onbording"
          items={[
            { label: 'Doctors', href: '/doctor-onbording' },
            { label: isEdit ? 'Edit Doctor' : 'Add New Doctor' },
          ]}
        />

        <div
          className="doctor-form-wrapper patient-wrapper form-wrapper"
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Collapse
              {...(isEdit ? { activeKey: allPanelKeys } : { defaultActiveKey: ['basic'] })}
              accordion={false}
            >
              <Panel header="Basic Information" key="basic">
                <Row gutter={[16, 10]}>
                  <Col xs={24} sm={24} md={24}>
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      accept="image/*"
                      onChange={handleImageChange}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="doctor"
                          style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        />
                      ) : (
                        <div>
                          <PlusOutlined style={{ fontSize: 24 }} />
                          <div>Upload Doctor Photo</div>
                        </div>
                      )}
                    </Upload>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Doctor Name"
                      name="name"
                      rules={[{ required: true, message: 'Doctor name is required' }]}
                    >
                      <Input disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ type: 'email', message: 'Enter a valid email' }]}
                    >
                      <Input disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[
                        { required: true, message: 'Phone number is required' },
                        { len: 10, message: 'Phone must be 10 digits' },
                      ]}
                    >
                      <Input maxLength={10} disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Age"
                      name="age"
                      rules={[
                        { required: true, message: 'Age is required' },
                        {
                          type: 'number',
                          min: 1,
                          max: 120,

                          message: 'Age must be between 1 and 120',
                        },
                      ]}
                    >
                      <InputNumber
                        disabled={loading}
                        min={0}
                        max={120}
                        placeholder="Enter age"
                        precision={0}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Gender"
                      name="gender"
                      rules={[{ required: true, message: 'Gender is required' }]}
                    >
                      <Select placeholder="Select Gender" disabled={loading}>
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                        <Select.Option value="other">Other</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item label="Bio" name="bio">
                      <Input maxLength={10} disabled={loading} />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Address" key="address">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Line 1"
                      name={['address', 'line1']}
                      required
                      rules={[{ required: true, message: 'Enter line 1 address' }]}
                    >
                      <Input placeholder="Line 1" disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item label="Line 2" name={['address', 'line2']}>
                      <Input placeholder="Line 2" disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Country"
                      name={['address', 'country']}
                      required
                      rules={[{ required: true, message: 'Country is required' }]}
                    >
                      <Input placeholder="Country" disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="State"
                      name={['address', 'state']}
                      required
                      rules={[{ required: true, message: 'State is required' }]}
                    >
                      <Input placeholder="State" disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="City"
                      name={['address', 'city']}
                      required
                      rules={[{ required: true, message: 'City is required' }]}
                    >
                      <Input placeholder="City" disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Pincode"
                      name={['address', 'pincode']}
                      max={6}
                      required
                      rules={[
                        { required: true, message: 'Enter valid 6 digit Indian pincode' },
                        {
                          pattern: /^[1-9][0-9]{5}$/,
                          message: 'Enter valid 6 digit Indian pincode',
                        },
                      ]}
                    >
                      <Input placeholder="Pincode" maxLength={6} disabled={loading} />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Appointment Schedule" key="appointment">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Appointment Type"
                      name="appointmentType"
                      initialValue="IN_PERSON"
                    >
                      <Select>
                        <Select.Option value="IN_PERSON">In Person</Select.Option>
                        <Select.Option value="ONLINE">Online</Select.Option>
                        <Select.Option value="BOTH">Both</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item label="Advance Booking" name="advanceBookingDays" initialValue={7}>
                      <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 7" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Slot Duration (Minutes)"
                      name="slotDuration"
                      initialValue={15}
                    >
                      <InputNumber
                        min={5}
                        step={5}
                        style={{ width: '100%' }}
                        placeholder="e.g. 15"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      label="Max Bookings Per Slot"
                      name="maxBookingsPerSlot"
                      initialValue={1}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 1" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
                    <Col span={24}>
                      {appointmentDay.map((day) => (
                        <Button
                          key={day}
                          type={selectedDays.includes(day) ? 'primary' : 'default'}
                          size="small"
                          style={{ marginRight: 8, marginBottom: 8 }}
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                        </Button>
                      ))}
                    </Col>
                  </Row>

                  {selectedDays.map((day) =>
                    (daySessions[day] || [0]).map((_, index) => (
                      <Row
                        gutter={[12, 12]}
                        align="middle"
                        key={`${day}_${index}`}
                        style={{ marginBottom: 8 }}
                      >
                        <Col span={4}>
                          <strong>{day}</strong>
                        </Col>

                        <Form.Item name={['sessions', `${day}_${index}`, 'session']} noStyle>
                          <Select placeholder="Session" style={{ width: '100%' }}>
                            <Select.Option value="MORNING">Morning</Select.Option>
                            <Select.Option value="AFTERNOON">Afternoon</Select.Option>
                            <Select.Option value="EVENING">Evening</Select.Option>
                          </Select>
                        </Form.Item>

                        <div className="sess-details">
                          <Form.Item name={['sessions', `${day}_${index}`, 'from']} noStyle>
                            <TimePicker format="hh:mm A" />
                          </Form.Item>

                          <Form.Item name={['sessions', `${day}_${index}`, 'to']} noStyle>
                            <TimePicker format="hh:mm A" />
                          </Form.Item>
                        </div>
                      </Row>
                    ))
                  )}
                </Form.Item>
              </Panel>

              <Panel header="Professional Info" key={'professional'}>
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name="specialization"
                      label="Specialization"
                      rules={[{ required: true, message: 'Specialization is required' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Specialization"
                        loading={specLoading}
                        disabled={loading}
                        allowClear
                        onClick={() => {
                          if (specializations.length === 0) fetchSpecializations();
                        }}
                      >
                        {specializations.map((item) => (
                          <Select.Option key={item._id} value={item._id} label={item.name}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name="department"
                      label="Department"
                      rules={[{ required: true, message: 'Department is required' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Department"
                        loading={deptLoading}
                        disabled={loading}
                        allowClear
                        onClick={() => {
                          if (departments.length === 0) fetchDepartments();
                        }}
                      >
                        {departments.map((item) => (
                          <Select.Option key={item._id} value={item._id} label={item.name}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="experience"
                      label="Experience"
                      rules={[
                        { required: true, message: 'Experience is required' },
                        {
                          type: 'number',
                          min: 0,
                          max: 50,
                          message: 'Experience is bteween 0 to 50',
                        },
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} disabled={loading} min={0} max={50} />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              <Panel header="Education & Awards" key="education">
                <Row gutter={[16, 10]}>
                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name={['education', 0, 'degree']}
                      label="Degree"
                      rules={[{ required: true, message: 'Degree is required' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Degree"
                        loading={degreeLoading}
                        disabled={degreeLoading}
                        allowClear
                        onClick={() => {
                          if (degrees.length === 0) fetchDegreesList();
                        }}
                      >
                        {degrees.map((item) => (
                          <Select.Option key={item} value={item}>
                            {item}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name={['education', 0, 'institute']}
                      label="Institute"
                      rules={[{ required: true, message: 'Institute is required' }]}
                    >
                      <Input disabled={loading} />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={8}>
                    <Form.Item
                      name={['education', 0, 'year']}
                      label="Year"
                      rules={[{ required: true, message: 'Year is required' }]}
                    >
                      <InputNumber style={{ width: '100%' }} disabled={loading} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.List name="awards">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row gutter={[16, 10]} align="middle" key={key}>
                          <Col xs={24} sm={12} md={8}>
                            <Form.Item {...restField} name={[name, 'name']} label="Award Name">
                              <Input placeholder="Best Doctor Award" />
                            </Form.Item>
                          </Col>

                          <Col xs={20} sm={12} md={8}>
                            <Form.Item {...restField} name={[name, 'date']} label="Award Date">
                              <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={4} sm={12} md={8}>
                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                          </Col>
                        </Row>
                      ))}

                      <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                        Add Award
                      </Button>
                    </>
                  )}
                </Form.List>
              </Panel>
            </Collapse>

            <div
              style={{
                textAlign: 'right',
                marginTop: 20,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'end',
              }}
            >
              <Button
                htmlType="button"
                disabled={loading}
                onClick={() => navigate('/doctor-onbording')}
                style={{marginRight:10 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={{ marginBottom: 10 }}
                htmlType="submit"
                disabled={loading}
                className="btn"
              >
                {loading ? 'Processing...' : isEdit ? 'Update Doctor' : 'Create Doctor'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
