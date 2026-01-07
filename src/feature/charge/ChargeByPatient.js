import React from "react";


import PatientChargesLedger from "../../components/PatientChargesLedger";

export function ChargeByPatient() {

  return (
    <>
      <div className="page-wrapper">
        <PatientChargesLedger />
      </div>
    </>
  );
}

export default (ChargeByPatient);
