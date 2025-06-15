import { useState } from "react";
import * as React from "react";
import UserInformationForm from "./UserInformationForm.jsx";
import { useNavigate } from "react-router-dom";

function RegisterUser() {
  const navigate = useNavigate();
  return (
    <>
      <h2>Tell us a bit about yourself...</h2>
      <UserInformationForm
        saveButtonTextOverride="Next"
        onSaveComplete={(userId) => navigate("/user/" + userId + "/trip/new")}
      />
    </>
  );
}

export default RegisterUser;
