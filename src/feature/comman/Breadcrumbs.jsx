import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function Breadcrumbs({
  title,
  items = [],
  showBack = true,
  backTo = null,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #eee",
        marginBottom: 16,
      }}
    >
      {/* Page Title */}
      {title && (
        <h2
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 22,
            marginBottom: 10,
          }}
        >
          {title}
        </h2>
      )}

      {/* Breadcrumb Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 14,
          color: "#666",
          gap: 6,
        }}
      >
        {showBack && (
          <>
            <span
              onClick={handleBack}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#444",
                fontWeight: 500,
              }}
            >
              <ArrowLeftOutlined />
              Back
            </span>
            <span>/</span>
          </>
        )}

        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href ? (
              <Link
                to={item.href}
                style={{
                  color: "#1890ff",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "#999" }}>{item.label}</span>
            )}

            {index !== items.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
