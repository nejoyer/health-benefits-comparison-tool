// src/components/FamilyForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function FamilyForm({ companies, familyMembers, setFamilyMembers, clearAllData }) {
  const [name, setName] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name) {
      const updatedFamilyMembers = [...familyMembers, { name, companies: selectedCompanies }];
      setFamilyMembers(updatedFamilyMembers); // Update the state in the App component
      setName('');
      setSelectedCompanies([]);
    }
  };

  const handleDelete = (nameToDelete) => {
    const updatedFamilyMembers = familyMembers.filter(member => member.name !== nameToDelete);
    setFamilyMembers(updatedFamilyMembers); // Update the state in the App component
  };

  const handleCompanySelectionChange = (company, isSelected) => {
    setSelectedCompanies(prev => {
      if (isSelected) {
        return [...prev, company];
      } else {
        return prev.filter(c => c !== company);
      }
    });
  };

  const handleClearAll = () => {
    clearAllData();
    navigate('/');
  };

  return (
    <div>
      <h2>Enter Family Members</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Family Member Name"
        />
        <h3>Select Companies</h3>
        {companies.map((company, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={selectedCompanies.includes(company)}
              onChange={(e) => handleCompanySelectionChange(company, e.target.checked)}
            />
            {company}
          </label>
        ))}
        <button type="submit">Add Member</button>
      </form>
      <ul>
        {familyMembers.map((member, index) => (
          <li key={index}>
            {member.name}
            <button onClick={() => handleDelete(member.name)}>Delete</button>
            <ul>
              {member.companies.map((company, idx) => (
                <li key={idx}>{company}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link to="/plans">
        <button>Back</button>
      </Link>
      <Link to="/rewards">
        <button disabled={familyMembers.length === 0}>Next</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
    </div>
  );
}

export default FamilyForm;
