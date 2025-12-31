import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { crimeReportsAPI, crimesAPI, crimeTypesAPI, locationsAPI } from '../../services/api';
import './Crimes.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    victimId: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.victimId) params.victimId = filters.victimId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const response = await crimeReportsAPI.getAll(params);
      console.log('📋 Reports loaded:', response.data);
      setReports(response.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      Swal.fire('Error!', error.message || 'Failed to load reports', 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadReports();
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      victimId: '',
      dateFrom: '',
      dateTo: ''
    });
    setTimeout(() => loadReports(), 100);
  };

  const handleViewDetails = async (reportId) => {
    try {
      const response = await crimeReportsAPI.getById(reportId);
      const reportData = response.data;
      
      let detailsHtml = `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin-bottom: 10px;">📋 Report Information</h4>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <p><strong>Report ID:</strong> ${reportData.report.REPORT_ID || reportData.report.report_id}</p>
              <p><strong>Date Reported:</strong> ${new Date(reportData.report.DATE_REPORTED || reportData.report.date_reported).toLocaleString()}</p>
              <p><strong>Status:</strong> <span style="color: ${
                (reportData.report.STATUS || reportData.report.status) === 'Resolved' ? 'green' : 
                (reportData.report.STATUS || reportData.report.status) === 'Under Investigation' ? 'orange' : '#666'
              };">${reportData.report.STATUS || reportData.report.status}</span></p>
              <p><strong>Reported By:</strong> ${reportData.report.REPORTED_BY || reportData.report.reported_by || reportData.report.VICTIM_NAME || reportData.report.victim_name || 'N/A'}</p>
              <p><strong>Report Type:</strong> ${reportData.report.REPORT_TYPE || reportData.report.report_type}</p>
              ${(reportData.report.VICTIM_EMAIL || reportData.report.victim_email) ? `<p><strong>Contact:</strong> ${reportData.report.VICTIM_EMAIL || reportData.report.victim_email}</p>` : ''}
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin-bottom: 10px;">📝 Report Details</h4>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">
              ${reportData.report.DETAILS || reportData.report.details || 'No details provided'}
            </div>
          </div>
          
          ${reportData.linked_crimes && reportData.linked_crimes.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin-bottom: 10px;">🔗 Linked Crimes (${reportData.total_linked_crimes})</h4>
              ${reportData.linked_crimes.map(crime => `
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #4caf50;">
                  <p><strong>Crime ID:</strong> #${crime.CRIME_ID || crime.crime_id}</p>
                  <p><strong>Type:</strong> ${crime.CRIME_TYPE || crime.crime_type}</p>
                  <p><strong>Date:</strong> ${crime.DATE_OCCURRED || crime.date_occurred}</p>
                  <p><strong>Status:</strong> ${crime.CRIME_STATUS || crime.crime_status}</p>
                  ${(crime.LINK_NOTES || crime.link_notes) ? `<p style="font-size: 0.9em;"><strong>Notes:</strong> ${crime.LINK_NOTES || crime.link_notes}</p>` : ''}
                  <p style="font-size: 0.85em; color: #666;"><em>Linked: ${crime.LINKED_ON || crime.linked_on}</em></p>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">⚠️ No crimes linked yet. You can create a crime and link it to this report.</p>
            </div>
          `}
        </div>
      `;
      
      Swal.fire({
        title: `Crime Report #${reportId}`,
        html: detailsHtml,
        width: '750px',
        showCancelButton: true,
        confirmButtonText: 'Update Status',
        cancelButtonText: 'Close',
        confirmButtonColor: '#667eea'
      }).then((result) => {
        if (result.isConfirmed) {
          handleUpdateStatus(reportId, reportData.report.STATUS || reportData.report.status);
        }
      });
    } catch (error) {
      console.error('Error loading report details:', error);
      Swal.fire('Error!', 'Failed to load report details', 'error');
    }
  };

  const handleUpdateStatus = async (reportId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Update Report Status',
      input: 'select',
      inputOptions: {
        'Pending Review': 'Pending Review',
        'Under Investigation': 'Under Investigation',
        'Resolved': 'Resolved',
        'Closed': 'Closed',
        'Rejected': 'Rejected'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status!';
        }
      }
    });

    if (newStatus) {
      try {
        await crimeReportsAPI.updateStatus(reportId, newStatus);
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Report #${reportId} status changed to "${newStatus}"`,
          confirmButtonColor: '#667eea'
        });
        loadReports();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to update status', 'error');
      }
    }
  };

  const handleDeleteReport = async (reportId) => {
    const result = await Swal.fire({
      title: 'Delete Report?',
      text: 'Are you sure you want to delete this report? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await crimeReportsAPI.delete(reportId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Report has been deleted.',
          confirmButtonColor: '#667eea'
        });
        loadReports();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete report', 'error');
      }
    }
  };

  const handleAcceptReport = async (reportId) => {
    try {
      const result = await Swal.fire({
        title: 'Accept Report?',
        text: 'This will automatically create a crime and mark the report as resolved.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ Accept',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#43e97b'
      });

      if (result.isConfirmed) {
        console.log('🔍 Starting accept report process for report ID:', reportId);
        
        // Get report details
        const response = await crimeReportsAPI.getById(reportId);
        const reportData = response.data;
        console.log('📋 Report data:', reportData);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const officerId = user.id || user.userId;
        
        console.log('👮 Officer ID:', officerId);
        
        if (!officerId) {
          Swal.fire('Error!', 'User session invalid. Please login again.', 'error');
          return;
        }
        
        // Parse the report details to extract structured data
        const reportDetails = reportData.report.DETAILS || reportData.report.details || reportData.report.REPORT_DETAILS || reportData.report.report_details || '';
        console.log('📄 Raw report details:', reportDetails);
        
        // Parse the structured report details
        const parseReportDetails = (details) => {
          const lines = details.split('\n');
          const parsed = {
            crimeType: '',
            date: '',
            time: '',
            city: '',
            area: '',
            street: '',
            severity: 'Moderate',
            status: 'Open',
            description: ''
          };
          
          let inDescription = false;
          let descriptionText = '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('Crime Type:')) {
              parsed.crimeType = trimmed.replace('Crime Type:', '').trim();
            } else if (trimmed.startsWith('Date:')) {
              const dateTime = trimmed.replace('Date:', '').trim();
              const parts = dateTime.split(' ');
              parsed.date = parts[0]; // Date part
              if (parts[1]) parsed.time = parts[1]; // Time part if exists
            } else if (trimmed.startsWith('Location:')) {
              const location = trimmed.replace('Location:', '').trim();
              const locationParts = location.split(',').map(p => p.trim());
              parsed.city = locationParts[0] || '';
              parsed.area = locationParts[1] || '';
              parsed.street = locationParts[2] || '';
            } else if (trimmed.startsWith('Severity:')) {
              parsed.severity = trimmed.replace('Severity:', '').trim();
            } else if (trimmed.startsWith('Status:')) {
              parsed.status = trimmed.replace('Status:', '').trim();
            } else if (trimmed === 'Description:') {
              inDescription = true;
            } else if (inDescription && trimmed) {
              descriptionText += (descriptionText ? '\n' : '') + trimmed;
            }
          }
          
          parsed.description = descriptionText || details;
          return parsed;
        };
        
        const parsedData = parseReportDetails(reportDetails);
        console.log('🔍 Parsed report data:', parsedData);
        
        // Validate that we have essential data
        if (!parsedData.crimeType || !parsedData.city) {
          Swal.fire('Error!', 'Report is missing essential information (Crime Type or City). Cannot create crime.', 'error');
          return;
        }
        
        // Create crime from parsed report data
        const crimeData = {
          crimeTypeName: parsedData.crimeType,
          city: parsedData.city,
          area: parsedData.area || '',
          street: parsedData.street || '',
          dateOccurred: parsedData.date || new Date().toISOString().split('T')[0],
          dateReported: new Date().toISOString().split('T')[0],
          timeOccurred: parsedData.time || '',
          severityLevel: parsedData.severity || 'Moderate',
          description: parsedData.description,
          status: 'Open',
          officerId
        };

        console.log('📝 Creating crime with data:', crimeData);
        const crimeResult = await crimesAPI.create(crimeData);
        console.log('✅ Crime created result:', crimeResult);
        
        // Get the crime ID from the response
        const newCrimeId = crimeResult.crimeId || crimeResult.data?.crimeId;
        
        console.log('🆔 New crime ID:', newCrimeId);
        
        if (!newCrimeId) {
          console.error('❌ No crime ID returned from server');
          throw new Error('Crime was created but no crimeId was returned');
        }
        
        console.log('🔗 Linking report to crime:', reportId, '->', newCrimeId);
        
        // Link the report to the newly created crime
        await crimeReportsAPI.linkToCrime(reportId, newCrimeId, `Auto-linked when accepting report #${reportId}`);
        console.log(`✅ Successfully linked report ${reportId} to crime ${newCrimeId}`);
        
        // Update report status to "Under Investigation"
        await crimeReportsAPI.updateStatus(reportId, 'Under Investigation');
        console.log(`✅ Updated report ${reportId} status to Under Investigation`);
        
        // Verify the crime was created by fetching it
        try {
          const verifyResponse = await crimesAPI.getById(newCrimeId);
          console.log('✅ Crime verified in database:', verifyResponse.data);
        } catch (verifyError) {
          console.error('⚠️ Could not verify crime creation:', verifyError.message);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Report Accepted!',
          html: `Crime #${newCrimeId} created from Report #${reportId}.<br>Report is now under investigation.<br><br><strong>Please navigate to the Crimes tab to view the new crime.</strong>`,
          confirmButtonColor: '#667eea'
        });
        
        loadReports();
      }
    } catch (error) {
      console.error('Error accepting report:', error);
      Swal.fire('Error!', error.message || 'Failed to accept report', 'error');
    }
  };

  const handleRejectReport = async (reportId) => {
  };

  const handleAddReport = async () => {
    try {
      const crimeTypesResponse = await crimeTypesAPI.getAll();
      const locationsResponse = await locationsAPI.getAll();
      const crimeTypes = crimeTypesResponse.data || [];
      const locations = locationsResponse.data || [];

      const { value: formValues } = await Swal.fire({
        title: 'Add New Report',
        html: `
          <div style="text-align: left; max-height: 500px; overflow-y: auto; padding: 10px;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Crime Type *</b></label>
              <input id="swal-crimetype" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Street Theft, Assault">
              <small style="color: #666; font-size: 12px;">Enter the crime type name (e.g., "Street Theft", "Assault")</small>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Date Occurred *</b></label>
                <input id="swal-dateoccurred" type="date" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" max="${new Date().toISOString().split('T')[0]}">
                <small style="color: #666; font-size: 11px;">Cannot be a future date</small>
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Date Reported</b></label>
                <input id="swal-datereported" type="date" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" value="${new Date().toISOString().split('T')[0]}" max="${new Date().toISOString().split('T')[0]}">
                <small style="color: #666; font-size: 11px;">Defaults to today</small>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Time Occurred</b></label>
              <input id="swal-timeoccurred" type="time" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Status</b></label>
                <select id="swal-status" class="swal2-select" style="margin: 0; width: 100%; padding: 10px;">
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Severity Level</b></label>
              <select id="swal-severity" class="swal2-select" style="margin: 0; width: 100%; padding: 10px;">
                <option value="Minor">Minor</option>
                <option value="Moderate" selected>Moderate</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Description *</b></label>
              <textarea id="swal-description" class="swal2-textarea" style="margin: 0; min-height: 80px; width: 100%;" placeholder="Describe the crime incident..."></textarea>
            </div>
            
            <h4 style="margin: 20px 0 10px 0; color: #333; font-size: 16px;">Location Details</h4>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>City *</b></label>
              <input id="swal-city" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Islamabad">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Area</b></label>
                <input id="swal-area" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Blue Area">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Street</b></label>
                <input id="swal-street" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Jinnah Avenue">
              </div>
            </div>
          </div>
        `,
        width: '700px',
        showCancelButton: true,
        confirmButtonText: '✅ Create Report',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#667eea',
        customClass: {
          container: 'swal-wide'
        },
        preConfirm: () => {
          const crimeType = document.getElementById('swal-crimetype').value;
          const dateOccurred = document.getElementById('swal-dateoccurred').value;
          const dateReported = document.getElementById('swal-datereported').value;
          const timeOccurred = document.getElementById('swal-timeoccurred').value;
          const status = document.getElementById('swal-status').value;
          const severity = document.getElementById('swal-severity').value;
          const description = document.getElementById('swal-description').value;
          const city = document.getElementById('swal-city').value;
          const area = document.getElementById('swal-area').value;
          const street = document.getElementById('swal-street').value;
          
          if (!crimeType || !dateOccurred || !description || !city) {
            Swal.showValidationMessage('Please fill in all required fields (Crime Type, Date Occurred, Description, City)');
            return false;
          }
          
          return {
            crimeType,
            dateOccurred,
            dateReported,
            timeOccurred,
            status,
            severity,
            description,
            city,
            area,
            street
          };
        }
      });

      if (formValues) {
        // Create the report only (not a crime)
        const reportData = {
          reportedByName: 'Officer Report',
          reportDetails: `Crime Type: ${formValues.crimeType}\nDate: ${formValues.dateOccurred}${formValues.timeOccurred ? ' ' + formValues.timeOccurred : ''}\nLocation: ${formValues.city}${formValues.area ? ', ' + formValues.area : ''}${formValues.street ? ', ' + formValues.street : ''}\nSeverity: ${formValues.severity}\nStatus: ${formValues.status}\n\nDescription:\n${formValues.description}`,
          reportStatus: 'Pending Review'
        };

        await crimeReportsAPI.create(reportData);
        
        Swal.fire({
          icon: 'success',
          title: 'Report Created!',
          text: 'Report has been submitted for review. It will appear in the reports list.',
          confirmButtonColor: '#667eea'
        });
        
        loadReports();
      }
    } catch (error) {
      console.error('Error creating report:', error);
      Swal.fire('Error!', error.message || 'Failed to create report', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('resolved') || statusLower.includes('closed')) return 'status-solved';
    if (statusLower.includes('investigation') || statusLower.includes('review')) return 'status-investigating';
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('rejected')) return 'status-unsolved';
    return 'status-pending';
  };

  const getReportTypeStyle = (type) => {
    const typeLower = (type || '').toLowerCase();
    if (typeLower.includes('registered')) return { bg: '#e3f2fd', color: '#1976d2' };
    if (typeLower.includes('anonymous')) return { bg: '#fff3e0', color: '#f57c00' };
    return { bg: '#f5f5f5', color: '#666' };
  };

  return (
    <div className="crimes-container">
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h2 className="page-title">📋 Crime Reports Review</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            Review and manage crime reports submitted by victims and citizens
          </p>
        </div>
        <button onClick={handleAddReport} className="btn btn-primary">
          ➕ Add Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section" style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Victim ID</label>
            <input
              type="number"
              value={filters.victimId}
              onChange={(e) => setFilters({ ...filters, victimId: e.target.value })}
              placeholder="Filter by victim ID"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
        </div>
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button onClick={handleApplyFilters} className="btn btn-primary" style={{ padding: '8px 20px' }}>
            Apply Filters
          </button>
          <button onClick={handleClearFilters} className="btn btn-secondary" style={{ padding: '8px 20px' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reports.length}</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Reports</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('pending')).length}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Pending Review</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('investigation')).length}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Under Investigation</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('resolved')).length}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Resolved</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date Reported</th>
                  <th>Victim</th>
                  <th>Report Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ color: '#999', fontSize: '18px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                        <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>No reports found</p>
                        <p style={{ margin: 0, fontSize: '14px' }}>Reports submitted by victims will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const reportTypeStyle = getReportTypeStyle(report.REPORT_TYPE || report.report_type);
                    return (
                      <tr key={report.REPORT_ID || report.report_id}>
                        <td><strong>#{report.REPORT_ID || report.report_id}</strong></td>
                        <td>
                          {report.DATE_REPORTED || report.date_reported 
                            ? new Date(report.DATE_REPORTED || report.date_reported).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          <div>{report.VICTIM_NAME || report.victim_name || report.REPORTED_BY || report.reported_by || 'Anonymous'}</div>
                          {(report.VICTIM_EMAIL || report.victim_email) && (
                            <div style={{ fontSize: '12px', color: '#666' }}>{report.VICTIM_EMAIL || report.victim_email}</div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: reportTypeStyle.bg,
                            color: reportTypeStyle.color
                          }}>
                            {report.REPORT_TYPE || report.report_type || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(report.STATUS || report.status)}`}>
                            {report.STATUS || report.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewDetails(report.REPORT_ID || report.report_id)}
                              className="btn btn-sm btn-info"
                              title="View full report details"
                            >
                              📄 View
                            </button>
                            {(report.STATUS || report.status) === 'Pending Review' && (
                              <>
                                <button
                                  onClick={() => handleAcceptReport(report.REPORT_ID || report.report_id)}
                                  className="btn btn-sm btn-success"
                                  title="Accept report and create crime"
                                  style={{ background: '#43e97b', border: 'none' }}
                                >
                                  ✅ Accept
                                </button>
                                <button
                                  onClick={() => handleRejectReport(report.REPORT_ID || report.report_id)}
                                  className="btn btn-sm btn-danger"
                                  title="Reject this report"
                                  style={{ background: '#f5576c', border: 'none' }}
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(report.REPORT_ID || report.report_id, report.STATUS || report.status)}
                              className="btn btn-sm btn-warning"
                              title="Update report status"
                            >
                              ✏️ Status
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report.REPORT_ID || report.report_id)}
                              className="btn btn-sm btn-danger"
                              title="Delete this report"
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
      )}
    </div>
  );
};

export default Reports;
