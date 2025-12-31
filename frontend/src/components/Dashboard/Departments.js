import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import Header from "./Header";
import DepartmentEdit from "./DepartmentEdit";
import DepartmentTable from "./DepartmentTable";
import AddDepartment from "./DepartmentAdd";

const DepartmentsDashboard = ({ setIsAuthenticated }) => {
  const [departments, setDepartments] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    //OPTIONAL TASK: Add logic to fetch departments here.
  }, []);

  const handleEdit = (id) => {
    //OPTIONAL TASK: Add logic to update departments here
  };

  return (
    <div>
      <Header
        setIsAdding={setIsAdding}
        setIsAuthenticated={setIsAuthenticated}
      />
      <div className="container">
        {!isAdding && !isEditing && (
          <>
            <div
              style={{
                display: "flex",
                marginTop: "30px",
                marginBottom: "18px",
              }}
            >
              <h3 style={{ marginRight: "36px" }}>Department View</h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setIsAdding(true)}
                  style={{
                    color: "#404040",
                    border: "3px solid #404040",
                    backgroundColor: "transparent",
                    borderRadius: "12px",
                  }}
                >
                  Add Department
                </button>
              </div>
            </div>
            <DepartmentTable
              departments={departments}
              handleEdit={handleEdit}
            />
          </>
        )}
        {isAdding && (
          <AddDepartment
            departments={departments}
            setDepartments={setDepartments}
            setIsAdding={setIsAdding}
          />
        )}
        {isEditing && (
          <DepartmentEdit
            departments={departments}
            selectedDepartment={selectedDepartment}
            setDepartments={setDepartments}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentsDashboard;
