import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { officersAPI } from '../../services/api';
import './Crimes.css';

const Officers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const response = await officersAPI.getAll();
      console.log('👮 Officers loaded:', response.data);
      setOfficers(response.data || []);
    } catch (error) {
      console.error('Failed to load officers:', error);
      Swal.fire('Error!', error.message || 'Failed to load officers', 'error');
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (officer) => {
    const detailsHtml = `
      <div style="text-align: left; max-height: 500px; overflow-y: auto;">
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">👮 Officer Information</h4>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <p><strong>Officer ID:</strong> #${officer.OFFICER_ID}</p>
            <p><strong>Name:</strong> ${officer.NAME}</p>
            <p><strong>Contact:</strong> ${officer.CONTACT_NO || 'N/A'}</p>
            <p><strong>Email:</strong> ${officer.EMAIL || 'N/A'}</p>
          </div>
        </div>
      </div>
    `;
    
    Swal.fire({
      title: officer.NAME,
      html: detailsHtml,
      width: '600px',
      confirmButtonText: 'Close',
      confirmButtonColor: '#667eea'
    });
  };

  const filteredOfficers = officers.filter(officer => {
    const search = searchTerm.toLowerCase();
    return (
      (officer.NAME || '').toLowerCase().includes(search) ||
      (officer.EMAIL || '').toLowerCase().includes(search) ||
      (officer.CONTACT_NO || '').toLowerCase().includes(search) ||
      (officer.OFFICER_ID || '').toString().includes(search)
    );
  });

  return (
    <div className="officers-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">👮 Officers Management</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            View all police officers in the system. Officers can only be added through signup.
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
              {officers.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Officers</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {officers.filter(o => o.EMAIL).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>With Email Access</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {officers.filter(o => o.CONTACT_NO).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>With Contact Info</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="🔍 Search by name, email, contact, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading officers...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Officer ID</th>
                    <th>Name</th>
                    <th>Contact Number</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ color: '#999', fontSize: '18px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '15px' }}>👮</div>
                          <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>
                            {searchTerm ? 'No officers found' : 'No officers in the system'}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px' }}>
                            {searchTerm ? 'Try adjusting your search' : 'Officers can register through the signup page'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <tr key={officer.OFFICER_ID}>
                        <td><strong>#{officer.OFFICER_ID}</strong></td>
                        <td>{officer.NAME}</td>
                        <td>{officer.CONTACT_NO || 'N/A'}</td>
                        <td>{officer.EMAIL || 'N/A'}</td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(officer)}
                            className="btn btn-sm btn-info"
                            title="View officer details"
                          >
                            👁️ View Details
                          </button>
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
  );
};

export default Officers;
