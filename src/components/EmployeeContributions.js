import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function EmployeeContributions({ plans, familyMembers, clearAllData }) {
  const [contributions, setContributions] = useState(plans.map(plan => ({
    planName: plan.planName,
    options: [
      { type: 'Employee', contribution: '', eligibleMembers: familyMembers.reduce((acc, member) => ({ ...acc, [member]: { eligible: false, expectedRewards: '' } }), {}), hsaEligible: false, hsaEmployerFixedContribution: '', hsaMaxEmployerMatch: '', hsaEmployerMatchPercentage: '' },
      { type: 'Employee + Spouse', contribution: '', eligibleMembers: familyMembers.reduce((acc, member) => ({ ...acc, [member]: { eligible: false, expectedRewards: '' } }), {}), hsaEligible: false, hsaEmployerFixedContribution: '', hsaMaxEmployerMatch: '', hsaEmployerMatchPercentage: '' },
      { type: 'Employee + Children', contribution: '', eligibleMembers: familyMembers.reduce((acc, member) => ({ ...acc, [member]: { eligible: false, expectedRewards: '' } }), {}), hsaEligible: false, hsaEmployerFixedContribution: '', hsaMaxEmployerMatch: '', hsaEmployerMatchPercentage: '' },
      { type: 'Family', contribution: '', eligibleMembers: familyMembers.reduce((acc, member) => ({ ...acc, [member]: { eligible: false, expectedRewards: '' } }), {}), hsaEligible: false, hsaEmployerFixedContribution: '', hsaMaxEmployerMatch: '', hsaEmployerMatchPercentage: '' },
    ]
  })));
  const navigate = useNavigate();

  const handleContributionChange = (planIndex, optionIndex, field, value) => {
    const updatedContributions = contributions.map((plan, pIndex) => {
      if (pIndex === planIndex) {
        const updatedOptions = plan.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return { ...option, [field]: value };
          }
          return option;
        });
        return { ...plan, options: updatedOptions };
      }
      return plan;
    });
    setContributions(updatedContributions);
  };

  const handleEligibilityChange = (planIndex, optionIndex, member, field, value) => {
    const updatedContributions = contributions.map((plan, pIndex) => {
      if (pIndex === planIndex) {
        const updatedOptions = plan.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return {
              ...option,
              eligibleMembers: {
                ...option.eligibleMembers,
                [member]: { ...option.eligibleMembers[member], [field]: value }
              }
            };
          }
          return option;
        });
        return { ...plan, options: updatedOptions };
      }
      return plan;
    });
    setContributions(updatedContributions);
  };

  const handleHsaChange = (planIndex, optionIndex, field, value) => {
    const updatedContributions = contributions.map((plan, pIndex) => {
      if (pIndex === planIndex) {
        const updatedOptions = plan.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return { ...option, [field]: value };
          }
          return option;
        });
        return { ...plan, options: updatedOptions };
      }
      return plan;
    });
    setContributions(updatedContributions);
  };

  const handleDeleteOption = (planIndex, optionIndex) => {
    const updatedContributions = contributions.map((plan, pIndex) => {
      if (pIndex === planIndex) {
        const updatedOptions = plan.options.filter((_, oIndex) => oIndex !== optionIndex);
        return { ...plan, options: updatedOptions };
      }
      return plan;
    });
    setContributions(updatedContributions);
  };

  const handleClearAll = () => {
    clearAllData();
    navigate('/');
  };

  return (
    <div>
      <h2>Employee Contributions</h2>
      {contributions.map((plan, planIndex) => (
        <div key={planIndex}>
          <h3>{plan.planName}</h3>
          {plan.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <h4>{option.type}</h4>
              <input
                type="text"
                value={option.contribution}
                onChange={(e) => handleContributionChange(planIndex, optionIndex, 'contribution', e.target.value)}
                placeholder="Bi-weekly Contribution"
              />
              <div>
                {familyMembers.map((member, memberIndex) => (
                  <div key={memberIndex}>
                    <label>
                      <input
                        type="checkbox"
                        checked={option.eligibleMembers[member].eligible}
                        onChange={(e) => handleEligibilityChange(planIndex, optionIndex, member, 'eligible', e.target.checked)}
                      />
                      {member}
                    </label>
                    {option.eligibleMembers[member].eligible && (
                      <input
                        type="text"
                        value={option.eligibleMembers[member].expectedRewards}
                        onChange={(e) => handleEligibilityChange(planIndex, optionIndex, member, 'expectedRewards', e.target.value)}
                        placeholder="Expected Rewards"
                      />
                    )}
                  </div>
                ))}
              </div>
              <h4>HSA Information</h4>
              <label>
                <input
                  type="checkbox"
                  checked={option.hsaEligible}
                  onChange={(e) => handleHsaChange(planIndex, optionIndex, 'hsaEligible', e.target.checked)}
                />
                HSA Eligible
              </label>
              <div>
                <label>
                  HSA Employer Fixed Contribution:
                  <input
                    type="text"
                    value={option.hsaEmployerFixedContribution}
                    onChange={(e) => handleHsaChange(planIndex, optionIndex, 'hsaEmployerFixedContribution', e.target.value)}
                    disabled={!option.hsaEligible}
                  />
                </label>
              </div>
              <div>
                <label>
                  HSA Max Employer Match:
                  <input
                    type="text"
                    value={option.hsaMaxEmployerMatch}
                    onChange={(e) => handleHsaChange(planIndex, optionIndex, 'hsaMaxEmployerMatch', e.target.value)}
                    disabled={!option.hsaEligible}
                  />
                </label>
              </div>
              <div>
                <label>
                  HSA Employer Match Percentage:
                  <input
                    type="text"
                    value={option.hsaEmployerMatchPercentage}
                    onChange={(e) => handleHsaChange(planIndex, optionIndex, 'hsaEmployerMatchPercentage', e.target.value)}
                    disabled={!option.hsaEligible}
                  />
                </label>
              </div>
              <button onClick={() => handleDeleteOption(planIndex, optionIndex)}>Delete Option</button>
            </div>
          ))}
        </div>
      ))}
      <Link to="/family">
        <button>Back</button>
      </Link>
      <Link to="/results">
        <button>View Results</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
    </div>
  );
}

export default EmployeeContributions;
