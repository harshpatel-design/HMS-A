import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors, deleteDoctor ,setSort,resetSort } from "../../slices/doctorSlice";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../comman/Breadcrumbs";
import "../../index.css";

const { Search } = Input;

export default function DoctorOnbordingList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { doctors = [], loading, total, page, limit } = useSelector(
    (state) => state.doctor
  );

  const [searchText, setSearchText] = useState("");

  /* INITIAL LOAD */
  useEffect(() => {
    dispatch(fetchDoctors({ page: 1, limit: 12 }));
  }, [dispatch]);

  /* DELETE */
  const handleDelete = async (id) => {
    await dispatch(deleteDoctor(id));
    dispatch(fetchDoctors({ page, limit, search: searchText }));
  };

  /* TABLE COLUMNS (NO FIXED COLUMN) */
  const columns = [
    {
      title: "Image",
      key: "image",
      width: 80,
      render: (_, doc) => {
        const imageUrl = doc?.image
          ? `${process.env.REACT_APP_API_URL}/uploads/users/${doc.image}`
          : `https://ui-avatars.com/api/?name=${doc.name}&background=random`;

        return <Avatar src={imageUrl} size={48} />;
      },
    },
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      width: 160,
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Specialization",
      key: "specialization",
      dataIndex: "specialization",
      width: 160,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Phone",
      key: "phone",
      dataIndex: "phone",
      width: 130,
    },
    {
      title: "Schedule",
      key: "schedule",
      width: 280,
      render: (_, doc) =>
        doc.schedule?.length ? (
          <div className="schedule-cell">
            {doc.schedule.map((day) => (
              <div key={day._id} className="schedule-day-row">
                <span className="schedule-day-badge">{day.day}</span>

                <div className="schedule-session-list">
                  {day.sessions?.map((sess) => (
                    <span key={sess._id} className="schedule-session-chip">
                      <span className="session-name">{sess.sessionName}</span>
                      <span className="session-time">
                        {sess.from} – {sess.to}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="empty-text">—</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, doc) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/view-doctor/${doc.doctorid}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/add-edit-doctor/${doc.doctorid}`)}
          />
          <Popconfirm
            title="Delete doctor?"
            onConfirm={() => handleDelete(doc.doctorid)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

   const handleTableChange = (pagination, filters, sorter) => {
      if (!sorter.order) {
        dispatch(resetSort());
        dispatch(
          fetchDoctors({
            page: pagination.current,
            limit: pagination.pageSize,
            orderBy: "createdAt",
            order: "DESC",
          })
        );
        return;
      }
      const sortOrder = sorter.order === "ascend" ? "ASC" : "DESC";

      dispatch(
        setSort({
          orderBy: sorter.field,
          order: sortOrder,
        })
      );

      dispatch(
        fetchDoctors({
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText,
          orderBy: sorter.field,
          order: sortOrder,
        })
      );
    };

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Doctor List"
        showBack
        backTo="/doctor-onbording"
        items={[
          { label: "Doctors", href: "/doctor-onbording" },
          { label: "Doctor List" },
        ]}
      />

      <div className="serachbar-bread">
        <Space>
          <Search
            placeholder="Search doctors"
            allowClear
            onSearch={(v) => {
              setSearchText(v);
              dispatch(fetchDoctors({ page: 1, limit: 12, search: v }));
            }}
            style={{ width: 240 }}
          />

          <Button
            type="primary"
            className="btn"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-edit-doctor")}
          >
            Add Doctor
          </Button>
        </Space>
      </div>

      <Table
        rowKey="doctorid"
        columns={columns}
        dataSource={doctors}
        loading={loading}
        scroll={{ x: "max-content" }}   // ✅ no forced scrollbar
        pagination={{
              current: page,
              pageSize: limit,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              onChange: handleTableChange,
              showTotal: (totalRecord) => `Total ${totalRecord} items`,
              showQuickJumper: limit > 100 && limit < 500,
              locale: {
                items_per_page: 'Items / Page',
              },
            }}
      />
    </div>
  );
}
