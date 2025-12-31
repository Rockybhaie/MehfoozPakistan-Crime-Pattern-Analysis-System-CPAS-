import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Crimes from './Crimes';
import Suspects from './Suspects';
import Evidence from './Evidence';
import Locations from './Locations';
import CrimeTypes from './CrimeTypes';
import Analytics from './Analytics';
import Predictions from './Predictions';
import Reports from './Reports';
import Officers from './Officers';
import Investigations from './Investigations';
import './Dashboard.css';

const OfficerDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/crimes" replace />} />
          <Route path="/crimes/*" element={<Crimes />} />
          <Route path="/suspects/*" element={<Suspects />} />
          <Route path="/evidence/*" element={<Evidence />} />
          <Route path="/locations/*" element={<Locations />} />
          <Route path="/crime-types/*" element={<CrimeTypes />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/officers/*" element={<Officers />} />
          <Route path="/investigations/*" element={<Investigations />} />
          <Route path="/analytics/*" element={<Analytics />} />
          <Route path="/predictions/*" element={<Predictions />} />
        </Routes>
      </div>
    </div>
  );
};

export default OfficerDashboard;







