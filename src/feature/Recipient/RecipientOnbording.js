import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Space, Input, Tag, Modal, Dropdown, message, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

import { fetchRecipients, deleteRecipient } from '../../slices/recipientSlice';

import Breadcrumbs from '../comman/Breadcrumbs';
import '../../index.css';

const { Search } = Input;

export default function RecipientOnboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { recipients, loading, total, page, limit } = useSelector((state) => state.recipient);

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchRecipients({ page: 1, limit: 10 }));
  }, [dispatch]);

  const debouncedFetch = useMemo(
    () =>
      debounce((value) => {
        dispatch(fetchRecipients({ page: 1, limit, search: value }));
      }, 500),
    [dispatch, limit]
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const handleDelete = (userId) => {
    Modal.confirm({
      title: 'Delete Recipient?',
      content: 'Are you sure you want to delete this recipient?',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteRecipient(userId)).unwrap();
          message.success('Recipient deleted');
          dispatch(fetchRecipients({ page, limit, search: searchText }));
        } catch (err) {
          message.error(err?.message || 'Delete failed');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      width: 80,
      key: 'image',
      render: (img, record) => {
        const imageUrl = img
          ? `${process.env.REACT_APP_API_URL}/uploads/users/${img}`
          : `https://ui-avatars.com/api/?name=${record.name}&background=random`;

        return <Avatar size={48} src={imageUrl} />;
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (v) => <Tag color="purple">₹{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) =>
        v === 'active' ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/add-edit-recipient/${record.userId}`)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.userId)}
          />
        </Space>
      ),
    },
  ];

  const handlePageChange = (pageNumber, pageSize) => {
    dispatch(
      fetchRecipients({
        page: pageNumber,
        limit: pageSize,
        search: searchText,
      })
    );
  };

  return (
    <div className="page-wrapper">
      <Breadcrumbs
        title="Recipient List"
        showBack
        backTo="/dashboard"
        items={[
          { label: 'Recipient List', href: '/recipient-onboarding' },
          { label: 'Recipient List' },
        ]}
      />

      <div className="serachbar-bread">
        <Space>
          <Search
            placeholder="Search Recipient"
            allowClear
            value={searchText}
             className='searchbar-search'
            onChange={(e) => {
              setSearchText(e.target.value);
              debouncedFetch(e.target.value);
            }}
          />

          <Button
            type="primary"
            className="btn"
            icon={<PlusOutlined />}
            onClick={() => navigate('/add-edit-recipient')}
          >
            Add Recipient
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={recipients}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: handlePageChange,
          showTotal: (total) => `Total ${total} recipients`,
        }}
      />
    </div>
  );
}
