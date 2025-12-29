import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPatientById } from "../../slices/patientSlice";
import "../../hcss.css";

import Breadcrumbs from "../comman/Breadcrumbs";
import { Spin } from "antd";

export default function PatientView() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { patient, loading } = useSelector((state) => state.patient);
    const data = patient; // since slice already stores actual object

    useEffect(() => {
        if (id) dispatch(fetchPatientById(id));
    }, [id]);

    if (loading || !data) {
        return <div className="pv-loading">Loading Patient Details…</div>;
    }

    return (
        <>
            {loading && (
                <Spin fullscreen size="large" tip="Loading..." />
            )}
            <Breadcrumbs
                title="View Patient"
                showBack={true}
                backTo="/patitent-onboarding"
                items={[
                    { label: "Patient List", href: "/patitent-onboarding" },
                    { label: "View Patient" }
                ]}
            />
            <div className="pv-container">
                {/* BASIC DETAILS */}
                <section className="pv-section">
                    <h2>🧑‍⚕️ Basic Information</h2>
                    <div className="pv-grid">
                        <div><strong>First Name:</strong> {data.firstName}</div>
                        <div><strong>Last Name:</strong> {data.lastName}</div>
                        <div><strong>Gender:</strong> {data.gender}</div>
                        <div><strong>DOB:</strong> {new Date(data.dob).toLocaleDateString()}</div>
                        <div><strong>Age:</strong> {data.age}</div>
                        <div><strong>Phone:</strong> {data.phone}</div>
                        <div><strong>Alternate Phone:</strong> {data.altPhone || "-"}</div>
                        <div><strong>Email:</strong> {data.email || "-"}</div>
                    </div>
                </section>

                {/* ADDRESS */}
                <section className="pv-section">
                    <h2>📍 Address</h2>
                    <div className="pv-grid">
                        <div><strong>Line 1:</strong> {data.address.line1}</div>
                        <div><strong>Line 2:</strong> {data.address.line2}</div>
                        <div><strong>City:</strong> {data.address.city}</div>
                        <div><strong>State:</strong> {data.address.state}</div>
                        <div><strong>Zip Code:</strong> {data.address.zip}</div>
                        <div><strong>Country:</strong> {data.address.country}</div>
                    </div>
                </section>

                {/* IPD DETAILS */}
                {data.caseType === "ipd" && (
                    <section className="pv-section">
                        <h2>🏨 IPD Details</h2>
                        <div className="pv-grid">
                            <div><strong>Ward:</strong> {data.ipd.ward}</div>
                            <div><strong>Room:</strong> {data.ipd.roomNumber}</div>
                            <div><strong>Bed:</strong> {data.ipd.bedNumber}</div>
                            <div><strong>Admission Date:</strong> {new Date(data.ipd.admissionDate).toLocaleDateString()}</div>
                            <div><strong>Discharge Date:</strong> {new Date(data.ipd.dischargeDate).toLocaleDateString()}</div>
                            <div className="pv-full"><strong>Summary:</strong> {data.ipd.dischargeSummary || "-"}</div>
                        </div>
                    </section>
                )}

                {/* VITALS */}
                <section className="pv-section">
                    <h2>❤️ Vitals</h2>
                    <div className="pv-grid">
                        <div><strong>Height:</strong> {data.vitals?.height ?? "-"} cm</div>
                        <div><strong>Weight:</strong> {data.vitals?.weight ?? "-"} kg</div>
                        <div><strong>Temperature:</strong> {data.vitals?.temperature ?? "-"}</div>
                        <div><strong>Blood Pressure:</strong> {data.vitals?.bloodPressure ?? "-"}</div>
                        <div><strong>Pulse:</strong> {data.vitals?.pulse ?? "-"}</div>
                        <div><strong>SpO2:</strong> {data.vitals?.spo2 ?? "-"}</div>
                    </div>
                </section>


                {/* INSURANCE */}
                <section className="pv-section">
                    <h2>🛡 Insurance</h2>
                    <div className="pv-grid">
                        <div><strong>Provider:</strong> {data.insurance.provider}</div>
                        <div><strong>Policy Number:</strong> {data.insurance.policyNumber}</div>
                        <div><strong>Expiry:</strong> {new Date(data.insurance.expiryDate).toLocaleDateString()}</div>
                    </div>
                </section>

                {/* EMERGENCY CONTACT */}
                <section className="pv-section">
                    <h2>📞 Emergency Contact</h2>
                    <div className="pv-grid">
                        <div><strong>Name:</strong> {data.emergencyContact.name}</div>
                        <div><strong>Phone:</strong> {data.emergencyContact.phone}</div>
                        <div><strong>Relation:</strong> {data.emergencyContact.relation}</div>
                    </div>
                </section>

                {/* GUARDIAN */}
                <section className="pv-section">
                    <h2>🧑‍🍼 Guardian</h2>
                    <div className="pv-grid">
                        <div><strong>Name:</strong> {data.guardian.name}</div>
                        <div><strong>Phone:</strong> {data.guardian.phone}</div>
                        <div><strong>Relation:</strong> {data.guardian.relation}</div>
                    </div>
                </section>

                {/* MEDICATIONS */}
                <section className="pv-section">
                    <h2>💊 Medications</h2>
                    {data.medications?.length > 0 ? (
                        data.medications.map((m) => (
                            <div key={m._id} className="pv-list-item">
                                <strong>{m.name}</strong> — {m.dosage} — {m.frequency}
                            </div>
                        ))
                    ) : (
                        <p>No medications</p>
                    )}
                </section>

                {/* ALLERGIES */}
                <section className="pv-section">
                    <h2>⚠️ Allergies</h2>
                    <div className="pv-chip-box">
                        {data.allergies.map((a) => <span className="pv-chip">{a}</span>)}
                    </div>
                </section>

                {/* NOTES */}
                <section className="pv-section">
                    <h2>📝 Medical Notes</h2>
                    <p className="pv-notes">{data.notes || "No notes available"}</p>
                </section>
            </div>
        </>
    );
}

