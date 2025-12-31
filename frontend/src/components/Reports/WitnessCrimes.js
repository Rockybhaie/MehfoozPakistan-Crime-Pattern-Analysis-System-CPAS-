import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { witnessAPI } from '../../services/api';
import Header from '../Dashboard/Header';
import './Reports.css';

const WitnessCrimes = () => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrimes();
  }, []);

  const loadCrimes = async () => {
    try {
      setLoading(true);
      const response = await witnessAPI.getMyCrimes();
      console.log('🔍 Witness crimes loaded:', response.data);
      setCrimes(response.data || []);
    } catch (error) {
      console.error('Failed to load crimes:', error);
      Swal.fire('Error!', error.message || 'Failed to load crimes', 'error');
      setCrimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (crime) => {
    const detailsHtml = `
      <div style="text-align: left; max-height: 500px; overflow-y: auto;">
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">🚨 Crime Information</h4>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <p><strong>Crime ID:</strong> #${crime.CRIME_ID}</p>
            <p><strong>Type:</strong> ${crime.TYPE_NAME} (${crime.CATEGORY})</p>
            <p><strong>Date Occurred:</strong> ${crime.DATE_OCCURRED}</p>
            <p><strong>Status:</strong> <span style="color: ${
              crime.STATUS === 'Solved' ? 'green' : 
              crime.STATUS === 'Under Investigation' ? 'orange' : '#666'
            };">${crime.STATUS}</span></p>
            <p><strong>Severity:</strong> ${crime.SEVERITY_LEVEL || 'N/A'}</p>
            <p><strong>Officer:</strong> ${crime.OFFICER_NAME || 'Not assigned'}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">📍 Location</h4>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <p><strong>City:</strong> ${crime.CITY || 'N/A'}</p>
            <p><strong>Area:</strong> ${crime.AREA || 'N/A'}</p>
            <p><strong>Street:</strong> ${crime.STREET || 'N/A'}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">📝 Crime Description</h4>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
            ${crime.DESCRIPTION || 'No description available'}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">👁️ Your Witness Statement</h4>
          <div style="background: ${crime.STATEMENT_TEXT ? '#e8f5e9' : '#fff3cd'}; padding: 15px; border-radius: 8px; border-left: 4px solid ${crime.STATEMENT_TEXT ? '#4caf50' : '#ffc107'};">
            ${crime.IS_KEY_WITNESS ? '<p style="margin: 0 0 10px 0; color: #d32f2f; font-weight: bold;">🌟 KEY WITNESS</p>' : ''}
            ${crime.STATEMENT_DATE ? `<p><strong>Statement Date:</strong> ${crime.STATEMENT_DATE}</p>` : ''}
            ${crime.STATEMENT_TEXT ? 
              `<p><strong>Statement:</strong></p><div style="white-space: pre-wrap; margin-top: 10px;">${crime.STATEMENT_TEXT}</div>` : 
              '<p style="margin: 0; color: #856404;">⚠️ No statement provided yet.</p>'
            }
          </div>
        </div>
      </div>
    `;
    
    Swal.fire({
      title: `Crime #${crime.CRIME_ID}`,
      html: detailsHtml,
      width: '750px',
      confirmButtonText: 'Close',
      confirmButtonColor: '#667eea'
    });
  };

  const handleAddUpdateStatement = async (crime) => {
    const { value: statementText } = await Swal.fire({
      title: crime.STATEMENT_TEXT ? '✏️ Update Your Statement' : '📝 Add Your Statement',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
            Crime ID: <strong>#${crime.CRIME_ID}</strong> - ${crime.TYPE_NAME}
          </p>
          <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
            ${crime.IS_KEY_WITNESS === 1 ? '<span style="color: #f57c00;">🌟 You are a KEY WITNESS in this case</span>' : 'Provide a detailed account of what you witnessed'}
          </p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Your Statement',
      inputPlaceholder: 'Describe what you witnessed in detail...',
      inputValue: crime.STATEMENT_TEXT || '',
      inputAttributes: {
        'aria-label': 'Type your witness statement here',
        style: 'min-height: 150px; font-size: 14px;'
      },
      showCancelButton: true,
      confirmButtonText: crime.STATEMENT_TEXT ? 'Update Statement' : 'Submit Statement',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please provide a statement!';
        }
        if (value.trim().length < 20) {
          return 'Statement must be at least 20 characters long';
        }
      }
    });

    if (statementText) {
      try {
        await witnessAPI.updateStatement(crime.CRIME_ID, statementText.trim());
        Swal.fire({
          icon: 'success',
          title: 'Statement Submitted!',
          text: 'Your witness statement has been recorded successfully.',
          confirmButtonColor: '#667eea'
        });
        loadCrimes(); // Reload to show updated statement
      } catch (error) {
        console.error('Failed to submit statement:', error);
        Swal.fire('Error!', error.message || 'Failed to submit statement', 'error');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('solved')) return 'status-solved';
    if (statusLower.includes('investigation')) return 'status-investigating';
    if (statusLower.includes('unsolved')) return 'status-unsolved';
    return 'status-pending';
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <div>
            <h2 className="page-title">👁️ My Witness Cases</h2>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>
              View crimes you witnessed and manage your statements
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {crimes.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Cases</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {crimes.filter(c => c.IS_KEY_WITNESS === 1).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Key Witness Cases</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {crimes.filter(c => (c.STATUS || '').toLowerCase().includes('investigation')).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Under Investigation</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {crimes.filter(c => (c.STATUS || '').toLowerCase().includes('solved')).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Solved Cases</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your cases...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Crime ID</th>
                    <th>Type</th>
                    <th>Date Occurred</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Your Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crimes.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ color: '#999', fontSize: '18px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '15px' }}>👁️</div>
                          <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>No cases found</p>
                          <p style={{ margin: 0, fontSize: '14px' }}>You haven't been linked to any crimes yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    crimes.map((crime) => (
                      <tr key={crime.CRIME_ID}>
                        <td><strong>#{crime.CRIME_ID}</strong></td>
                        <td>
                          <div>{crime.TYPE_NAME}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{crime.CATEGORY}</div>
                        </td>
                        <td>{crime.DATE_OCCURRED}</td>
                        <td>
                          {crime.CITY || 'N/A'}
                          {crime.AREA && <div style={{ fontSize: '12px', color: '#666' }}>{crime.AREA}</div>}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(crime.STATUS)}`}>
                            {crime.STATUS}
                          </span>
                        </td>
                        <td>
                          {crime.IS_KEY_WITNESS === 1 ? (
                            <span style={{
                              background: '#fff3e0',
                              color: '#f57c00',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              🌟 KEY WITNESS
                            </span>
                          ) : (
                            <span style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              Witness
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewDetails(crime)}
                              className="btn btn-sm btn-info"
                              title="View full crime details and your statement"
                            >
                              📄 View
                            </button>
                            <button
                              onClick={() => handleAddUpdateStatement(crime)}
                              className="btn btn-sm btn-primary"
                              title={crime.STATEMENT_TEXT ? "Update your statement" : "Add your statement"}
                              style={{
                                background: crime.STATEMENT_TEXT ? '#4caf50' : '#667eea',
                                borderColor: crime.STATEMENT_TEXT ? '#4caf50' : '#667eea'
                              }}
                            >
                              {crime.STATEMENT_TEXT ? '✏️ Update' : '📝 Add'} Statement
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WitnessCrimes;
