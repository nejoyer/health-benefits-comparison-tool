// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CompanyForm from './components/CompanyForm';
import FamilyForm from './components/FamilyForm';
import CostNames from './components/CostNames';
import PlanForm from './components/PlanForm';
import RewardsForm from './components/RewardsForm'; // Import the new RewardsForm component
import Results from './components/Results'; // Import the Results component

function App() {
  const [companies, setCompanies] = useState([]);
  const [costNames, setCostNames] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [rewards, setRewards] = useState({});

  const clearAllData = () => {
    setCompanies([]);
    setCostNames([]);
    setFamilyMembers([]);
    setPlans([]);
    setRewards({});
  };

  return (
    <Router>
      <div className="App">
        <h1>Healthcare Benefits Comparison</h1>
        <Routes>
          <Route path="/" element={<Home setCompanies={setCompanies} setCostNames={setCostNames} setFamilyMembers={setFamilyMembers} setPlans={setPlans} />} />
          <Route path="/companies" element={<CompanyForm companies={companies} setCompanies={setCompanies} clearAllData={clearAllData} />} />
          <Route path="/cost-names" element={<CostNames costNames={costNames} setCostNames={setCostNames} clearAllData={clearAllData} />} />
          <Route path="/plans" element={<PlanForm companies={companies} costNames={costNames} setPlans={setPlans} plans={plans} clearAllData={clearAllData} />} />
          <Route path="/family" element={<FamilyForm companies={companies} familyMembers={familyMembers} setFamilyMembers={setFamilyMembers} clearAllData={clearAllData} />} />
          <Route path="/rewards" element={<RewardsForm plans={plans} familyMembers={familyMembers} rewards={rewards} setRewards={setRewards} clearAllData={clearAllData} />} />
          <Route path="/results" element={<Results companies={companies} costNames={costNames} familyMembers={familyMembers} plans={plans} rewards={rewards} clearAllData={clearAllData} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
