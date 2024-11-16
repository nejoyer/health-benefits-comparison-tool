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
        <li>I assume at MOST 2 working adults... I'm not sure if more than 2 is a valid tax situation. I don't know how to cover it.</li>
        <li>Financial Impact for each plan doesn't include HSA impact... because there are IRS limits about your total family HSA benefits... so I had to calculate that at the comination level. It is included in the grand total though.</li>
        <li>I didn't cover the craziest edge cases, like if your employer's fixed + max match is greater than the IRS limits.</li>
        <li>Some code for this project was generated using an LLM for expedience and uses coding constructs which I neither understand nor condone... but seem to work.</li>
        <li>Last edited in November 2024 with Tax Year 2025 in mind (for things like HSA contribution limits)</li>
        <li>This hasn't been extensively tested... I probably got some of the calculations wrong. Check the math yourself. If you find discrepancies, let me know.</li>
        <li>The UI is intentionally clunky to show this is an app that was thrown together so caeat emptor.</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>TODO. I didn't have time to type it out. Hopefully I'll get to this soon.</li>
      </ol>
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
