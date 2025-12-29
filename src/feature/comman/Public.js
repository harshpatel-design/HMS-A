import React from "react";
import { Outlet } from "react-router-dom";

export default function Public() {
    return (
        <div className="auth-wrapper">
            <Outlet />
        </div>
    );
}
