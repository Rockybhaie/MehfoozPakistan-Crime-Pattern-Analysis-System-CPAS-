import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { locationsAPI } from '../../services/api';
import './Crimes.css';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    area: '',
    street: '',
    latitude: '',
    longitude: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    searchText: '',
    city: '',
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getAll();
      const rows = response.data || response || [];
      // Sort by City, then Area
      rows.sort((a, b) => {
        const cityA = (a.CITY || a.City || a.city || '').toLowerCase();
        const cityB = (b.CITY || b.City || b.city || '').toLowerCase();
        if (cityA !== cityB) return cityA.localeCompare(cityB);
        const areaA = (a.AREA || a.Area || a.area || '').toLowerCase();
        const areaB = (b.AREA || b.Area || b.area || '').toLowerCase();
        return areaA.localeCompare(areaB);
      });
      setLocations(rows);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load locations',
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
      searchText: '',
      city: '',
    });
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({ city: '', area: '', street: '', latitude: '', longitude: '' });
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      city: location.CITY || location.City || location.city || '',
      area: location.AREA || location.Area || location.area || '',
      street: location.STREET || location.Street || location.street || '',
      latitude: location.LATITUDE || location.Latitude || location.latitude || '',
      longitude: location.LONGITUDE || location.Longitude || location.longitude || '',
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
        await locationsAPI.delete(id);
        Swal.fire('Deleted!', 'Location has been deleted.', 'success');
        loadLocations();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete location', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        city: formData.city,
        area: formData.area || null,
        street: formData.street || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      if (editingLocation) {
        const id = editingLocation.LOCATION_ID || editingLocation.Location_ID || editingLocation.location_id;
        await locationsAPI.update(id, payload);
        Swal.fire('Success!', 'Location updated.', 'success');
      } else {
        await locationsAPI.create(payload);
        Swal.fire('Success!', 'Location created.', 'success');
      }
      setShowForm(false);
      setEditingLocation(null);
      loadLocations();
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to save location', 'error');
    }
  };

  // Get unique cities for filter dropdown
  const uniqueCities = [...new Set(locations.map(l => 
    l.CITY || l.City || l.city
  ))].filter(Boolean).sort();

  // Filter locations based on search criteria
  const filteredLocations = locations.filter((location) => {
    const id = String(location.LOCATION_ID || location.Location_ID || location.location_id || '').toLowerCase();
    const city = String(location.CITY || location.City || location.city || '').toLowerCase();
    const area = String(location.AREA || location.Area || location.area || '').toLowerCase();
    const street = String(location.STREET || location.Street || location.street || '').toLowerCase();
    
    const searchText = searchFilters.searchText.toLowerCase();
    const textMatch = !searchText || 
      id.includes(searchText) || 
      city.includes(searchText) || 
      area.includes(searchText) || 
      street.includes(searchText);
    
    const cityMatch = !searchFilters.city || city === searchFilters.city.toLowerCase();
    
    return textMatch && cityMatch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="crimes-container">
      <div className="page-header">
        <h2 className="page-title">📍 Location Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Location
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
          <button onClick={clearFilters} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
            Clear Filters
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Search (ID, City, Area, Street)</label>
            <input
              type="text"
              name="searchText"
              value={searchFilters.searchText}
              onChange={handleFilterChange}
              placeholder="Type to search..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Filter by City</label>
            <select
              name="city"
              value={searchFilters.city}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Showing <strong>{filteredLocations.length}</strong> of <strong>{locations.length}</strong> locations
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>City</th>
                <th>Area</th>
                <th>Street</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>
                      {searchFilters.searchText || searchFilters.city 
                        ? 'No locations match your filters.' 
                        : 'No locations found. Click "Add Location" to get started.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => {
                  const locationId = location.LOCATION_ID || location.Location_ID || location.location_id;
                  const city = location.CITY || location.City || location.city;
                  const area = location.AREA || location.Area || location.area;
                  const street = location.STREET || location.Street || location.street;
                  const latitude = location.LATITUDE || location.Latitude || location.latitude;
                  const longitude = location.LONGITUDE || location.Longitude || location.longitude;
                  
                  return (
                    <tr key={locationId}>
                      <td>
                        <span style={{ 
                          background: '#e3f2fd', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          #{locationId || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          background: '#fff3cd', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {city || 'N/A'}
                        </span>
                      </td>
                      <td>{area || 'N/A'}</td>
                      <td>{street || 'N/A'}</td>
                      <td>
                        {latitude && longitude ? (
                          <span style={{ 
                            background: '#d1ecf1', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}>
                            {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.9rem' }}>Not set</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEdit(location)}
                            title="Edit location details"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDelete(locationId)}
                            title="Delete location"
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
              <h3 className="modal-title">{editingLocation ? 'Edit Location' : 'Add Location'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    placeholder="e.g., Karachi"
                  />
                </div>
                <div className="form-group">
                  <label>Area *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                    placeholder="e.g., Gulshan-e-Iqbal"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street *</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                  placeholder="e.g., Block 13-D, Main University Road"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude (Optional)</label>
                  <input
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 24.9056"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    Range: -90 to 90
                  </small>
                </div>
                <div className="form-group">
                  <label>Longitude (Optional)</label>
                  <input
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., 67.0822"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    Range: -180 to 180
                  </small>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;

