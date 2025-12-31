import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const DepartmentEdit = ({
  selectedDepartment,
  setDepartments,
  setIsEditing,
}) => {
  const id = selectedDepartment[0];

  const [name, setName] = useState(selectedDepartment[1]);
  const [location, setLocation] = useState(selectedDepartment[3]);
  const [locations, setLocations] = useState([selectedDepartment[3]]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/location/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setLocations(data.data);
      })
      .catch((error) => console.error("Error fetching results:", error));
  }, []);

  const handleUpdate = async () => {
    //OPTIONAL TASK: Add logic to update departments here
  }

  return (
    <div className="small-container">
      <form onSubmit={handleUpdate}>
        <h1>Edit Department</h1>
        <label htmlFor="name">Department ID: {selectedDepartment[0]}</label>
        <label htmlFor="name">Department Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="name">Location (ID)</label>
        <select
          id="location"
          type="text"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value={location}>{location}</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <div style={{ marginTop: "30px" }}>
          <input type="submit" value="Update" />
          <input
            style={{ marginLeft: "12px" }}
            className="muted-button"
            type="button"
            value="Cancel"
            onClick={() => setIsEditing(false)}
          />
        </div>
      </form>
    </div>
  );
};

export default DepartmentEdit;
