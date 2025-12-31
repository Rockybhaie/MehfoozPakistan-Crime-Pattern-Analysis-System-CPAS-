import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { predictionsAPI } from '../../services/api';
import './Crimes.css';

const Predictions = () => {
  const [riskData, setRiskData] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('risk');

  // Form inputs
  const [riskForm, setRiskForm] = useState({ city: '', area: '' });
  const [patternForm, setPatternForm] = useState({ crimeType: '', city: '', area: '', dayOfWeek: '' });
  const [forecastForm, setForecastForm] = useState({ months: '6', crimeType: '', city: '', area: '' });

  const handleRiskAssessment = async (e) => {
    e.preventDefault();
    if (!riskForm.city) {
      Swal.fire('Info', 'Please enter a City for risk assessment.', 'info');
      return;
    }
    setLoading(true);
    try {
      const response = await predictionsAPI.predictRisk(riskForm);
      setRiskData(response.data);
      Swal.fire('Success!', 'Risk assessment completed.', 'success');
    } catch (error) {
      console.error('Risk assessment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to assess risk',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePatternMatching = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await predictionsAPI.findPatterns(patternForm);
      setPatterns(response.data || []);
      Swal.fire('Success!', `Found ${response.data?.length || 0} pattern matches.`, 'success');
    } catch (error) {
      console.error('Pattern matching error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to find patterns',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {
        months: parseInt(forecastForm.months || '6'),
        crimeType: forecastForm.crimeType || null,
        city: forecastForm.city || null,
        area: forecastForm.area || null,
      };
      const response = await predictionsAPI.forecastTrends(params);
      setForecast(response.data || []);
      Swal.fire('Success!', 'Forecast generated.', 'success');
    } catch (error) {
      console.error('Forecast error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to generate forecast',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return '#e9ecef';
    const level = riskLevel.toUpperCase();
    if (level.includes('HIGH') || level.includes('CRITICAL')) return '#f8d7da';
    if (level.includes('MEDIUM') || level.includes('MODERATE')) return '#fff3cd';
    return '#d4edda';
  };

  const getTrendColor = (trend) => {
    if (!trend) return '#e9ecef';
    if (trend === 'High') return '#f8d7da';
    if (trend === 'Normal') return '#d1ecf1';
    return '#d4edda';
  };

  return (
    <div className="predictions-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">🔮 Crime Predictions & Forecasting</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            Analyze crime risks, detect patterns, and forecast trends
          </p>
        </div>
      </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0', 
          marginBottom: '30px', 
          borderBottom: '2px solid #e1e4e8',
          flexWrap: 'wrap',
          background: 'white',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          {[
            { id: 'risk', icon: '⚠️', label: 'Risk Assessment' },
            { id: 'patterns', icon: '🔍', label: 'Pattern Matching' },
            { id: 'forecast', icon: '📈', label: 'Forecast Trends' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 24px',
                background: activeTab === tab.id ? '#325a77' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6c757d',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #244557' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                flex: '1',
                minWidth: '150px',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

      {/* Risk Assessment Tab */}
      {activeTab === 'risk' && (
        <div>
          <div className="table-container" style={{ marginBottom: '25px', boxShadow: '0 2px 8px rgba(50,90,119,0.1)', border: '1px solid #e1e4e8' }}>
            <h3 style={{ 
              padding: '18px 20px', 
              margin: 0, 
              borderBottom: '2px solid #325a77', 
              background: '#325a77',
              color: 'white',
              borderRadius: '6px 6px 0 0',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '600',
              letterSpacing: '0.3px'
            }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              Location Risk Assessment
            </h3>
            <form onSubmit={handleRiskAssessment} style={{ padding: '25px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#2c3e50', letterSpacing: '0.3px' }}>
                    City <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={riskForm.city}
                    onChange={(e) => setRiskForm({ ...riskForm, city: e.target.value })}
                    placeholder="e.g., Karachi"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '11px 15px', 
                      border: '1.5px solid #e1e4e8', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#325a77'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e4e8'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#2c3e50', letterSpacing: '0.3px' }}>
                    Area (Optional)
                  </label>
                  <input
                    type="text"
                    value={riskForm.area}
                    onChange={(e) => setRiskForm({ ...riskForm, area: e.target.value })}
                    placeholder="e.g., Gulshan-e-Iqbal"
                    style={{ 
                      width: '100%', 
                      padding: '11px 15px', 
                      border: '1.5px solid #e1e4e8', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#325a77'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e4e8'}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{
                  padding: '11px 28px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  background: loading ? '#ccc' : '#325a77',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(50, 90, 119, 0.2)',
                  letterSpacing: '0.3px',
                  color: 'white'
                }}
              >
                {loading ? '⏳ Analyzing...' : '🔍 Assess Risk'}
              </button>
            </form>
          </div>

          {riskData && (
            <div className="table-container" style={{ boxShadow: '0 2px 8px rgba(50,90,119,0.1)', border: '1px solid #e1e4e8' }}>
              <h3 style={{ 
                padding: '18px 20px', 
                margin: 0, 
                borderBottom: '2px solid #325a77', 
                background: '#f8fafb',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '6px 6px 0 0',
                color: '#325a77',
                fontWeight: '600',
                letterSpacing: '0.3px'
              }}>
                <span style={{ fontSize: '1.4rem' }}>📊</span>
                Risk Assessment Results
              </h3>
              <div style={{ padding: '30px', background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                  {/* Location Info */}
                  <div style={{ 
                    border: '1.5px solid #e1e4e8', 
                    borderRadius: '6px', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #f8fafb 0%, #e8eef3 100%)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ marginTop: 0, fontSize: '1.05rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <span style={{ fontSize: '1.4rem' }}>📍</span> Location
                    </h4>
                    <div style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                      <strong>City:</strong> <span style={{ color: '#325a77', fontWeight: '600' }}>{riskData.location?.city || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                      <strong>Area:</strong> {riskData.location?.area || 'All areas'}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>Location ID:</strong>{' '}
                      <span style={{ background: '#325a77', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem' }}>
                        #{riskData.location?.location_id || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div style={{ 
                    border: '1.5px solid #e1e4e8', 
                    borderRadius: '6px', 
                    padding: '20px', 
                    background: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ marginTop: 0, fontSize: '1.05rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <span style={{ fontSize: '1.4rem' }}>⚠️</span> Risk Analysis
                    </h4>
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Risk Level:</strong>{' '}
                      <span style={{ 
                        background: getRiskColor(riskData.risk_assessment?.risk_level), 
                        padding: '6px 14px', 
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        display: 'inline-block',
                        marginTop: '5px',
                        border: '1.5px solid ' + (riskData.risk_assessment?.risk_level?.toUpperCase().includes('HIGH') ? '#e74c3c' : '#f0c14b')
                      }}>
                        {riskData.risk_assessment?.risk_level || 'N/A'}
                      </span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Risk Score:</strong>{' '}
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#325a77', marginTop: '5px' }}>
                        {riskData.risk_assessment?.risk_score || 'N/A'}<span style={{ fontSize: '1.2rem', color: '#999' }}>/10</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Severity:</strong> <span style={{ color: '#e74c3c', fontWeight: '600' }}>{riskData.risk_assessment?.severity || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>Risk Percentage:</strong>{' '}
                      <div style={{ 
                        background: '#e8eef3', 
                        height: '22px', 
                        borderRadius: '4px', 
                        marginTop: '8px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid #e1e4e8'
                      }}>
                        <div style={{ 
                          background: 'linear-gradient(90deg, #e74c3c 0%, #ff6b6b 100%)', 
                          height: '100%', 
                          width: `${riskData.risk_assessment?.risk_percentage || 0}%`,
                          borderRadius: '4px',
                          transition: 'width 0.6s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '10px',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {riskData.risk_assessment?.risk_percentage >= 20 && `${riskData.risk_assessment?.risk_percentage}%`}
                        </div>
                      </div>
                      <small style={{ color: '#6c757d', fontWeight: '600', marginTop: '5px', display: 'block', fontSize: '0.8rem' }}>
                        100%
                      </small>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{ 
                    border: '1.5px solid #f0c14b', 
                    borderRadius: '6px', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #fffdf7 0%, #fff9e6 100%)',
                    gridColumn: 'span 1',
                    boxShadow: '0 2px 6px rgba(240, 193, 75, 0.15)'
                  }}>
                    <h4 style={{ marginTop: 0, fontSize: '1.05rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <span style={{ fontSize: '1.4rem' }}>💡</span> Recommendation
                    </h4>
                    <p style={{ margin: 0, lineHeight: '1.7', fontSize: '0.9rem', color: '#555' }}>
                      {riskData.recommendation || 'No recommendation available'}
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '25px', 
                  padding: '14px', 
                  background: '#f8fafb', 
                  borderRadius: '4px',
                  fontSize: '0.85rem', 
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #e1e4e8'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>🕐</span>
                  <strong>Timestamp:</strong> {riskData.timestamp ? new Date(riskData.timestamp).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pattern Matching Tab */}
      {activeTab === 'patterns' && (
        <div>
          <div className="table-container" style={{ marginBottom: '20px' }}>
            <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
              🔍 Find Similar Crime Patterns
            </h3>
            <form onSubmit={handlePatternMatching} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    Crime Type
                  </label>
                  <input
                    type="text"
                    value={patternForm.crimeType}
                    onChange={(e) => setPatternForm({ ...patternForm, crimeType: e.target.value })}
                    placeholder="e.g., Robbery"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={patternForm.city}
                    onChange={(e) => setPatternForm({ ...patternForm, city: e.target.value })}
                    placeholder="e.g., Karachi"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    Area
                  </label>
                  <input
                    type="text"
                    value={patternForm.area}
                    onChange={(e) => setPatternForm({ ...patternForm, area: e.target.value })}
                    placeholder="Optional"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    Day of Week
                  </label>
                  <select
                    value={patternForm.dayOfWeek}
                    onChange={(e) => setPatternForm({ ...patternForm, dayOfWeek: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Find Patterns'}
              </button>
            </form>
          </div>

          {patterns.length > 0 && (
            <div className="table-container">
              <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
                📋 Pattern Matches ({patterns.length})
              </h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Crime ID</th>
                      <th>Crime Type</th>
                      <th>Location</th>
                      <th>Day</th>
                      <th>Hour</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Frequency</th>
                      <th>Recency Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patterns.map((pattern, idx) => {
                      const crimeId = pattern.CRIME_ID || pattern.Crime_ID || pattern.crime_id;
                      const crimeType = pattern.CRIME_TYPE || pattern.Crime_Type || pattern.crime_type;
                      const city = pattern.CITY || pattern.City || pattern.city;
                      const area = pattern.AREA || pattern.Area || pattern.area;
                      const day = pattern.DAY_OF_WEEK || pattern.Day_Of_Week || pattern.day_of_week;
                      const hour = pattern.HOUR_OF_DAY || pattern.Hour_Of_Day || pattern.hour_of_day;
                      const date = pattern.DATE_OCCURRED || pattern.Date_Occurred || pattern.date_occurred;
                      const status = pattern.STATUS || pattern.Status || pattern.status;
                      const frequency = pattern.PATTERN_FREQUENCY || pattern.Pattern_Frequency || pattern.pattern_frequency;
                      const recencyRank = pattern.RECENCY_RANK || pattern.Recency_Rank || pattern.recency_rank;
                      
                      return (
                        <tr key={idx}>
                          <td>
                            <span style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              #{crimeId}
                            </span>
                          </td>
                          <td><strong>{crimeType}</strong></td>
                          <td>{city}{area ? `, ${area}` : ''}</td>
                          <td>{day || 'N/A'}</td>
                          <td>{hour !== null && hour !== undefined ? `${hour}:00` : 'N/A'}</td>
                          <td>{date || 'N/A'}</td>
                          <td>
                            <span style={{ 
                              background: status === 'Closed' ? '#d4edda' : status === 'Open' ? '#f8d7da' : '#fff3cd',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}>
                              {status || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span style={{ background: '#fff3cd', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {frequency || 0}
                            </span>
                          </td>
                          <td>#{recencyRank || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {patterns.length === 0 && !loading && (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
              No patterns found. Try adjusting your search criteria.
            </p>
          )}
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div>
          <div className="table-container" style={{ marginBottom: '20px' }}>
            <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
              📈 Generate Crime Forecast
            </h3>
            <form onSubmit={handleForecast} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    Forecast Months *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={forecastForm.months}
                    onChange={(e) => setForecastForm({ ...forecastForm, months: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    Crime Type
                  </label>
                  <input
                    type="text"
                    value={forecastForm.crimeType}
                    onChange={(e) => setForecastForm({ ...forecastForm, crimeType: e.target.value })}
                    placeholder="All types"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={forecastForm.city}
                    onChange={(e) => setForecastForm({ ...forecastForm, city: e.target.value })}
                    placeholder="All cities"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                    Area
                  </label>
                  <input
                    type="text"
                    value={forecastForm.area}
                    onChange={(e) => setForecastForm({ ...forecastForm, area: e.target.value })}
                    placeholder="All areas"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Forecast'}
              </button>
            </form>
          </div>

          {forecast.length > 0 && (
            <div className="table-container">
              <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
                📊 Forecast Results ({forecast.length} months)
              </h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Month</th>
                      <th>Actual Count</th>
                      <th>3-Month Avg</th>
                      <th>Forecasted Count</th>
                      <th>YoY Change</th>
                      <th>Trend</th>
                      <th>Severity Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((row, idx) => {
                      const year = row.YEAR || row.Year || row.year;
                      const month = row.MONTH_NAME || row.Month_Name || row.month_name || row.MONTH || row.Month || row.month;
                      const actual = row.ACTUAL_CRIME_COUNT || row.Actual_Crime_Count || row.actual_crime_count;
                      const avg = row.THREE_MONTH_AVERAGE || row.Three_Month_Average || row.three_month_average;
                      const forecasted = row.FORECASTED_CRIME_COUNT || row.Forecasted_Crime_Count || row.forecasted_crime_count;
                      const yoyChange = row.YEAR_OVER_YEAR_CHANGE_PERCENT || row.Year_Over_Year_Change_Percent || row.year_over_year_change_percent;
                      const trend = row.TREND_INDICATOR || row.Trend_Indicator || row.trend_indicator;
                      const rank = row.SEVERITY_RANK || row.Severity_Rank || row.severity_rank;
                      
                      return (
                        <tr key={idx}>
                          <td><strong>{year}</strong></td>
                          <td>{month}</td>
                          <td>{actual || 0}</td>
                          <td>{avg || 'N/A'}</td>
                          <td>
                            <span style={{ background: '#d1ecf1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {forecasted || 0}
                            </span>
                          </td>
                          <td>
                            {yoyChange !== null && yoyChange !== undefined ? (
                              <span style={{ 
                                color: yoyChange > 0 ? '#d9534f' : yoyChange < 0 ? '#5cb85c' : '#6c757d',
                                fontWeight: 'bold'
                              }}>
                                {yoyChange > 0 ? '↑' : yoyChange < 0 ? '↓' : '='} {Math.abs(yoyChange)}%
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td>
                            <span style={{ 
                              background: getTrendColor(trend), 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}>
                              {trend || 'N/A'}
                            </span>
                          </td>
                          <td>#{rank || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {forecast.length === 0 && !loading && (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
              No forecast data available. Click "Generate Forecast" to create predictions.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Predictions;

