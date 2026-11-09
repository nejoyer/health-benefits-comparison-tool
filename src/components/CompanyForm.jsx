
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CompanyForm({ companies, setCompanies, clearAllData }) {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name) {
      const updatedCompanies = [...companies, name];
      setCompanies(updatedCompanies); // Update the state in the App component
      setName('');
    }
  };

  const handleDelete = (nameToDelete) => {
    const updatedCompanies = companies.filter(name => name !== nameToDelete);
    setCompanies(updatedCompanies); // Update the state in the App component
  };

  const handleClearAll = () => {
    clearAllData();
    navigate('/');
  };

  return (
    <div>
      <h2>Enter Companies</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company Name"
        />
        <button type="submit">Add Company</button>
      </form>
      <ul>
        {companies.map((company, index) => (
          <li key={index}>
            {company}
            <button onClick={() => handleDelete(company)}>Delete</button>
          </li>
        ))}
      </ul>
      <Link to="/">
        <button>Back</button>
      </Link>
      <Link to="/cost-names">
        <button disabled={companies.length === 0}>Next</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
    </div>
  );
}

export default CompanyForm;