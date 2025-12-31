import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { crimeTypesAPI } from '../../services/api';
import './Crimes.css';

const CrimeTypes = () => {
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    typeName: '',
    category: '',
    description: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    searchText: '',
    category: '',
  });

  useEffect(() => {
    loadCrimeTypes();
  }, []);

  const loadCrimeTypes = async () => {
    try {
      setLoading(true);
      const response = await crimeTypesAPI.getAll();
      const rows = response.data || response || [];
      // Sort by Type Name alphabetically
      rows.sort((a, b) => {
        const nameA = (a.TYPE_NAME || a.Type_Name || a.type_name || '').toLowerCase();
        const nameB = (b.TYPE_NAME || b.Type_Name || b.type_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setCrimeTypes(rows);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load crime types',
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
      category: '',
    });
  };

  const handleAdd = () => {
    setEditingType(null);
    setFormData({ typeName: '', category: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      typeName: type.TYPE_NAME || type.Type_Name || type.type_name || '',
      category: type.CATEGORY || type.Category || type.category || '',
      description: type.DESCRIPTION || type.Description || type.description || '',
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
        await crimeTypesAPI.delete(id);
        Swal.fire('Deleted!', 'Crime type has been deleted.', 'success');
        loadCrimeTypes();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete crime type', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        typeName: formData.typeName,
        category: formData.category,
        description: formData.description || null,
      };
      if (editingType) {
        const id = editingType.CRIME_TYPE_ID || editingType.Crime_Type_ID || editingType.crime_type_id;
        await crimeTypesAPI.update(id, payload);
        Swal.fire('Success!', 'Crime type updated.', 'success');
      } else {
        await crimeTypesAPI.create(payload);
        Swal.fire('Success!', 'Crime type created.', 'success');
      }
      setShowForm(false);
      setEditingType(null);
      loadCrimeTypes();
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to save crime type', 'error');
    }
  };

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(crimeTypes.map(ct => 
    ct.CATEGORY || ct.Category || ct.category
  ))].filter(Boolean).sort();

  // Category color mapping
  const getCategoryColor = (category) => {
    const colors = {
      'Violent': '#f8d7da',
      'Property': '#fff3cd',
      'Cyber': '#d1ecf1',
      'White_Collar': '#e2e3e5',
      'Drug_Related': '#f5c6cb',
      'Other': '#d4edda',
    };
    return colors[category] || '#e9ecef';
  };

  // Filter crime types based on search criteria
  const filteredCrimeTypes = crimeTypes.filter((type) => {
    const id = String(type.CRIME_TYPE_ID || type.Crime_Type_ID || type.crime_type_id || '').toLowerCase();
    const typeName = String(type.TYPE_NAME || type.Type_Name || type.type_name || '').toLowerCase();
    const category = String(type.CATEGORY || type.Category || type.category || '').toLowerCase();
    const description = String(type.DESCRIPTION || type.Description || type.description || '').toLowerCase();
    
    const searchText = searchFilters.searchText.toLowerCase();
    const textMatch = !searchText || 
      id.includes(searchText) || 
      typeName.includes(searchText) || 
      category.includes(searchText) ||
      description.includes(searchText);
    
    const categoryMatch = !searchFilters.category || category === searchFilters.category.toLowerCase();
    
    return textMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading crime types...</p>
      </div>
    );
  }

  return (
    <div className="crimes-container">
      <div className="page-header">
        <h2 className="page-title">🏷️ Crime Type Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Crime Type
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
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
              Search (ID, Type Name, Category, Description)
            </label>
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
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
              Filter by Category
            </label>
            <select
              name="category"
              value={searchFilters.category}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Showing <strong>{filteredCrimeTypes.length}</strong> of <strong>{crimeTypes.length}</strong> crime types
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrimeTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>
                      {searchFilters.searchText || searchFilters.category 
                        ? 'No crime types match your filters.' 
                        : 'No crime types found. Click "Add Crime Type" to get started.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCrimeTypes.map((type) => {
                  const typeId = type.CRIME_TYPE_ID || type.Crime_Type_ID || type.crime_type_id;
                  const typeName = type.TYPE_NAME || type.Type_Name || type.type_name;
                  const category = type.CATEGORY || type.Category || type.category;
                  const description = type.DESCRIPTION || type.Description || type.description || '';
                  
                  return (
                    <tr key={typeId}>
                      <td>
                        <span style={{ 
                          background: '#e3f2fd', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          #{typeId || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <strong>{typeName || 'N/A'}</strong>
                      </td>
                      <td>
                        <span style={{ 
                          background: getCategoryColor(category), 
                          padding: '5px 10px', 
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}>
                          {category || 'N/A'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        {description ? (
                          <>
                            {description.substring(0, 100)}
                            {description.length > 100 ? '...' : ''}
                          </>
                        ) : (
                          <span style={{ color: '#999' }}>No description</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEdit(type)}
                            title="Edit crime type details"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDelete(typeId)}
                            title="Delete crime type"
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
              <h3 className="modal-title">{editingType ? 'Edit Crime Type' : 'Add Crime Type'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Type Name *</label>
                  <input
                    type="text"
                    value={formData.typeName}
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                    required
                    placeholder="e.g., Robbery, Burglary, Fraud"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  >
                    <option value="">Select Category</option>
                    <option value="Violent">Violent</option>
                    <option value="Property">Property</option>
                    <option value="Cyber">Cyber</option>
                    <option value="White_Collar">White_Collar</option>
                    <option value="Drug_Related">Drug_Related</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of this crime type..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingType ? 'Update Crime Type' : 'Create Crime Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeTypes;

