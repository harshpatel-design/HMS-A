import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "../../hcss.css";

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
    <div className="breadcrumbs-wrapper">
      {title && <h2 className="breadcrumbs-title">{title}</h2>}

      <div className="breadcrumbs-row">
        {showBack && (
          <>
            <span className="breadcrumbs-back" onClick={handleBack}>
              <ArrowLeftOutlined />
              Back
            </span>
            <span className="breadcrumbs-separator">/</span>
          </>
        )}

        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href ? (
              <Link to={item.href} className="breadcrumbs-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumbs-current">{item.label}</span>
            )}

            {index !== items.length - 1 && (
              <span className="breadcrumbs-separator">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
