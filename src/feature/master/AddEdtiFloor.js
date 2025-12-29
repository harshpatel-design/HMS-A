import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Card,
  Button,
  Spin,
  message,
} from "antd";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../comman/Breadcrumbs";
import {
  fetchFloorById,
  createFloor,
  updateFloor,
} from "../../slices/floorSlice";

const AddEditFloor = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    dispatch(fetchFloorById(id))
      .unwrap()
      .then((res) => {
        const floor = res?.floor ?? res;
        if (!floor) return;

        form.setFieldsValue({
          name: floor.name,
          code: floor.code,
          floorNumber: floor.floorNumber,
          notes: floor.notes,
        });
      })
      .catch(() => message.error("Failed to load floor"))
      .finally(() => setLoading(false));
  }, [id, isEdit, dispatch, form]);

  /* ================= SUBMIT ================= */
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        code: values.code?.toUpperCase(),
      };

      if (isEdit) {
        await dispatch(updateFloor({ id, data: payload })).unwrap();
      } else {
        await dispatch(createFloor(payload)).unwrap();
      }

      message.success(
        isEdit ? "Floor updated successfully!" : "Floor created successfully!"
      );

      navigate("/floor-master");
    } catch (error) {
      message.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Spin fullscreen tip="Loading..." />}

      <Breadcrumbs
        title={isEdit ? "Edit Floor" : "Add New Floor"}
        showBack
        backTo="/floor-master"
        items={[
          { label: "Floor List", href: "/floor-master" },
          { label: isEdit ? "Edit Floor" : "Add Floor" },
        ]}
      />

      <div style={{ opacity: loading ? 0.6 : 1 }}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Card title="Floor Information">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="Floor Name"
                  name="name"
                  rules={[{ required: true, message: "Floor name is required" }]}
                >
                  <Input disabled={loading} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Floor Code"
                  name="code"
                  rules={[
                    { required: true, message: "Floor code is required" },
                    {
                      pattern: /^[A-Z0-9-]+$/,
                      message: "Only A-Z, 0-9 and - allowed",
                    },
                  ]}
                >
                  <Input
                    disabled={loading}
                    onChange={(e) =>
                      form.setFieldValue("code", e.target.value.toUpperCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Floor Number"
                  name="floorNumber"
                  rules={[
                    { required: true, message: "Floor number is required" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    disabled={loading}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Notes" name="notes">
                  <Input disabled={loading} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* SUBMIT */}
          <div style={{ textAlign: "right", display:"flex", alignItems: "center", justifyContent: "flex-end", marginTop: 16, marginLeft :16}}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="btn"
            >
              {isEdit ? "Update Floor" : "Create Floor"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddEditFloor;
