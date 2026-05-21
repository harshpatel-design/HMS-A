import { useCallback, useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Collapse,
  message,
  Spin,
  Table,
  Checkbox,
  Space,
  Radio,
  Tooltip,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { createDiagnosis } from '../../slices/diagnosisSlice';
import { fetchDoctorsName } from '../../slices/doctorSlice';
import { fetchPatientById, fetchPatientName } from '../../slices/patientSlice';
import { fetchMedicines } from '../../slices/medicineSlice';
import { getDiagnosisById } from '../../slices/diagnosisSlice';

import Breadcrumbs from '../comman/Breadcrumbs';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
const { Option } = Select;

export default function AddDiagnosis() {
  const { diagnosisId, patientId, doctorId } = useParams();

  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicinePage, setMedicinePage] = useState(1);
  const [hasMoreMedicinesLimit, setHasMoreMedicinesLimit] = useState(20);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { loading } = useSelector((state) => state.diagnosis);
  const { doctorNames } = useSelector((state) => state.doctor);
  const { patientName, selectedPatient } = useSelector((state) => state.patient);
  const { selectedDiagnosis, loading: diagnosisLoading } = useSelector((state) => state.diagnosis);
  const {
    medicines: medicineList,
    loading: medicineLoading,
    total: medicineListTotal,
  } = useSelector((state) => state.medicine);

  useEffect(() => {
    if (diagnosisId) {
      dispatch(getDiagnosisById(diagnosisId));
    }
  }, [diagnosisId, dispatch]);

  useEffect(() => {
    if (selectedDiagnosis) {
      form.setFieldsValue({
        patient: selectedDiagnosis?.patient?._id,
        doctor: selectedDiagnosis?.doctor?._id,
        caseType: selectedDiagnosis?.caseType,
        visitDate: selectedDiagnosis?.visitDate ? dayjs(selectedDiagnosis.visitDate) : null,
        status: selectedDiagnosis?.status,
        diagnosis: selectedDiagnosis?.diagnosis,
        chiefComplaint: selectedDiagnosis?.chiefComplaint,
        clinicalNotes: selectedDiagnosis?.clinicalNotes,
        advice: selectedDiagnosis?.advice,
        followUpDate: selectedDiagnosis?.followUpDate
          ? dayjs(selectedDiagnosis.followUpDate)
          : null,
      });

      setMedicines(
        selectedDiagnosis?.medications?.map((m) => {
          const medicineData = medicineList.find((med) => {
            return med._id === m.medicine;
          });

          return {
            key: m._id || Date.now(),
            medicineId: {
              value: m.medicine,
              label: medicineData?.name || m.medicineName || 'Medicine',
            },
            dosage: m.dosage ? m.dosage.split(', ') : [],
            duration: Number(m.duration),
            instructions: m.instructions,
            timing: m.timing,
            total: m.tablets,
          };
        })
      );
    }
  }, [selectedDiagnosis, form, medicineList]);

  useEffect(() => {
    if (selectedDiagnosis) {
      setHasMoreMedicinesLimit(10000)
      dispatch(
        fetchMedicines({
          page: medicinePage,
          limit: hasMoreMedicinesLimit,
          search: medicineSearch,
          sortBy: 'name',
          order: 'ASC',
          form: '',
        })
      );
    } else {
      dispatch(
        fetchMedicines({
          page: medicinePage,
          limit: hasMoreMedicinesLimit,
          search: medicineSearch,
          sortBy: 'name',
          order: 'ASC',
          form: '',
        })
      );
    }
  }, [selectedDiagnosis, dispatch, medicinePage, medicineSearch, hasMoreMedicinesLimit]);

  const handleMedicineSearch = useMemo(
    () =>
      debounce((value) => {
        setMedicineSearch(value);

        setMedicinePage(1);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      handleMedicineSearch.cancel();
    };
  }, [handleMedicineSearch]);
  const handleMedicineScroll = (e) => {
    const target = e.target;
    const totalPages = Math.ceil(medicineListTotal / hasMoreMedicinesLimit);
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
      !medicineLoading &&
      medicinePage < totalPages
    ) {
      setMedicinePage((prev) => prev + 1);
    }
  };

  const [medicines, setMedicines] = useState([
    {
      key: Date.now(),
      medicineId: '',
      medicineForm: '',
      duration: 1,
      dosage: [],
      total: 0,
      instructions: '',
    },
  ]);

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        key: Date.now(),
        tabletName: '',
        duration: 1,
        dosage: [],
        total: 0,
        instructions: '',
      },
    ]);
  };

  const removeMedicineRow = (key) => {
    const updated = medicines.filter((item) => item.key !== key);
    setMedicines(updated);
  };
  const patients = patientName?.patients || [];

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
    }
  }, [patientId, dispatch]);

  useEffect(() => {
    dispatch(fetchDoctorsName());
    dispatch(fetchPatientName({ page: 1, limit: 20, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPatient && patientId) {
      form.setFieldsValue({
        patient: selectedPatient._id,
        caseType: selectedPatient.caseType,
      });
    }
  }, [selectedPatient, patientId, form]);

  useEffect(() => {
    if (doctorId && doctorNames?.length) {
      const doctor = doctorNames.find((d) => d._id === doctorId);
      if (doctor) {
        form.setFieldsValue({
          doctor: {
            value: doctor._id,
            label: doctor.name,
          },
        });
      }
    }
  }, [doctorId, doctorNames, form]);

  const onFinish = (values) => {
    console.log('values', values);
    const payload = {
      ...values,
      patient: patientId || values.patient,
      doctor: values.doctor?.value,
      visitDate: values.visitDate?.toISOString(),
      followUpDate: values.followUpDate?.toISOString(),
      medications: medicines.map((m) => ({
        medicine: m.medicineId,
        dosage: m.dosage?.join(', '),
        duration: String(m.duration),
        instructions: m.instructions || '',
        timing: m.timing || '',
        tablets: Number(m.total) || 0,
      })),
    };

    dispatch(createDiagnosis(payload))
      .unwrap()
      .then(() => {
        message.success('Diagnosis created successfully');
        navigate('/diagnosis');
      })
      .catch((err) => {
        message.error(err || 'Validation failed');
      });
  };

  const updateMedicine = (key, field, value) => {
    const updated = medicines.map((item) => {
      if (item.key === key) {
        const updatedItem = {
          ...item,
          [field]: value,
        };
        if (updatedItem.medicineForm !== 'syrup' && field !== 'total') {
          const dosageCount = updatedItem.dosage.length;
          updatedItem.total = updatedItem.duration * dosageCount;
        }
        return updatedItem;
      }
      return item;
    });

    setMedicines(updated);
  };

  const handleMedicineChange = (value, record) => {
    const selectedMedicine = medicineList.find((m) => m._id === value);

    setMedicines((prev) =>
      prev.map((item) => {
        if (item.key === record.key) {
          return {
            ...item,
            medicineId: value,
            medicineForm: selectedMedicine?.form || '',
            total: selectedMedicine?.form === 'syrup' ? 1 : item.duration * item.dosage.length,
          };
        }
        return item;
      })
    );
  };
  const columns = [
    {
      title: 'Medicine',
      render: (_, record) => (
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          loading={medicineLoading}
          placeholder="Select Medicine"
          style={{ width: '100%' }}
          filterOption={false}
          value={record.medicineId}
          onSearch={handleMedicineSearch}
          onPopupScroll={handleMedicineScroll}
          onChange={(value) => handleMedicineChange(value, record)}
          options={medicineList
            ?.filter((e) => e?._id)
            .map((e) => ({
              value: e._id,
              label: e.name || '',
            }))}
        />
      ),
    },

    {
      title: 'Duration(Days)',
      dataIndex: 'duration',
      width: 130,
      render: (_, record) => (
        <Input
          type="number"
          min={1}
          value={record.duration}
          onChange={(e) => updateMedicine(record.key, 'duration', Number(e.target.value))}
        />
      ),
    },

    {
      title: 'Dosage',
      dataIndex: 'dosage',
      width: 290,
      render: (_, record) => (
        <Checkbox.Group
          value={record.dosage}
          onChange={(value) => updateMedicine(record.key, 'dosage', value)}
        >
          <Space>
            <Checkbox value="morning">Morning</Checkbox>
            <Checkbox value="noon">Noon</Checkbox>
            <Checkbox value="night">Night</Checkbox>
          </Space>
        </Checkbox.Group>
      ),
    },

    {
      title: 'Timing',
      dataIndex: 'timing',
      width: 180,
      render: (_, record) => (
        <Radio.Group
          value={record.timing}
          onChange={(e) => updateMedicine(record.key, 'timing', e.target.value)}
        >
          <Space direction="vertical" className="action">
            <Row gutter={[12, 12]} style={{ alignItems: 'center' }}>
              <Col span={12}>
                <Radio value="after">After</Radio>
              </Col>
              <Col span={12}>
                <Radio value="before">Before</Radio>
              </Col>
            </Row>
          </Space>
        </Radio.Group>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'total',
      width: 160,
      render: (_, record) => (
        <Space.Compact style={{ width: '100%' }}>
          <Input
            type="number"
            min={1}
            value={record.total}
            onChange={(e) => updateMedicine(record.key, 'total', Number(e.target.value))}
          />

          <Button disabled>
            {record.medicineForm === 'syrup'
              ? 'Bottle'
              : record.medicineForm === 'injection'
                ? 'Vial'
                : 'Tabs'}
          </Button>
        </Space.Compact>
      ),
    },
    {
      title: 'Instructions',
      dataIndex: 'instructions',
      width: 180,
      render: (_, record) => (
        <Input
          placeholder="Instructions"
          value={record.instructions}
          onChange={(e) => updateMedicine(record.key, 'instructions', e.target.value)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space className="action">
          <Tooltip title="Add more Medicine">
            <Button type="text" icon={<PlusOutlined />} onClick={addMedicineRow}></Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeMedicineRow(record.key)}
              disabled={medicines?.length === 1}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Add Diagnosis"
        showBack={true}
        items={[{ label: 'Diagnosis List', href: '/diagnosis' }, { label: 'Add Diagnosis' }]}
      />

      <Spin spinning={loading || diagnosisLoading}>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          style={{ marginTop: 10 }}
          initialValues={{
            visitDate: dayjs(),
          }}
        >
          <Collapse
            defaultActiveKey={['basic', 'medical']}
            items={[
              {
                key: 'basic',
                label: 'Basic Details',
                children: (
                  <Row gutter={[16, 10]}>
                    <Col md={8} xs={12}>
                      <Form.Item
                        name="patient"
                        label="Patient"
                        rules={[{ required: true, message: 'Patient is required' }]}
                      >
                        <Select
                          showSearch
                          disabled={!!patientId || !!form.getFieldValue('patient')}
                          className="select-inp"
                          placeholder="Select patient"
                        >
                          {selectedPatient && (
                            <Option value={selectedPatient._id}>
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </Option>
                          )}

                          {!patientId &&
                            patients.map((p) => (
                              <Option key={p._id} value={p._id}>
                                {p.firstName} {p.lastName}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col md={8} xs={12}>
                      <Form.Item
                        name="doctor"
                        label="Doctor"
                        rules={[{ required: true, message: 'Doctor is required' }]}
                      >
                        <Select
                          showSearch
                          disabled
                          placeholder="Select doctor"
                          className="select-inp"
                          optionLabelProp="label"
                          allowClear
                          options={doctorNames
                            ?.filter((d) => d?._id)
                            .map((d) => ({
                              value: d._id,
                              label: d.name || 'N/A',
                            }))}
                        ></Select>
                      </Form.Item>
                    </Col>

                    <Col md={8} xs={12}>
                      <Form.Item
                        name="caseType"
                        label="Case Type"
                        rules={[{ required: true, message: 'Case Type is required' }]}
                      >
                        <Select placeholder="Select case type" allowClear>
                          <Option value="opd">OPD</Option>
                          <Option value="ipd">IPD</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col md={8} xs={12}>
                      <Form.Item name="visitDate" label="Visit Date">
                        <DatePicker
                          style={{ width: '100%' }}
                          disabledDate={(c) => c && c > dayjs().endOf('day')}
                        />
                      </Form.Item>
                    </Col>

                    <Col md={8} xs={24}>
                      <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Status is required' }]}
                      >
                        <Select allowClear placeholder="Select status">
                          <Option value="draft">Draft</Option>
                          <Option value="completed">Completed</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'medical',
                label: 'Medical Details',
                children: (
                  <Row gutter={[16, 10]}>
                    <Col xs={24} md={24}>
                      <Form.Item
                        name="diagnosis"
                        label="Diagnosis"
                        rules={[{ required: true, min: 3 }]}
                      >
                        <Input.TextArea rows={3} placeholder="Diagnosis..." />
                      </Form.Item>
                    </Col>

                    <Col span={24} style={{ position: 'relative' }}>
                      <Form.Item>
                        <>
                          <div className="medication-table-container">
                            <div className="table-scroll-container">
                              <Table
                                pagination={false}
                                bordered
                                className="medication-table"
                                rowKey="key"
                                dataSource={medicines}
                                columns={columns}
                              />
                            </div>
                          </div>
                        </>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item name="chiefComplaint" label="Chief Complaint">
                        <Input.TextArea rows={3} placeholder="Chief Complaint..." />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item name="clinicalNotes" label="Clinical Notes">
                        <Input.TextArea rows={3} placeholder="Clinical Notes..." />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item name="advice" label="Advice">
                        <Input.TextArea rows={3} placeholder="Advice..." />
                      </Form.Item>
                    </Col>

                    <Col md={8} xs={24}>
                      <Form.Item name="followUpDate" label="Follow-up Date">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button onClick={() => navigate('/diagnosis')} style={{ marginRight: 10 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="btn"
              style={{ marginBottom: 10 }}
              loading={loading}
            >
              Add Diagnosis
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
}
