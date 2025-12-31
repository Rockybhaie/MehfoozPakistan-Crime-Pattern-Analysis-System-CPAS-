import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { suspectsAPI } from '../../services/api';
import './Crimes.css';

const Suspects = () => {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    address: '',
    criminalRecord: false,
    status: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    searchName: '',
    status: '',
    hasCriminalRecord: '',
  });
  const [expanded, setExpanded] = useState({});
  const [detailsCache, setDetailsCache] = useState({});

  useEffect(() => {
    loadSuspects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuspects = async () => {
    try {
      setLoading(true);
      // Build query params from filters
      const params = new URLSearchParams();
      if (searchFilters.searchName) params.append('searchName', searchFilters.searchName);
      if (searchFilters.status) params.append('status', searchFilters.status);
      if (searchFilters.hasCriminalRecord !== '') params.append('hasCriminalRecord', searchFilters.hasCriminalRecord);
      
      const queryString = params.toString();
      const response = await suspectsAPI.getAll(queryString ? `?${queryString}` : '');
      setSuspects(response.data || response || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load suspects',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchName: '',
      status: '',
      hasCriminalRecord: '',
    });
  };

  const applyFilters = () => {
    loadSuspects();
  };

  const handleAdd = () => {
    setEditingSuspect(null);
    setFormData({
      name: '',
      gender: '',
      age: '',
      address: '',
      criminalRecord: false,
      status: '',
    });
    setShowForm(true);
  };

  const handleEdit = (suspect) => {
    setEditingSuspect(suspect);
    setFormData({
      name: suspect.NAME || suspect.Name || suspect.name || '',
      gender: suspect.GENDER || suspect.Gender || suspect.gender || '',
      age: suspect.AGE || suspect.Age || suspect.age || '',
      address: suspect.ADDRESS || suspect.Address || suspect.address || '',
      criminalRecord: (suspect.CRIMINAL_RECORD ?? suspect.Criminal_Record ?? suspect.criminal_record) === 1,
      status: suspect.STATUS || suspect.Status || suspect.status || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await suspectsAPI.delete(id);
        Swal.fire('Deleted!', 'Suspect has been deleted.', 'success');
        loadSuspects();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete suspect', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        address: formData.address || null,
        criminalRecord: !!formData.criminalRecord,
        status: formData.status || null,
      };
      if (editingSuspect) {
        const suspectId = editingSuspect.SUSPECT_ID || editingSuspect.Suspect_ID || editingSuspect.suspect_id;
        await suspectsAPI.update(suspectId, payload);
        Swal.fire('Success!', 'Suspect updated.', 'success');
      } else {
        await suspectsAPI.create(payload);
        Swal.fire('Success!', 'Suspect created.', 'success');
      }
      setShowForm(false);
      setEditingSuspect(null);
      loadSuspects();
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to save suspect', 'error');
    }
  };

  // Sort suspects by ID (backend already filtered)
  const sortedSuspects = [...suspects].sort((a, b) => {
    const aId = a.SUSPECT_ID || a.Suspect_ID || a.suspect_id || 0;
    const bId = b.SUSPECT_ID || b.Suspect_ID || b.suspect_id || 0;
    return aId - bId;
  });

  const toggleDetails = async (suspect) => {
    const suspectId = suspect.SUSPECT_ID || suspect.Suspect_ID || suspect.suspect_id;
    const isOpen = expanded[suspectId];
    if (isOpen) {
      setExpanded((prev) => ({ ...prev, [suspectId]: false }));
      return;
    }
    if (!detailsCache[suspectId]) {
      try {
        const resp = await suspectsAPI.getById(suspectId);
        const data = resp.data || resp || {};
        setDetailsCache((prev) => ({ ...prev, [suspectId]: data }));
      } catch (err) {
        Swal.fire('Error!', err.message || 'Failed to load suspect details', 'error');
        return;
      }
    }
    setExpanded((prev) => ({ ...prev, [suspectId]: true }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading suspects...</p>
      </div>
    );
  }

  return (
    <div className="crimes-container">
      <div className="page-header">
        <h2 className="page-title">👤 Suspects Management</h2>
        <button onClick={handleAdd} className="btn btn-primary">
          + Add New Suspect
        </button>
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>🔍 Search & Filter</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={applyFilters} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
              Clear Filters
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Search by Name</label>
            <input
              type="text"
              name="searchName"
              value={searchFilters.searchName}
              onChange={handleFilterChange}
              placeholder="Enter suspect name..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Status</label>
            <select
              name="status"
              value={searchFilters.status}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Statuses</option>
              <option value="Unknown">Unknown</option>
              <option value="At Large">At Large</option>
              <option value="Arrested">Arrested</option>
              <option value="In Custody">In Custody</option>
              <option value="Released">Released</option>
              <option value="Cleared">Cleared</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Criminal Record</label>
            <select
              name="hasCriminalRecord"
              value={searchFilters.hasCriminalRecord}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Criminal Record</th>
                <th>Status</th>
                <th>Address</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuspects.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>No suspects found.</p>
                  </td>
                </tr>
              ) : (
                sortedSuspects.map((suspect) => {
                  const suspectId = suspect.SUSPECT_ID || suspect.Suspect_ID || suspect.suspect_id;
                  const name = suspect.NAME || suspect.Name || suspect.name;
                  const age = suspect.AGE || suspect.Age || suspect.age;
                  const gender = suspect.GENDER || suspect.Gender || suspect.gender;
                  const address = suspect.ADDRESS || suspect.Address || suspect.address;
                  const criminalRecord = suspect.CRIMINAL_RECORD ?? suspect.Criminal_Record ?? suspect.criminal_record;
                  const status = suspect.STATUS || suspect.Status || suspect.status;

                  const recordText = criminalRecord === 1 || criminalRecord === '1' ? 'Yes' :
                                    criminalRecord === 0 || criminalRecord === '0' ? 'No' :
                                    criminalRecord ?? 'N/A';
                  
                  return (
                    <React.Fragment key={suspectId}>
                      <tr>
                        <td>{suspectId}</td>
                        <td>{name || 'N/A'}</td>
                        <td>{age || 'N/A'}</td>
                        <td>{gender || 'N/A'}</td>
                        <td>{recordText}</td>
                        <td>{status || 'N/A'}</td>
                        <td>{address || 'N/A'}</td>
                        <td>
                          <button 
                            className="btn btn-outline-primary btn-sm" 
                            onClick={() => toggleDetails(suspect)}
                            title={expanded[suspectId] ? "Hide crime history" : "View crime history"}
                          >
                            {expanded[suspectId] ? '▲ Hide' : '▼ Details'}
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(suspect)}
                              className="btn btn-secondary btn-sm"
                              title="Edit suspect details"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(suspectId)}
                              className="btn btn-danger btn-sm"
                              title="Delete suspect"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded[suspectId] && (
                        <tr>
                          <td colSpan="9" style={{ background: '#f8f9fa', padding: 0 }}>
                            {detailsCache[suspectId] ? (
                              <div style={{ padding: '20px' }}>
                                <div style={{ 
                                  background: 'white', 
                                  borderRadius: '8px', 
                                  padding: '15px',
                                  border: '1px solid #dee2e6'
                                }}>
                                  <h4 style={{ 
                                    marginTop: 0, 
                                    marginBottom: '15px',
                                    color: '#495057',
                                    borderBottom: '2px solid #007bff',
                                    paddingBottom: '8px'
                                  }}>
                                    🔗 Crime History
                                  </h4>
                                  {detailsCache[suspectId].crimeHistory && detailsCache[suspectId].crimeHistory.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                          <tr style={{ background: '#f8f9fa' }}>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Crime ID</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Crime Type</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date Occurred</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Role</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Arrest Status</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detailsCache[suspectId].crimeHistory.map((c, idx) => {
                                            const crimeStatus = c.STATUS || c.Status || c.status || 'N/A';
                                            const arrestStatus = c.ARREST_STATUS || c.Arrest_Status || c.arrest_status || 'N/A';
                                            
                                            return (
                                              <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: '#e3f2fd', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold'
                                                  }}>
                                                    #{c.CRIME_ID || c.Crime_ID || c.crime_id || 'N/A'}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px' }}>{c.CRIME_TYPE || c.Crime_Type || c.crime_type || 'N/A'}</td>
                                                <td style={{ padding: '10px' }}>
                                                  {c.DATE_OCCURRED || c.Date_Occurred || c.date_occurred 
                                                    ? new Date(c.DATE_OCCURRED || c.Date_Occurred || c.date_occurred).toLocaleDateString()
                                                    : 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: '#fff3cd', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                  }}>
                                                    {c.ROLE || c.Role || c.role || 'N/A'}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: arrestStatus === 'Arrested' ? '#d4edda' : '#f8d7da',
                                                    color: arrestStatus === 'Arrested' ? '#155724' : '#721c24',
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500'
                                                  }}>
                                                    {arrestStatus}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: crimeStatus === 'Closed' ? '#d4edda' : crimeStatus === 'Open' ? '#f8d7da' : '#fff3cd',
                                                    color: crimeStatus === 'Closed' ? '#155724' : crimeStatus === 'Open' ? '#721c24' : '#856404',
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                  }}>
                                                    {crimeStatus}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px', maxWidth: '300px' }}>
                                                  {(c.DESCRIPTION || c.Description || c.description || 'N/A').substring(0, 100)}
                                                  {(c.DESCRIPTION || c.Description || c.description || '').length > 100 && '...'}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '4px' }}>
                                      No linked crimes found for this suspect.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                                <p style={{ marginTop: '10px', color: '#666' }}>Loading crime history...</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingSuspect ? 'Edit Suspect' : 'Add Suspect'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Criminal Record</label>
                  <select
                    value={formData.criminalRecord ? 'Yes' : 'No'}
                    onChange={(e) => setFormData({ ...formData, criminalRecord: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="At Large">At Large</option>
                    <option value="Released">Released</option>
                    <option value="Arrested">Arrested</option>
                    <option value="Unknown">Unknown</option>
                    <option value="In Custody">In Custody</option>
                    <option value="Cleared">Cleared</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSuspect ? 'Update Suspect' : 'Create Suspect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suspects;

