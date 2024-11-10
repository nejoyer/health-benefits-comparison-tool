import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RewardsForm({ plans, familyMembers, setPlans, clearAllData }) {
  const navigate = useNavigate();

  const handleRewardChange = (planIndex, memberName, value) => {
    const updatedPlans = plans.map((plan, index) => {
      if (index === planIndex) {
        return {
          ...plan,
          rewards: {
            ...plan.rewards,
            [memberName]: Number(value)
          }
        };
      }
      return plan;
    });
    setPlans(updatedPlans);
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
                  value={plan.rewards?.[member.name] || 0}
                  onChange={(e) => handleRewardChange(planIndex, member.name, e.target.value)}
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