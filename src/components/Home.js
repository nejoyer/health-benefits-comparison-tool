// src/components/Home.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home({ setCompanies, setCostNames, setFamilyMembers, setPlans }) {
  const [importData, setImportData] = useState('');
  const navigate = useNavigate();

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      setCompanies(data.companies);
      setCostNames(data.costNames);
      setFamilyMembers(data.familyMembers);
      setPlans(data.plans);
      navigate('/results');
    } catch (error) {
      console.error('Invalid JSON data:', error);
    }
  };

  return (
    <div>
      <h2>Welcome</h2>
      <p>Please note that this tool is for informational purposes only and may not cover all aspects of healthcare plans. For detailed and personalized advice, consult a healthcare benefits advisor.</p>
      <p>A non-exhaustive list of limitations</p>
      <ul>
        <li>This is for financial considerations only. You might be better off choosing only on if the network covers your preferred provider.</li>
        <li>This doesn't evaluate the time-cost of money (ie. cashflow since I include HSA tax savings, but you might not get that until you get your refund in the spring)</li>
        <li>Assumption: For plans with multiple people, I assume that the Annual Deductible per-person is 1/2 of the total and that the OOPM per-person is 1/2 of the total.</li>
        <li>I did not evaluate situations where an individual would be covered by multiple plans... mostly because I've never been in that situation and I don't know how the insurance would be applied.</li>
      </ul>
      <Link to="/companies">
        <button>Get Started</button>
      </Link>
      <div>
        <h3>Import Data</h3>
        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste JSON data here"
          rows="10"
          cols="50"
        />
        <button onClick={handleImport}>Import</button>
      </div>
    </div>
  );
}

export default Home;
