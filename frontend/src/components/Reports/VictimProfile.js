import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { victimAPI } from '../../services/api';
import Header from '../Dashboard/Header';
import './Reports.css';

const VictimProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contactInfo: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await victimAPI.getProfile();
      console.log('👤 Profile loaded:', response.data);
      setProfile(response.data);
      setFormData({
        name: response.data.NAME || '',
        age: response.data.AGE || '',
        gender: response.data.GENDER || '',
        contactInfo: response.data.CONTACT_INFO || '',
        address: response.data.ADDRESS || '',
        email: response.data.EMAIL || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Swal.fire('Error!', error.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await victimAPI.updateProfile(formData);
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonColor: '#667eea'
      });
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire('Error!', error.message || 'Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: profile.NAME || '',
      age: profile.AGE || '',
      gender: profile.GENDER || '',
      contactInfo: profile.CONTACT_INFO || '',
      address: profile.ADDRESS || '',
      email: profile.EMAIL || ''
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <div>
            <h2 className="page-title">👤 My Profile</h2>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>
              View and update your personal information
            </p>
          </div>
          {!editing && (
            <button 
              onClick={() => setEditing(true)} 
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Profile Header */}
            <div style={{
              textAlign: 'center',
              paddingBottom: '30px',
              borderBottom: '2px solid #f0f0f0',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '48px',
                color: 'white'
              }}>
                {(formData.name || 'V').charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#333' }}>
                {formData.name || 'Victim User'}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Victim ID: #{profile?.VICTIM_ID || 'N/A'}
              </p>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        min="0"
                        max="150"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      placeholder="Phone number"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="3"
                      placeholder="Full address"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Email (Read-only)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        background: '#f5f5f5',
                        cursor: 'not-allowed'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      Email cannot be changed. Contact support if you need to update your email.
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '14px', fontSize: '16px' }}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '14px', fontSize: '16px' }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gap: '25px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Full Name
                    </div>
                    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
                      {profile?.NAME || 'Not provided'}
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Age
                    </div>
                    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
                      {profile?.AGE || 'Not provided'}
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Gender
                    </div>
                    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
                      {profile?.GENDER || 'Not provided'}
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Contact
                    </div>
                    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
                      {profile?.CONTACT_INFO || 'Not provided'}
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #667eea',
                    gridColumn: 'span 2'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Address
                    </div>
                    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
                      {profile?.ADDRESS || 'Not provided'}
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #667eea',
                    gridColumn: 'span 2'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Email
                    </div>
                    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
                      {profile?.EMAIL || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictimProfile;
