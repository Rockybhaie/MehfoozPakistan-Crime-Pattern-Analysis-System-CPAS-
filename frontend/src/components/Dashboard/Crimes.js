import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { crimesAPI, crimeTypesAPI, suspectsAPI, victimsAPI, witnessesAPI } from '../../services/api';
import CrimeForm from './CrimeForm';
import './Crimes.css';

const Crimes = () => {
  const [crimes, setCrimes] = useState([]);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCrime, setEditingCrime] = useState(null);
  const [crimeTypes, setCrimeTypes] = useState([]);
  
  // Get officer info from localStorage
  const getOfficerInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (e) {
      return null;
    }
  };
  
  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    crimeId: '',
    crimeType: '',
    status: '',
    severityLevel: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    dayOfWeek: '',
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('dateOccurred'); // 'crimeId', 'dateOccurred', 'severity'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  useEffect(() => {
    loadCrimes();
    loadCrimeTypes();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crimes, searchFilters, sortBy, sortOrder]);

  const loadCrimes = async () => {
    try {
      setLoading(true);
      const response = await crimesAPI.getAll();
      setCrimes(response.data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load crimes',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...crimes];

    // Apply filters
    if (searchFilters.crimeId) {
      filtered = filtered.filter(crime => {
        const id = crime.CRIME_ID || crime.Crime_ID || crime.crime_id;
        return String(id).includes(searchFilters.crimeId);
      });
    }

    if (searchFilters.crimeType) {
      filtered = filtered.filter(crime => {
        const type = crime.TYPE_NAME || crime.Type_Name || crime.type_name || '';
        return type.toLowerCase().includes(searchFilters.crimeType.toLowerCase());
      });
    }

    if (searchFilters.status) {
      filtered = filtered.filter(crime => {
        const status = crime.STATUS || crime.Status || crime.status || '';
        return status.toLowerCase() === searchFilters.status.toLowerCase();
      });
    }

    if (searchFilters.severityLevel) {
      filtered = filtered.filter(crime => {
        const severity = crime.SEVERITY_LEVEL || crime.Severity_Level || crime.severity_level || '';
        return severity.toLowerCase() === searchFilters.severityLevel.toLowerCase();
      });
    }

    if (searchFilters.dateFrom) {
      filtered = filtered.filter(crime => {
        const date = crime.DATE_OCCURRED || crime.Date_Occurred || crime.date_occurred;
        return date && new Date(date) >= new Date(searchFilters.dateFrom);
      });
    }

    if (searchFilters.dateTo) {
      filtered = filtered.filter(crime => {
        const date = crime.DATE_OCCURRED || crime.Date_Occurred || crime.date_occurred;
        return date && new Date(date) <= new Date(searchFilters.dateTo);
      });
    }

    if (searchFilters.location) {
      filtered = filtered.filter(crime => {
        const city = crime.CITY || crime.City || crime.city || '';
        const area = crime.AREA || crime.Area || crime.area || '';
        const locationStr = `${city} ${area}`.toLowerCase();
        return locationStr.includes(searchFilters.location.toLowerCase());
      });
    }

    if (searchFilters.dayOfWeek) {
      filtered = filtered.filter(crime => {
        const day = crime.DAY_OF_WEEK || crime.Day_Of_Week || crime.day_of_week || '';
        return day.toLowerCase() === searchFilters.dayOfWeek.toLowerCase();
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'crimeId') {
        aValue = a.CRIME_ID || a.Crime_ID || a.crime_id || 0;
        bValue = b.CRIME_ID || b.Crime_ID || b.crime_id || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortBy === 'dateOccurred') {
        aValue = new Date(a.DATE_OCCURRED || a.Date_Occurred || a.date_occurred || 0);
        bValue = new Date(b.DATE_OCCURRED || b.Date_Occurred || b.date_occurred || 0);
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortBy === 'severity') {
        const severityOrder = { 'Critical': 4, 'Major': 3, 'Moderate': 2, 'Minor': 1 };
        aValue = severityOrder[a.SEVERITY_LEVEL || a.Severity_Level || a.severity_level || ''] || 0;
        bValue = severityOrder[b.SEVERITY_LEVEL || b.Severity_Level || b.severity_level || ''] || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredCrimes(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      crimeId: '',
      crimeType: '',
      status: '',
      severityLevel: '',
      dateFrom: '',
      dateTo: '',
      location: '',
      dayOfWeek: '',
    });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'crimeId-asc' || value === 'crimeId-desc') {
      setSortBy('crimeId');
      setSortOrder(value === 'crimeId-asc' ? 'asc' : 'desc');
    } else if (value === 'date-asc' || value === 'date-desc') {
      setSortBy('dateOccurred');
      setSortOrder(value === 'date-asc' ? 'asc' : 'desc');
    } else if (value === 'severity-asc' || value === 'severity-desc') {
      setSortBy('severity');
      setSortOrder(value === 'severity-asc' ? 'asc' : 'desc');
    }
  };

  const loadCrimeTypes = async () => {
    try {
      const response = await crimeTypesAPI.getAll();
      setCrimeTypes(response.data || []);
    } catch (error) {
      console.error('Failed to load crime types:', error);
    }
  };

  const handleAdd = () => {
    setEditingCrime(null);
    setShowForm(true);
  };

  const handleEdit = (crime) => {
    setEditingCrime(crime);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await crimesAPI.delete(id);
        Swal.fire('Deleted!', 'Crime has been deleted.', 'success');
        loadCrimes();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete crime', 'error');
      }
    }
  };

  const handleQuickStatusUpdate = async (crime) => {
    const crimeId = crime.CRIME_ID || crime.Crime_ID || crime.crime_id;
    const currentStatus = crime.STATUS || crime.Status || crime.status || 'Open';

    const { value: newStatus } = await Swal.fire({
      title: `Update Crime #${crimeId} Status`,
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 15px;"><strong>Current Status:</strong> <span style="color: #667eea;">${currentStatus}</span></p>
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">New Status</label>
          <select id="status" class="swal2-select" style="width: 100%;">
            <option value="Open" ${currentStatus === 'Open' ? 'selected' : ''}>Open</option>
            <option value="Under Investigation" ${currentStatus === 'Under Investigation' ? 'selected' : ''}>Under Investigation</option>
            <option value="Closed" ${currentStatus === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Status',
      confirmButtonColor: '#325a77',
      cancelButtonColor: '#6c757d',
      focusConfirm: false,
      preConfirm: () => {
        return document.getElementById('status').value;
      }
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        await crimesAPI.update(crimeId, { status: newStatus });
        
        // If status changed to "Under Investigation", offer to create/link investigation
        if (newStatus === 'Under Investigation') {
          const createInvResult = await Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            html: `
              <p>Crime status changed to "Under Investigation"</p>
              <p style="margin-top: 15px;"><strong>Would you like to create an investigation for this crime?</strong></p>
              <p style="font-size: 14px; color: #666;">This will make the crime visible in the Investigations dashboard.</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Yes, Create Investigation',
            cancelButtonText: 'No, Just Update Status',
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d'
          });
          
          if (createInvResult.isConfirmed) {
            // Get current investigations count for auto-numbering
            let investigationsCount = 0;
            try {
              const { investigationsAPI } = await import('../../services/api');
              const allInvestigations = await investigationsAPI.getAll();
              investigationsCount = allInvestigations.data ? allInvestigations.data.length : 0;
            } catch (e) {
              console.error('Failed to get investigations count:', e);
            }

            // Generate auto case number
            const year = new Date().getFullYear();
            const nextNumber = String(investigationsCount + 1).padStart(3, '0');
            const autoCaseNumber = `INV-${year}-${nextNumber}`;

            // Prompt for investigation details
            const { value: formValues } = await Swal.fire({
              title: 'Create Investigation',
              html: `
                <div style="text-align: left;">
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Investigation ID</label>
                    <input class="swal2-input" value="Auto-generated" disabled style="width: 90%; margin: 0; background: #f0f0f0;">
                  </div>
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Case Number *</label>
                    <input id="caseNumber" class="swal2-input" value="${autoCaseNumber}" style="width: 90%; margin: 0;">
                    <small style="color: #666; font-size: 12px;">Auto-generated. You can modify if needed.</small>
                  </div>
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notes</label>
                    <textarea id="notes" class="swal2-textarea" placeholder="Investigation notes..." style="width: 90%; margin: 0; min-height: 80px;">Investigation opened for Crime #${crimeId}</textarea>
                  </div>
                </div>
              `,
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: 'Create & Link',
              confirmButtonColor: '#667eea',
              preConfirm: () => {
                const caseNumber = document.getElementById('caseNumber').value;
                const notes = document.getElementById('notes').value;
                
                if (!caseNumber) {
                  Swal.showValidationMessage('Case Number is required');
                  return false;
                }
                
                return { caseNumber, notes };
              }
            });
            
            if (formValues) {
              try {
                // Import investigationsAPI
                const { investigationsAPI } = await import('../../services/api');
                
                // Create investigation - backend will auto-generate case number
                const result = await investigationsAPI.create({
                  caseNumber: formValues.caseNumber,
                  startDate: new Date().toISOString().split('T')[0],
                  status: 'Active',
                  outcome: 'Pending',
                  notes: formValues.notes
                });
                
                // Use the investigation ID returned by backend (no need to search)
                const investigationId = result.investigationId;
                const actualCaseNumber = result.caseNumber;
                
                // Link crime to investigation using the returned ID
                await investigationsAPI.linkCrime(investigationId, crimeId);
                
                Swal.fire({
                  icon: 'success',
                  title: 'Investigation Created!',
                  html: `
                    <p>Investigation "${actualCaseNumber}" has been created and linked to Crime #${crimeId}</p>
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">You can view it in the Investigations dashboard.</p>
                  `,
                  confirmButtonColor: '#325a77'
                });
              } catch (error) {
                Swal.fire('Error!', error.message || 'Failed to create investigation', 'error');
              }
            }
          }
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            text: `Crime status changed to "${newStatus}"`,
            confirmButtonColor: '#325a77'
          });
        }
        
        loadCrimes();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to update status', 'error');
      }
    }
  };

  // Enhanced link actions with better UI
  const handleLinkSuspect = async (crimeId) => {
    // First, get all suspects
    let allSuspects = [];
    try {
      const suspectsData = await suspectsAPI.getAll();
      allSuspects = suspectsData.data || [];
    } catch (err) {
      Swal.fire('Error!', 'Failed to load suspects list', 'error');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Link Suspect to Crime',
      html:
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Select Suspect (type to search)</b></label>' +
        '<input list="suspects-list" id="swal-input1" class="swal2-input" placeholder="Search and select suspect..." style="margin: 0 0 15px 0;">' +
        '<datalist id="suspects-list">' +
        allSuspects.map(s => `<option value="${s.SUSPECT_ID || s.Suspect_ID}" data-name="${s.NAME || s.Name}">${s.NAME || s.Name} (ID: ${s.SUSPECT_ID || s.Suspect_ID})</option>`).join('') +
        '</datalist>' +
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Role</b></label>' +
        '<select id="swal-input2" class="swal2-select" style="margin: 0 0 15px 0; width: 100%; padding: 10px;">' +
        '<option value="Primary Suspect">Primary Suspect</option>' +
        '<option value="Accomplice">Accomplice</option>' +
        '<option value="Person of Interest">Person of Interest</option>' +
        '</select>' +
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Arrest Status</b></label>' +
        '<select id="swal-input3" class="swal2-select" style="margin: 0 0 15px 0; width: 100%; padding: 10px;">' +
        '<option value="Pending">Pending</option>' +
        '<option value="Arrested">Arrested</option>' +
        '<option value="Released">Released</option>' +
        '<option value="Cleared">Cleared</option>' +
        '</select>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Link Suspect',
      preConfirm: () => {
        const suspectId = document.getElementById('swal-input1').value;
        const role = document.getElementById('swal-input2').value;
        const arrestStatus = document.getElementById('swal-input3').value;
        if (!suspectId) {
          Swal.showValidationMessage('Please select a suspect');
          return false;
        }
        return { suspectId: parseInt(suspectId), role, arrestStatus };
      }
    });

    if (formValues) {
      try {
        await crimesAPI.linkSuspect(crimeId, formValues.suspectId, formValues.role, formValues.arrestStatus);
        Swal.fire('Success!', 'Suspect linked to crime successfully.', 'success');
        loadCrimes();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to link suspect', 'error');
      }
    }
  };

  const handleLinkVictim = async (crimeId) => {
    // First, get all victims
    let allVictims = [];
    try {
      const victimsData = await victimsAPI.getAll();
      allVictims = victimsData.data || [];
    } catch (err) {
      Swal.fire('Error!', 'Failed to load victims list', 'error');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Link Victim to Crime',
      html:
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Select Victim (type to search)</b></label>' +
        '<input list="victims-list" id="swal-input1" class="swal2-input" placeholder="Search and select victim..." style="margin: 0 0 15px 0;">' +
        '<datalist id="victims-list">' +
        allVictims.map(v => `<option value="${v.VICTIM_ID || v.Victim_ID}" data-name="${v.NAME || v.Name}">${v.NAME || v.Name} (ID: ${v.VICTIM_ID || v.Victim_ID})</option>`).join('') +
        '</datalist>' +
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Injury Severity</b></label>' +
        '<select id="swal-input2" class="swal2-select" style="margin: 0 0 15px 0; width: 100%; padding: 10px;">' +
        '<option value="None">None</option>' +
        '<option value="Minor">Minor</option>' +
        '<option value="Serious">Serious</option>' +
        '<option value="Fatal">Fatal</option>' +
        '<option value="Unknown">Unknown</option>' +
        '</select>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Link Victim',
      preConfirm: () => {
        const victimId = document.getElementById('swal-input1').value;
        const injurySeverity = document.getElementById('swal-input2').value;
        if (!victimId) {
          Swal.showValidationMessage('Please select a victim');
          return false;
        }
        return { victimId: parseInt(victimId), injurySeverity };
      }
    });

    if (formValues) {
      try {
        await crimesAPI.linkVictim(crimeId, formValues.victimId, formValues.injurySeverity);
        Swal.fire('Success!', 'Victim linked to crime successfully.', 'success');
        loadCrimes();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to link victim', 'error');
      }
    }
  };

  const handleLinkWitness = async (crimeId) => {
    // First, get all witnesses
    let allWitnesses = [];
    try {
      const witnessesData = await witnessesAPI.getAll();
      allWitnesses = witnessesData.data || [];
    } catch (err) {
      Swal.fire('Error!', 'Failed to load witnesses list', 'error');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Link Witness to Crime',
      html:
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Select Witness (type to search)</b></label>' +
        '<input list="witnesses-list" id="swal-input1" class="swal2-input" placeholder="Search and select witness..." style="margin: 0 0 15px 0;">' +
        '<datalist id="witnesses-list">' +
        allWitnesses.map(w => `<option value="${w.WITNESS_ID || w.Witness_ID}" data-name="${w.NAME || w.Name}">${w.NAME || w.Name} (ID: ${w.WITNESS_ID || w.Witness_ID})</option>`).join('') +
        '</datalist>' +
        '<label style="display: block; margin-bottom: 10px; text-align: left;"><b>Statement Text</b></label>' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="Enter witness statement (optional)" style="margin: 0 0 15px 0; min-height: 80px;"></textarea>' +
        '<label style="display: flex; align-items: center; margin-bottom: 10px; text-align: left;"><input id="swal-input3" type="checkbox" style="margin-right: 8px; width: auto;"> <b>Mark as Key Witness</b></label>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Link Witness',
      preConfirm: () => {
        const witnessId = document.getElementById('swal-input1').value;
        const statementText = document.getElementById('swal-input2').value || null;
        const isKeyWitness = document.getElementById('swal-input3').checked;
        if (!witnessId) {
          Swal.showValidationMessage('Please select a witness');
          return false;
        }
        return { 
          witnessId: parseInt(witnessId), 
          statementText, 
          isKeyWitness,
          statementDate: new Date().toISOString().split('T')[0]
        };
      }
    });

    if (formValues) {
      try {
        await crimesAPI.linkWitness(
          crimeId, 
          formValues.witnessId, 
          formValues.statementDate, 
          formValues.statementText, 
          formValues.isKeyWitness
        );
        Swal.fire('Success!', 'Witness linked to crime successfully.', 'success');
        loadCrimes();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to link witness', 'error');
      }
    }
  };

  // View linked entities per crime (suspects/victims/witnesses)
  const [expandedCrime, setExpandedCrime] = useState(null);
  const [crimeDetailsCache, setCrimeDetailsCache] = useState({});

  const toggleCrimeDetails = async (crimeId) => {
    if (expandedCrime === crimeId) {
      setExpandedCrime(null);
      return;
    }
    if (!crimeDetailsCache[crimeId]) {
      try {
        const resp = await crimesAPI.getById(crimeId);
        const data = resp.data || resp || {};
        setCrimeDetailsCache((prev) => ({ ...prev, [crimeId]: data }));
      } catch (err) {
        Swal.fire('Error!', err.message || 'Failed to load crime details', 'error');
        return;
      }
    }
    setExpandedCrime(crimeId);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCrime(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrime(null);
    loadCrimes();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase() || 'open';
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status || 'Open'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading crimes...</p>
      </div>
    );
  }

  const officerInfo = getOfficerInfo();

  return (
    <div className="crimes-container">
      <div className="page-header">
          <div>
            <h2 className="page-title">🚨 Crimes Management</h2>
            {officerInfo && (
              <p style={{ 
                marginTop: '8px', 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem' 
              }}>
                Showing crimes assigned to Officer <strong>{officerInfo.name || 'You'}</strong>
              </p>
            )}
          </div>
          <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>➕</span> Add New Crime
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-value">{crimes.length}</div>
            <div className="stat-label">Total Crimes</div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-value">{crimes.filter(c => (c.STATUS || c.Status || c.status) === 'Open').length}</div>
            <div className="stat-label">Open Cases</div>
          </div>
          <div className="stat-card stat-card-accent">
            <div className="stat-value">{crimes.filter(c => (c.STATUS || c.Status || c.status) === 'Under Investigation').length}</div>
            <div className="stat-label">Under Investigation</div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-value">{crimes.filter(c => (c.STATUS || c.Status || c.status) === 'Closed').length}</div>
            <div className="stat-label">Closed Cases</div>
          </div>
        </div>

      {/* Search and Filter Section */}
      <div className="search-filter-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '600' }}>
            🔍 Search & Filter
          </h3>
          <button onClick={clearFilters} className="btn btn-secondary btn-sm">
            Clear All
          </button>
        </div>
        
        <div className="filter-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Crime ID</label>
            <input
              type="text"
              name="crimeId"
              value={searchFilters.crimeId}
              onChange={handleFilterChange}
              placeholder="Search by ID..."
              className="search-input"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Crime Type</label>
            <input
              type="text"
              name="crimeType"
              value={searchFilters.crimeType}
              onChange={handleFilterChange}
              placeholder="Search by type..."
              className="search-input"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Status</label>
            <select
              name="status"
              value={searchFilters.status}
              onChange={handleFilterChange}
              className="search-input"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Severity</label>
            <select
              name="severityLevel"
              value={searchFilters.severityLevel}
              onChange={handleFilterChange}
              className="search-input"
            >
              <option value="">All Severities</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={searchFilters.dateFrom}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Date To</label>
            <input
              type="date"
              name="dateTo"
              value={searchFilters.dateTo}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Location</label>
            <input
              type="text"
              name="location"
              value={searchFilters.location}
              onChange={handleFilterChange}
              placeholder="City/Area..."
              className="search-input"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Day of Week</label>
            <select
              name="dayOfWeek"
              value={searchFilters.dayOfWeek}
              onChange={handleFilterChange}
              className="search-input"
            >
              <option value="">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Sort By:</label>
            <select
              onChange={handleSortChange}
              value={`${sortBy}-${sortOrder}`}
              className="search-input"
              style={{ width: 'auto', minWidth: '220px' }}
            >
              <option value="dateOccurred-desc">📅 Date: Newest First</option>
              <option value="dateOccurred-asc">📅 Date: Oldest First</option>
              <option value="crimeId-asc">🔢 ID: Ascending</option>
              <option value="crimeId-desc">🔢 ID: Descending</option>
              <option value="severity-desc">⚠️ Severity: High to Low</option>
              <option value="severity-asc">⚠️ Severity: Low to High</option>
            </select>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
            Showing <strong style={{ color: 'var(--primary-color)' }}>{filteredCrimes.length}</strong> of <strong>{crimes.length}</strong> crimes
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
                <th>Date Occurred</th>
                <th>Location</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrimes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>
                      {crimes.length === 0 
                        ? 'No crimes found. Click "Add New Crime" to get started.'
                        : 'No crimes match your search filters. Try adjusting your filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCrimes.map((crime) => {
                  // Handle Oracle's response format (can be uppercase or mixed case)
                  const crimeId = crime.CRIME_ID || crime.Crime_ID || crime.crime_id;
                  const typeName = crime.TYPE_NAME || crime.Type_Name || crime.type_name;
                  const description = crime.DESCRIPTION || crime.Description || crime.description || '';
                  const dateOccurred = crime.DATE_OCCURRED || crime.Date_Occurred || crime.date_occurred;
                  const city = crime.CITY || crime.City || crime.city;
                  const area = crime.AREA || crime.Area || crime.area;
                  const status = crime.STATUS || crime.Status || crime.status;
                  const severity = crime.SEVERITY_LEVEL || crime.Severity_Level || crime.severity_level;
                  
                  return (
                    <React.Fragment key={crimeId}>
                      <tr>
                        <td>{crimeId}</td>
                        <td>{typeName || 'N/A'}</td>
                        <td className="description-cell">
                          {description.substring(0, 50)}
                          {description.length > 50 ? '...' : ''}
                        </td>
                        <td>{formatDate(dateOccurred)}</td>
                        <td>
                          {city ? (
                            <>
                              {city}
                              {area ? `, ${area}` : ''}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{getStatusBadge(status)}</td>
                        <td>{severity || 'N/A'}</td>
                        <td>
                          <div className="action-buttons" style={{ gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleEdit(crime)}
                              className="btn btn-secondary btn-sm"
                              title="Edit crime details"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleQuickStatusUpdate(crime)}
                              className="btn btn-primary btn-sm"
                              title="Update crime status"
                            >
                              🔄 Status
                            </button>
                            <button
                              onClick={() => handleDelete(crimeId)}
                              className="btn btn-danger btn-sm"
                              title="Delete this crime"
                            >
                              🗑️ Delete
                            </button>
                            <button
                              onClick={() => handleLinkSuspect(crimeId)}
                              className="btn btn-outline-primary btn-sm"
                              title="Link a suspect to this crime"
                            >
                              👤 Suspect
                            </button>
                            <button
                              onClick={() => handleLinkVictim(crimeId)}
                              className="btn btn-outline-primary btn-sm"
                              title="Link a victim to this crime"
                            >
                              🩹 Victim
                            </button>
                            <button
                              onClick={() => handleLinkWitness(crimeId)}
                              className="btn btn-outline-primary btn-sm"
                              title="Link a witness to this crime"
                            >
                              👁️ Witness
                            </button>
                            <button
                              onClick={() => toggleCrimeDetails(crimeId)}
                              className="btn btn-outline-secondary btn-sm"
                              title={expandedCrime === crimeId ? 'Hide detailed information' : 'Show suspects, victims, witnesses, and evidence'}
                            >
                              {expandedCrime === crimeId ? '▲ Hide' : '▼ Details'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedCrime === crimeId && (
                        <tr>
                          <td colSpan="8" style={{ background: '#f8f9fa' }}>
                            {crimeDetailsCache[crimeId] ? (
                              <div style={{ padding: '12px' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Linked Entities</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                                  <div>
                                    <h5>Suspects</h5>
                                    {crimeDetailsCache[crimeId].suspects && crimeDetailsCache[crimeId].suspects.length > 0 ? (
                                      <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                        {crimeDetailsCache[crimeId].suspects.map((s, idx) => (
                                          <li key={idx}>
                                            #{s.SUSPECT_ID || s.Suspect_ID || s.suspect_id} — {s.NAME || s.Name || s.name || 'N/A'} | Role: {s.ROLE || s.Role || s.role || 'N/A'} | Arrest: {s.ARREST_STATUS || s.Arrest_Status || s.arrest_status || 'N/A'}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p style={{ color: '#666' }}>None</p>
                                    )}
                                  </div>
                                  <div>
                                    <h5>Victims</h5>
                                    {crimeDetailsCache[crimeId].victims && crimeDetailsCache[crimeId].victims.length > 0 ? (
                                      <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                        {crimeDetailsCache[crimeId].victims.map((v, idx) => (
                                          <li key={idx}>
                                            #{v.VICTIM_ID || v.Victim_ID || v.victim_id} — {v.NAME || v.Name || v.name || 'N/A'} | Injury: {v.INJURY_SEVERITY || v.Injury_Severity || v.injury_severity || 'N/A'}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p style={{ color: '#666' }}>None</p>
                                    )}
                                  </div>
                                  <div>
                                    <h5>Witnesses</h5>
                                    {crimeDetailsCache[crimeId].witnesses && crimeDetailsCache[crimeId].witnesses.length > 0 ? (
                                      <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                        {crimeDetailsCache[crimeId].witnesses.map((w, idx) => (
                                          <li key={idx}>
                                            #{w.WITNESS_ID || w.Witness_ID || w.witness_id} — {w.NAME || w.Name || w.name || 'N/A'} | Key: {(w.IS_KEY_WITNESS || w.Is_Key_Witness || w.is_key_witness) ? 'Yes' : 'No'}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p style={{ color: '#666' }}>None</p>
                                    )}
                                  </div>
                                  <div>
                                    <h5>Evidence</h5>
                                    {crimeDetailsCache[crimeId].evidence && crimeDetailsCache[crimeId].evidence.length > 0 ? (
                                      <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                        {crimeDetailsCache[crimeId].evidence.map((ev, idx) => (
                                          <li key={idx}>
                                            #{ev.EVIDENCE_ID || ev.Evidence_ID || ev.evidence_id} — {ev.TYPE || ev.Type || ev.type || 'N/A'} | Collected by: {ev.COLLECTED_BY_NAME || ev.Collected_By_Name || 'Unknown'} | Date: {formatDate(ev.DATE_COLLECTED || ev.Date_Collected)}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p style={{ color: '#666' }}>None</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p style={{ margin: 0, color: '#666' }}>Loading...</p>
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
        <CrimeForm
          crime={editingCrime}
          crimeTypes={crimeTypes}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Crimes;

