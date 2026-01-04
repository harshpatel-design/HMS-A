import React, { useState } from "react";
import { Card, Calendar, Select, List, Avatar, Button } from "antd";
import { LeftOutlined, RightOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "../hcss.css";

const AppointmentsWidget = () => {
    const [value, setValue] = useState(dayjs());

    const appointments = [
        {
            title: "General Visit",
            time: "Wed, 05 Apr 2025, 06:30 PM",
            avatars: ["/doc1.png", "/doc2.png"],
        },
        {
            title: "General Visit",
            time: "Wed, 05 Apr 2025, 04:10 PM",
            avatars: ["/doc1.png"],
        },
        {
            title: "General Visit",
            time: "Wed, 05 Apr 2025, 10:00 AM",
            avatars: ["/doc2.png"],
        },
        {
            title: "General Visit",
            time: "Wed, 05 Apr 2025, 10:00 AM",
            avatars: ["/doc2.png"],
        },
    ];

    return (
      <div className="app-widgest full-height">
        <Card
          title="Appointments"
          className="full-height"
          extra={
            <Select size="small" defaultValue="all">
              <Select.Option value="all">All Type</Select.Option>
              <Select.Option value="visit">Visit</Select.Option>
            </Select>
          }
          bodyStyle={{ padding: 16 }}
        >
          <Calendar
            fullscreen={false}
            value={value}
            onSelect={(val) => setValue(val)}
            headerRender={({ value, onChange }) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  alignItems: 'center',
                }}
              >
                <LeftOutlined onClick={() => onChange(value.clone().subtract(1, 'month'))} />
                <strong>{value.format('MMMM YYYY')}</strong>
                <RightOutlined onClick={() => onChange(value.clone().add(1, 'month'))} />
              </div>
            )}
          />

          <List
            style={{ marginTop: 12 }}
            dataSource={appointments}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: '#f5f7fb',
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: '10px 12px',
                }}
              >
                <List.Item.Meta
                  title={<strong>{item.title}</strong>}
                  description={
                    <>
                      <CalendarOutlined /> {item.time}
                    </>
                  }
                />
                <Avatar.Group maxCount={2}>
                  {item.avatars.map((img, i) => (
                    <Avatar key={i} src={img} />
                  ))}
                </Avatar.Group>
              </List.Item>
            )}
          />
          <Button type="link" block>
            View All Appointments
          </Button>
        </Card>
      </div>
    );
};

export default AppointmentsWidget;
