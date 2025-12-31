import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Dashboard.css';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [closeTimeout, setCloseTimeout] = useState(null);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#325a77',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('is_authenticated');
        
        // Clear session storage as well
        sessionStorage.clear();
        
        // Show logout message
        Swal.fire({
          icon: 'success',
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          // Force redirect to login page
          window.location.href = '/login/officer';
        });
      }
    });
  };

  const openDropdownMenu = (dropdown) => {
    // Clear any pending close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(dropdown);
  };

  const closeDropdowns = () => {
    // Add a delay before closing to prevent premature closure
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
    setCloseTimeout(timeout);
  };

  const cancelClose = () => {
    // Cancel the close timeout when mouse re-enters
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
  };

  const isOfficer = role === 'OFFICER';
  const isVictim = role === 'VICTIM';
  const isWitness = role === 'WITNESS';

  return (
    <header className="dashboard-header">
      <div className="header-content">
        {/* Branding Section */}
        <div className="header-left">
          <div className="brand-section">
            <h1 className="header-title">🛡️ MehfoozPakistan</h1>
            <span className="header-subtitle">Savdaan Rahiye, Satark Rahiye</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="header-nav">
          {isOfficer ? (
            <>
              {/* Case Management Dropdown */}
              <div 
                className="nav-dropdown" 
                onMouseEnter={() => openDropdownMenu('cases')} 
                onMouseLeave={closeDropdowns}
              >
                <button className="nav-dropdown-trigger">
                  <span className="dropdown-icon">📋</span>
                  <span>Case Management</span>
                  <span className="dropdown-arrow">▾</span>
                </button>
                {openDropdown === 'cases' && (
                  <div 
                    className="nav-dropdown-menu"
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeDropdowns}
                  >
                    <Link to="/dashboard/crimes" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">🚨</span>
                      <span>Crimes</span>
                    </Link>
                    <Link to="/dashboard/investigations" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">🔍</span>
                      <span>Investigations</span>
                    </Link>
                    <Link to="/dashboard/reports" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">📊</span>
                      <span>Reports</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Personnel & Evidence Dropdown */}
              <div 
                className="nav-dropdown" 
                onMouseEnter={() => openDropdownMenu('personnel')} 
                onMouseLeave={closeDropdowns}
              >
                <button className="nav-dropdown-trigger">
                  <span className="dropdown-icon">👥</span>
                  <span>Personnel & Evidence</span>
                  <span className="dropdown-arrow">▾</span>
                </button>
                {openDropdown === 'personnel' && (
                  <div 
                    className="nav-dropdown-menu"
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeDropdowns}
                  >
                    <Link to="/dashboard/suspects" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">🎭</span>
                      <span>Suspects</span>
                    </Link>
                    <Link to="/dashboard/officers" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">👮</span>
                      <span>Officers</span>
                    </Link>
                    <Link to="/dashboard/evidence" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">🔬</span>
                      <span>Evidence</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Data & Analytics Dropdown */}
              <div 
                className="nav-dropdown" 
                onMouseEnter={() => openDropdownMenu('analytics')} 
                onMouseLeave={closeDropdowns}
              >
                <button className="nav-dropdown-trigger">
                  <span className="dropdown-icon">📈</span>
                  <span>Data & Analytics</span>
                  <span className="dropdown-arrow">▾</span>
                </button>
                {openDropdown === 'analytics' && (
                  <div 
                    className="nav-dropdown-menu"
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeDropdowns}
                  >
                    <Link to="/dashboard/analytics" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">📊</span>
                      <span>Analytics</span>
                    </Link>
                    <Link to="/dashboard/predictions" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">🔮</span>
                      <span>Predictions</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard/locations" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">📍</span>
                      <span>Locations</span>
                    </Link>
                    <Link to="/dashboard/crime-types" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      <span className="item-icon">🏷️</span>
                      <span>Crime Types</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : isVictim ? (
            <>
              <Link to="/reports" className="nav-link">My Reports</Link>
              <Link to="/profile" className="nav-link">My Profile</Link>
            </>
          ) : isWitness ? (
            <>
              <Link to="/witness-cases" className="nav-link">My Cases</Link>
              <Link to="/witness-profile" className="nav-link">My Profile</Link>
            </>
          ) : null}
        </nav>

        {/* User Section */}
        <div className="header-right">
          <div className="user-section">
            {isOfficer && (
              <div className="officer-info">
                <span className="officer-icon">👮</span>
                <span className="officer-name">{user.name || user.email}</span>
              </div>
            )}
            {!isOfficer && (
              <span className="user-name">{user.name || user.email}</span>
            )}
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
