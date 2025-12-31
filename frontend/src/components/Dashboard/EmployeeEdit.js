import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Edit = ({ selectedEmployee, setIsEditing }) => {
  const id = selectedEmployee[0];

  const [firstName, setFirstName] = useState(selectedEmployee[1]);
  const [lastName, setLastName] = useState(selectedEmployee[2]);
  const [email, setEmail] = useState(selectedEmployee[3]);
  const [salary, setSalary] = useState(selectedEmployee[7]);
  

  const handleUpdate = async () => {
    const updatedEmployee = {
      id,
      firstName,
      lastName,
      email,
      salary
    };

    try {
      const response = await fetch(`http://localhost:3001/api/employees/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEmployee),
      });

      if (response.ok) {
        await response.json();
        setIsEditing(false);
        Swal.fire({
          icon: "success",
          title: "Employee updated successfully",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update employee",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "An error occurred",
        text: error.message,
      });
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleUpdate}>
        <h1>Edit Employee</h1>
        <label htmlFor="id">Employee ID: {id}</label>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <label htmlFor="salary">Salary ($)</label>
        <input
          id="salary"
          type="number"
          name="salary"
          value={salary}
          onChange={e => setSalary(e.target.value)}
        />

        <div style={{ marginTop: '30px' }}>
          <input type="submit" value="Update" />
          <input
            style={{ marginLeft: '12px' }}
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

export default Edit;
