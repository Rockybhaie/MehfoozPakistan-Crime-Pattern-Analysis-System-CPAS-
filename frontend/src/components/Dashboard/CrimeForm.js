import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { crimesAPI } from '../../services/api';
import './Crimes.css';

const CrimeForm = ({ crime, crimeTypes, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    crimeTypeName: '',
    dateOccurred: '',
    dateReported: new Date().toISOString().split('T')[0], // Default to today
    timeOccurred: '',
    dayOfWeek: '',
    description: '',
    status: 'Open',
    severityLevel: '',
    city: '',
    area: '',
    street: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crime) {
      // Populate form with existing crime data - handle Oracle's response format
      const dateOccurred = crime.DATE_OCCURRED || crime.Date_Occurred || crime.date_occurred || '';
      const dateReported = crime.DATE_REPORTED || crime.Date_Reported || crime.date_reported || '';
      const timeOccurred = crime.TIME_OCCURRED || crime.Time_Occurred || crime.time_occurred || '';
      
      // Format date for input (YYYY-MM-DD)
      let formattedDate = '';
      if (dateOccurred) {
        const date = new Date(dateOccurred);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      
      // Format date reported
      let formattedDateReported = '';
      if (dateReported) {
        const date = new Date(dateReported);
        if (!isNaN(date.getTime())) {
          formattedDateReported = date.toISOString().split('T')[0];
        }
      } else {
        formattedDateReported = new Date().toISOString().split('T')[0]; // Default to today
      }
      
      // Format time for input (HH:MM)
      let formattedTime = '';
      if (timeOccurred) {
        const time = new Date(timeOccurred);
        if (!isNaN(time.getTime())) {
          formattedTime = time.toTimeString().split(' ')[0].substring(0, 5);
        }
      }
      
      setFormData({
        crimeTypeName: crime.TYPE_NAME || crime.Type_Name || crime.type_name || '',
        dateOccurred: formattedDate,
        dateReported: formattedDateReported,
        timeOccurred: formattedTime,
        dayOfWeek: crime.DAY_OF_WEEK || crime.Day_Of_Week || crime.day_of_week || '',
        description: crime.DESCRIPTION || crime.Description || crime.description || '',
        status: crime.STATUS || crime.Status || crime.status || 'Open',
        severityLevel: crime.SEVERITY_LEVEL || crime.Severity_Level || crime.severity_level || '',
        city: crime.CITY || crime.City || crime.city || '',
        area: crime.AREA || crime.Area || crime.area || '',
        street: crime.STREET || crime.Street || crime.street || '',
      });
    }
  }, [crime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate date occurred is not in the future
      const dateOccurred = new Date(formData.dateOccurred);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (dateOccurred > today) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date',
          text: 'Date Occurred cannot be in the future. Please select a valid date.',
        });
        setLoading(false);
        return;
      }

      // Validate date reported is not before date occurred
      if (formData.dateReported && formData.dateOccurred) {
        const dateReported = new Date(formData.dateReported);
        if (dateReported < dateOccurred) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Date',
            text: 'Date Reported cannot be before Date Occurred.',
          });
          setLoading(false);
          return;
        }
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const officerId = user.id || user.userId;

      const submitData = {
        ...formData,
        officerId, // ensure officerId is sent for updates
        dateOccurred: formData.dateOccurred || new Date().toISOString().split('T')[0],
        dateReported: formData.dateReported || new Date().toISOString().split('T')[0],
      };

      // Remove empty strings and convert to null (but keep required fields)
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' && key !== 'dateOccurred' && key !== 'dateReported') {
          submitData[key] = null;
        }
      });

      // Remove latitude and longitude if they exist (shouldn't be sent)
      delete submitData.latitude;
      delete submitData.longitude;

      console.log('Submitting crime data:', submitData);

      if (crime) {
        // Update existing crime
        const crimeId = crime.CRIME_ID || crime.Crime_ID || crime.crime_id;
        console.log('Updating crime ID:', crimeId);
        const response = await crimesAPI.update(crimeId, submitData);
        console.log('Update response:', response);
        Swal.fire('Success!', 'Crime updated successfully.', 'success');
      } else {
        // Create new crime
        console.log('Creating new crime');
        const response = await crimesAPI.create(submitData);
        console.log('Create response:', response);
        Swal.fire('Success!', 'Crime created successfully.', 'success');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving crime:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to save crime';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        footer: process.env.NODE_ENV === 'development' && error.stack ? 
          `<small style="text-align: left; display: block; max-width: 400px; word-break: break-word;">${error.stack.substring(0, 300)}</small>` : ''
      });
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      dateOccurred: dateValue,
      dayOfWeek: getDayOfWeek(dateValue),
    }));
  };

  // Prevent manual typing in date fields but allow calendar selection
  const handleDateKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, arrow keys
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Prevent typing numbers and other characters
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  // Prevent paste in date fields
  const handleDatePaste = (e) => {
    e.preventDefault();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {crime ? 'Edit Crime' : 'Add New Crime'}
          </h3>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="crimeTypeName">Crime Type *</label>
            <input
              id="crimeTypeName"
              type="text"
              name="crimeTypeName"
              value={formData.crimeTypeName}
              onChange={handleChange}
              placeholder="e.g., Street Theft, Assault"
              required
              disabled={loading}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Enter the crime type name (e.g., "Street Theft", "Assault")
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOccurred">Date Occurred *</label>
              <input
                id="dateOccurred"
                type="date"
                name="dateOccurred"
                value={formData.dateOccurred}
                onChange={handleDateChange}
                onKeyDown={handleDateKeyDown}
                onPaste={handleDatePaste}
                max={new Date().toISOString().split('T')[0]} // Cannot select future dates
                required
                disabled={loading}
                style={{ cursor: 'pointer' }} // Show it's clickable
                title="Click to select date from calendar (cannot be a future date, no manual typing allowed)"
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Cannot be a future date. Click calendar icon to select (manual typing disabled).
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="dateReported">Date Reported</label>
              <input
                id="dateReported"
                type="date"
                name="dateReported"
                value={formData.dateReported}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} // Cannot select future dates
                disabled={loading}
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Defaults to today. Cannot be before Date Occurred.
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timeOccurred">Time Occurred</label>
              <input
                id="timeOccurred"
                type="time"
                name="timeOccurred"
                value={formData.timeOccurred}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dayOfWeek">Day of Week</label>
              <input
                id="dayOfWeek"
                type="text"
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                placeholder="Auto-filled from date"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="severityLevel">Severity Level</label>
            <select
              id="severityLevel"
              name="severityLevel"
              value={formData.severityLevel}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select severity</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the crime incident..."
              required
              disabled={loading}
              rows="4"
            />
          </div>

          <h4 style={{ marginTop: '25px', marginBottom: '15px', color: '#333' }}>
            Location Details
          </h4>

          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Karachi"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="area">Area</label>
              <input
                id="area"
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g., Gulshan"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="street">Street</label>
              <input
                id="street"
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="e.g., Main Street"
                disabled={loading}
              />
            </div>
          </div>


          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : crime ? 'Update Crime' : 'Create Crime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrimeForm;

