import React, { useState , useEffect } from 'react';
import Swal from 'sweetalert2';

const Add = ({setIsAdding }) => {
  const [id, setID] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [salary, setSalary] = useState('');
  const [jobID, setJobID] = useState('10');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/jobs/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setJobs(data.data);
      })
      .catch((error) => console.error("Error fetching search results:", error));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3001/api/employeeidmax/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setID(data.data[0][0] + 1)
      })
      .catch((error) => console.error("Error fetching Employees", error));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phone || !salary || !date ) {
      return Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'All fields are required.',
        showConfirmButton: true,
      });
    }

    const newEmployee = {
      id,
      firstName,
      lastName,
      email,
      phone,
      salary,
      jobID,
      date,
    };

    try {
      // console.log(JSON.stringify(newEmployee))
      const response = await fetch('http://localhost:3001/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        await response.json();
        // onAddEmployee(newEmployee);
        window.location.reload();
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: `${firstName} ${lastName}'s data has been Added.`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        console.error('Failed to add employee');
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: `Please try again`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsAdding(false);
  };

  return (
    <div className="small-container">
      <form onSubmit={handleAdd}>
        <h1>Add Employee</h1>
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
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="text"
          name="phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <label htmlFor="salary">Salary ($)</label>
        <input
          id="salary"
          type="number"
          name="salary"
          value={salary}
          onChange={e => setSalary(e.target.value)}
        />
        <label htmlFor="date">Hire Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <label htmlFor="jobID">Job</label>
        <select
          id="jobID"
          name="jobID"
          value={jobID}
          onChange={e => setJobID(e.target.value)}
          >
          <option value="">Select a job</option>
          {jobs.map(job => (
            <option key={job[0]} value={job[0]}>
              {job[1]}
            </option>
          ))}
        </select>
        <div style={{ marginTop: '30px' }}>
          <input type="submit" value="Add" />
          <input
            style={{ marginLeft: '12px' }}
            className="muted-button"
            type="button"
            value="Cancel"
            onClick={() => setIsAdding(false)}
          />
        </div>
      </form>
    </div>
  );
};

export default Add;
