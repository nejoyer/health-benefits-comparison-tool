// src/components/CostNames.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CostNames({ costNames, setCostNames, clearAllData }) {
  const [costName, setCostName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (costName) {
      setCostNames((prev) => [...prev, costName]);
      setCostName('');
    }
  };

  const handleDelete = (nameToDelete) => {
    setCostNames((prev) => prev.filter(name => name !== nameToDelete));
  };

  const handleClearAll = () => {
    clearAllData();
    navigate('/');
  };

  return (
    <div>
      <h2>Enter Cost Names</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={costName}
          onChange={(e) => setCostName(e.target.value)}
          placeholder="Cost Name"
        />
        <button type="submit">Add Cost Name</button>
      </form>
      <ul>
        {costNames.map((name, index) => (
          <li key={index}>
            {name}
            <button onClick={() => handleDelete(name)}>Delete</button>
          </li>
        ))}
      </ul>
      <Link to="/companies">
        <button>Back</button>
      </Link>
      <Link to="/plans">
        <button disabled={costNames.length === 0}>Next</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
    </div>
  );
}

export default CostNames;
