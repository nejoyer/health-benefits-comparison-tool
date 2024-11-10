import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RewardsForm({ plans, familyMembers, clearAllData }) {
  const [rewards, setRewards] = useState({});

  useEffect(() => {
    if (plans && familyMembers) {
      const initialRewards = plans.reduce((acc, plan) => {
        acc[plan.planName] = familyMembers.reduce((famAcc, member) => {
          famAcc[member.name] = 0;
          return famAcc;
        }, {});
        return acc;
      }, {});
      setRewards(initialRewards);
    }
  }, [plans, familyMembers]);

  const navigate = useNavigate();

  const handleRewardChange = (planName, memberName, value) => {
    setRewards(prevRewards => ({
      ...prevRewards,
      [planName]: {
        ...prevRewards[planName],
        [memberName]: Number(value)
      }
    }));
  };

  const handleClearAll = () => {
    clearAllData();
    navigate('/');
  };

  return (
    <div>
      <h2>Enter Expected Rewards</h2>
      {plans.map((plan, planIndex) => (
        <div key={planIndex}>
          <h3>{plan.planName} ({plan.selectedCompanies.join(', ')})</h3>
          {familyMembers.map((member, memberIndex) => (
            <div key={memberIndex}>
              <label>
                {member.name}:
                <input
                  type="number"
                  value={rewards[plan.planName]?.[member.name] || 0}
                  onChange={(e) => handleRewardChange(plan.planName, member.name, e.target.value)}
                  placeholder="Expected Rewards"
                />
              </label>
            </div>
          ))}
        </div>
      ))}
      <Link to="/family">
        <button>Back</button>
      </Link>
      <Link to="/results">
        <button>Next</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
    </div>
  );
}

export default RewardsForm;