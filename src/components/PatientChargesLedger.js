import React, { useEffect } from 'react';
import { Card, Table, Spin, Empty, Row, Col, Space, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getPatientLedger } from '../slices/payment.slice';

const { RangePicker } = DatePicker;

function PatientChargesLedger() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { ledger, loading } = useSelector((state) => state.payment);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);


  useEffect(() => {
    if (id) {
      dispatch(
        getPatientLedger({
          patientId: id,
          page,
          limit,
        })
      );
    }
  }, [dispatch, id, page, limit]);

  const handleTableChange = (page, pageSize) => {
    setPage(page);
    setLimit(pageSize);

    dispatch(
      getPatientLedger({
        patientId: id,
        page,
        limit: pageSize,
      })
    );
  };

  const payments = ledger?.payments || [];
  const summary = ledger?.summary;

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render: (v) => v?.toUpperCase(),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (v) => v || '—',
    },
    {
      title: 'Received By',
      key: 'receivedBy',
      render: (_, r) => r.receivedBy || '—',
    },
    {
      title: 'Received At',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      render: (v) => new Date(v).toLocaleString('en-IN'),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (v) => v || '—',
    },
  ];

  return (
    <div className="page-wrapper">
      <Card title="Patient Ledger & Payment History">
        <Spin spinning={loading}>
          {summary && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={6}>
                <Card size="small">Total: ₹ {summary.totalAmount}</Card>
              </Col>
              <Col xs={24} md={6}>
                <Card size="small">Paid: ₹ {summary.paidAmount}</Card>
              </Col>
              <Col xs={24} md={6}>
                <Card size="small">Discount: ₹ {summary.discount.amount}</Card>
              </Col>
              <Col xs={24} md={6}>
                <Card size="small">Balance: ₹ {summary.balanceAmount}</Card>
              </Col>
            </Row>
          )}
          <div className="serachbar-bread">
            <Space style={{ flexWrap: 'wrap' }}>
              <RangePicker
                format="YYYY-MM-DD"
                onChange={(dates) => {
                  dispatch(
                    getPatientLedger({
                      patientId: id,
                      page: 1,
                      limit,
                      startDate: dates?.[0]?.format('YYYY-MM-DD'),
                      endDate: dates?.[1]?.format('YYYY-MM-DD'),
                    })
                  );
                  setPage(1);
                }}
              />
            </Space>
          </div>
          <div className="table-scroll-container">
            {payments.length ? (
              <Table
                rowKey="_id"
                columns={columns}
                dataSource={payments}
                loading={loading}
                scroll={{ x: 1000 }}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: payments.length,
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
            ) : (
              <Empty description="No payment history found" />
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
}

export default PatientChargesLedger;
