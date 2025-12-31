import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { evidenceAPI, enhancedEvidenceAPI } from '../../services/api';
import './Crimes.css';

const Evidence = () => {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState(null);
  const [formData, setFormData] = useState({
    crimeId: '',
    type: '',
    description: '',
    dateCollected: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    crimeId: '',
    type: '',
  });

  useEffect(() => {
    loadEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      // Build query params from filters
      const params = new URLSearchParams();
      if (searchFilters.crimeId) params.append('crimeId', searchFilters.crimeId);
      if (searchFilters.type) params.append('type', searchFilters.type);
      
      const queryString = params.toString();
      const response = await evidenceAPI.getAll(queryString ? `?${queryString}` : '');
      const rows = response.data || response || [];
      // Sort by date collected DESC (backend already does this)
      setEvidence(rows);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load evidence',
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
      crimeId: '',
      type: '',
    });
  };

  const applyFilters = () => {
    loadEvidence();
  };

  const handleAdd = () => {
    setEditingEvidence(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({ crimeId: '', type: '', description: '', dateCollected: today });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingEvidence(item);
    setFormData({
      crimeId: item.CRIME_ID || item.Crime_ID || item.crime_id || '',
      type: item.TYPE || item.Type || item.type || '',
      description: item.DESCRIPTION || item.Description || item.description || '',
      dateCollected: item.DATE_COLLECTED || item.Date_Collected || item.date_collected || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id, crimeStatus) => {
    // Check if crime is under investigation
    if (crimeStatus === 'Under Investigation') {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete Evidence',
        text: 'Evidence linked to crimes under investigation cannot be deleted. You can only edit it.',
      });
      return;
    }

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
        await evidenceAPI.delete(id);
        Swal.fire('Deleted!', 'Evidence has been deleted.', 'success');
        loadEvidence();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete evidence', 'error');
      }
    }
  };

  const handleUpdateChain = async (item) => {
    const evidenceId = item.EVIDENCE_ID || item.Evidence_ID || item.evidence_id;
    const { value: formValues } = await Swal.fire({
      title: '🔗 Update Chain of Custody',
      html: `
        <div style="text-align: left;">
          <p style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <strong>Evidence ID:</strong> #${evidenceId}
          </p>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Action *</label>
            <select id="action" class="swal2-select" style="width: 100%;">
              <option value="">Select action</option>
              <option value="COLLECTED">Collected</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="ANALYZED">Analyzed</option>
              <option value="STORED">Stored</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notes *</label>
            <textarea id="notes" class="swal2-textarea" placeholder="Enter custody chain notes..." style="width: 100%; min-height: 100px;"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Chain',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      width: '500px',
      preConfirm: () => {
        const action = document.getElementById('action').value;
        const notes = document.getElementById('notes').value;

        if (!action || !notes) {
          Swal.showValidationMessage('Action and notes are required');
          return false;
        }

        return { action, notes };
      }
    });

    if (formValues) {
      try {
        await enhancedEvidenceAPI.updateChain(evidenceId, formValues.action, formValues.notes);
        Swal.fire({
          icon: 'success',
          title: 'Chain of Custody Updated!',
          text: 'Evidence chain has been updated successfully.',
          confirmButtonColor: '#667eea'
        });
        loadEvidence();
      } catch (error) {
        console.error('Failed to update chain:', error);
        Swal.fire('Error!', error.message || 'Failed to update chain of custody', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const collectedBy = user.id || user.userId || null;
      const payload = {
        crimeId: formData.crimeId ? parseInt(formData.crimeId) : null,
        type: formData.type,
        description: formData.description,
        collectedBy,
        dateCollected: formData.dateCollected || null,
      };
      if (editingEvidence) {
        const evidenceId = editingEvidence.EVIDENCE_ID || editingEvidence.Evidence_ID || editingEvidence.evidence_id;
        await evidenceAPI.update(evidenceId, payload);
        Swal.fire('Success!', 'Evidence updated.', 'success');
      } else {
        await evidenceAPI.create(payload);
        Swal.fire('Success!', 'Evidence created.', 'success');
      }
      setShowForm(false);
      setEditingEvidence(null);
      loadEvidence();
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to save evidence', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading evidence...</p>
      </div>
    );
  }

  return (
    <div className="crimes-container">
      <div className="page-header">
        <h2 className="page-title">📦 Evidence Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Evidence
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Filter by Crime ID</label>
            <input
              type="number"
              name="crimeId"
              value={searchFilters.crimeId}
              onChange={handleFilterChange}
              placeholder="Enter Crime ID..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Filter by Evidence Type</label>
            <select
              name="type"
              value={searchFilters.type}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Types</option>
              <option value="Fingerprint">Fingerprint</option>
              <option value="Weapon">Weapon</option>
              <option value="CCTV Footage">CCTV Footage</option>
              <option value="DNA">DNA</option>
              <option value="Document">Document</option>
              <option value="Digital">Digital</option>
              <option value="Other">Other</option>
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
                <th>Type</th>
                <th>Description</th>
                <th>Crime ID</th>
                <th>Crime Description</th>
                <th>Collected By</th>
                <th>Date Collected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evidence.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>No evidence found. Click "Add Evidence" to get started.</p>
                  </td>
                </tr>
              ) : (
                evidence.map((item) => {
                  const evidenceId = item.EVIDENCE_ID || item.Evidence_ID || item.evidence_id;
                  const evidenceType = item.TYPE || item.Type || item.type;
                  const description = item.DESCRIPTION || item.Description || item.description || '';
                  const crimeId = item.CRIME_ID || item.Crime_ID || item.crime_id;
                  const crimeDescription = item.CRIME_DESCRIPTION || item.Crime_Description || item.crime_description || '';
                  const crimeStatus = item.CRIME_STATUS || item.Crime_Status || item.crime_status || '';
                  const officerName = item.COLLECTED_BY_NAME || item.Collected_By_Name || item.collected_by_name || 'N/A';
                  const collectedDate = item.DATE_COLLECTED || item.Date_Collected || item.date_collected;
                  const isUnderInvestigation = crimeStatus === 'Under Investigation';
                  
                  return (
                    <tr key={evidenceId}>
                      <td>
                        <span style={{ 
                          background: '#e3f2fd', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          #{evidenceId || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          background: '#fff3cd', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          {evidenceType || 'N/A'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        {description ? (
                          <>
                            {description.substring(0, 50)}
                            {description.length > 50 ? '...' : ''}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          background: '#d1ecf1', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          #{crimeId || 'N/A'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px' }}>
                        {crimeDescription ? (
                          <>
                            {crimeDescription.substring(0, 40)}
                            {crimeDescription.length > 40 ? '...' : ''}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>{officerName}</td>
                      <td>{formatDate(collectedDate)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-info btn-sm" 
                            onClick={() => handleUpdateChain(item)}
                            title="Update chain of custody"
                          >
                            🔗 Chain
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEdit(item)}
                            title="Edit evidence details"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDelete(evidenceId, crimeStatus)}
                            disabled={isUnderInvestigation}
                            title={isUnderInvestigation ? 'Cannot delete evidence for crimes under investigation' : 'Delete evidence'}
                            style={{ opacity: isUnderInvestigation ? 0.5 : 1, cursor: isUnderInvestigation ? 'not-allowed' : 'pointer' }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
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
              <h3 className="modal-title">{editingEvidence ? 'Edit Evidence' : 'Add Evidence'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Crime ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.crimeId}
                    onChange={(e) => setFormData({ ...formData, crimeId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  >
                    <option value="">Select Evidence Type</option>
                    <option value="Fingerprint">Fingerprint</option>
                    <option value="Weapon">Weapon</option>
                    <option value="CCTV Footage">CCTV Footage</option>
                    <option value="DNA">DNA</option>
                    <option value="Document">Document</option>
                    <option value="Digital">Digital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Detailed description of the evidence..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date Collected *</label>
                  <input
                    type="date"
                    value={formData.dateCollected}
                    onChange={(e) => setFormData({ ...formData, dateCollected: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    Will be automatically assigned to you (Officer ID from your session)
                  </small>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvidence ? 'Update Evidence' : 'Create Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evidence;

