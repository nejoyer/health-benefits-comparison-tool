// src/components/PlanForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function PlanForm({ companies, costNames, plans, setPlans, clearAllData }) {
  const [planName, setPlanName] = useState('');
  const [individualDeductible, setIndividualDeductible] = useState('');
  const [individualOOPMax, setIndividualOOPMax] = useState('');
  const [familyDeductible, setFamilyDeductible] = useState('');
  const [familyOOPMax, setFamilyOOPMax] = useState('');
  const [coinsurance, setCoinsurance] = useState('');
  const [costs, setCosts] = useState(costNames.map(name => ({
    costName: name,
    copayAmount: '',
    isCoinsurance: false,
  })));
  const [employeeContributions, setEmployeeContributions] = useState([
    { type: 'employeeOnly', notOffered: false, biweeklyContribution: '' },
    { type: 'employeeSpouse', notOffered: false, biweeklyContribution: '' },
    { type: 'employeeChildren', notOffered: false, biweeklyContribution: '' },
    { type: 'family', notOffered: false, biweeklyContribution: '' },
  ]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [hsaEligible, setHsaEligible] = useState(false);
  const [individualFixedEmployerContribution, setIndividualFixedEmployerContribution] = useState('');
  const [individualEmployerMaxMatch, setIndividualEmployerMaxMatch] = useState('');
  const [individualEmployerMatchPercentage, setIndividualEmployerMatchPercentage] = useState('');
  const [familyFixedEmployerContribution, setFamilyFixedEmployerContribution] = useState('');
  const [familyEmployerMaxMatch, setFamilyEmployerMaxMatch] = useState('');
  const [familyEmployerMatchPercentage, setFamilyEmployerMatchPercentage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPlan = {
      planName,
      individualDeductible,
      individualOOPMax,
      familyDeductible,
      familyOOPMax,
      coinsurance,
      costs,
      employeeContributions,
      selectedCompanies,
      hsaEligible,
      individualFixedEmployerContribution,
      individualEmployerMaxMatch,
      individualEmployerMatchPercentage,
      familyFixedEmployerContribution,
      familyEmployerMaxMatch,
      familyEmployerMatchPercentage,
    };

    setPlans((prev) => [...prev, newPlan]);

    setPlanName('');
    setIndividualDeductible('');
    setIndividualOOPMax('');
    setFamilyDeductible('');
    setFamilyOOPMax('');
    setCoinsurance('');
    setCosts(costNames.map(name => ({
      costName: name,
      copayAmount: '',
      isCoinsurance: false,
    })));
    setEmployeeContributions([
      { type: 'employeeOnly', notOffered: false, biweeklyContribution: '' },
      { type: 'employeeSpouse', notOffered: false, biweeklyContribution: '' },
      { type: 'employeeChildren', notOffered: false, biweeklyContribution: '' },
      { type: 'family', notOffered: false, biweeklyContribution: '' },
    ]);
    setSelectedCompanies([]);
    setHsaEligible(false);
    setIndividualFixedEmployerContribution('');
    setIndividualEmployerMaxMatch('');
    setIndividualEmployerMatchPercentage('');
    setFamilyFixedEmployerContribution('');
    setFamilyEmployerMaxMatch('');
    setFamilyEmployerMatchPercentage('');
  };

  const handleDelete = (indexToDelete) => {
    setPlans(plans.filter((plan, index) => index !== indexToDelete));
  };

  const handleClone = (plan) => {
    setPlans((prev) => [...prev, { ...plan, planName: `${plan.planName} (Clone)` }]);
  };

  const handleModify = (index) => {
    const plan = plans[index];
    setPlanName(plan.planName);
    setIndividualDeductible(plan.individualDeductible);
    setIndividualOOPMax(plan.individualOOPMax);
    setFamilyDeductible(plan.familyDeductible);
    setFamilyOOPMax(plan.familyOOPMax);
    setCoinsurance(plan.coinsurance);
    setCosts(plan.costs);
    setEmployeeContributions(plan.employeeContributions);
    setSelectedCompanies(plan.selectedCompanies);
    setHsaEligible(plan.hsaEligible);
    setIndividualFixedEmployerContribution(plan.individualFixedEmployerContribution);
    setIndividualEmployerMaxMatch(plan.individualEmployerMaxMatch);
    setIndividualEmployerMatchPercentage(plan.individualEmployerMatchPercentage);
    setFamilyFixedEmployerContribution(plan.familyFixedEmployerContribution);
    setFamilyEmployerMaxMatch(plan.familyEmployerMaxMatch);
    setFamilyEmployerMatchPercentage(plan.familyEmployerMatchPercentage);
    setPlans(plans.filter((_, i) => i !== index));
  };

  const handleCostChange = (index, field, value) => {
    const updatedCosts = costs.map((cost, i) => {
      if (i === index) {
        return { ...cost, [field]: value };
      }
      return cost;
    });
    setCosts(updatedCosts);
  };

  const handleEmployeeContributionChange = (type, field, value) => {
    const updatedContributions = employeeContributions.map(contribution => {
      if (contribution.type === type) {
        return { ...contribution, [field]: value };
      }
      return contribution;
    });
    setEmployeeContributions(updatedContributions);
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
      <h2>Enter Health Care Plans</h2>
      <form onSubmit={handleSubmit}>
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
        <div>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Plan Name"
            required
          />
          <input
            type="text"
            value={coinsurance}
            onChange={(e) => setCoinsurance(e.target.value)}
            placeholder="Coinsurance"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={individualDeductible}
            onChange={(e) => setIndividualDeductible(e.target.value)}
            placeholder="Individual Deductible"
            required
          />
          <input
            type="text"
            value={individualOOPMax}
            onChange={(e) => setIndividualOOPMax(e.target.value)}
            placeholder="Individual OOP Max"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={familyDeductible}
            onChange={(e) => setFamilyDeductible(e.target.value)}
            placeholder="Family Deductible"
            required
          />
          <input
            type="text"
            value={familyOOPMax}
            onChange={(e) => setFamilyOOPMax(e.target.value)}
            placeholder="Family OOP Max"
            required
          />
        </div>
        <h3>HSA Information</h3>
        <label>
          <input
            type="checkbox"
            checked={hsaEligible}
            onChange={(e) => setHsaEligible(e.target.checked)}
          />
          HSA Eligible?
        </label>
        {hsaEligible && (
          <div>
            <div>
              <label>
                Ind. Fixed Employer Contribution:
                <input
                  type="text"
                  value={individualFixedEmployerContribution}
                  onChange={(e) => setIndividualFixedEmployerContribution(e.target.value)}
                />
              </label>
              <label>
                Ind. Employer Max Match:
                <input
                  type="text"
                  value={individualEmployerMaxMatch}
                  onChange={(e) => setIndividualEmployerMaxMatch(e.target.value)}
                />
              </label>
              <label>
                Ind. Employer Match Percentage:
                <input
                  type="text"
                  value={individualEmployerMatchPercentage}
                  onChange={(e) => setIndividualEmployerMatchPercentage(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Fam. Fixed Employer Contribution:
                <input
                  type="text"
                  value={familyFixedEmployerContribution}
                  onChange={(e) => setFamilyFixedEmployerContribution(e.target.value)}
                />
              </label>
              <label>
                Fam. Employer Max Match:
                <input
                  type="text"
                  value={familyEmployerMaxMatch}
                  onChange={(e) => setFamilyEmployerMaxMatch(e.target.value)}
                />
              </label>
              <label>
                Fam. Employer Match Percentage:
                <input
                  type="text"
                  value={familyEmployerMatchPercentage}
                  onChange={(e) => setFamilyEmployerMatchPercentage(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}
        <h3>Employee Contributions</h3>
        {employeeContributions.map((contribution, index) => (
          <div key={index}>
            <label>
              <input
                type="checkbox"
                checked={contribution.notOffered}
                onChange={(e) => handleEmployeeContributionChange(contribution.type, 'notOffered', e.target.checked)}
              />
              Not Offered
            </label>
            <input
              type="text"
              value={contribution.biweeklyContribution}
              onChange={(e) => handleEmployeeContributionChange(contribution.type, 'biweeklyContribution', e.target.value)}
              placeholder={`${contribution.type.replace(/([A-Z])/g, ' $1')}`}
              disabled={contribution.notOffered}
            />
          </div>
        ))}
        <h3>Enter Costs for the Plan</h3>
        {costs.map((cost, index) => (
          <div key={index}>
            <h4>{cost.costName}</h4>
            <input
              type="text"
              value={cost.copayAmount}
              onChange={(e) => handleCostChange(index, 'copayAmount', e.target.value)}
              placeholder="Copay Amount"
            />
            <label>
              <input
                type="checkbox"
                checked={cost.isCoinsurance}
                onChange={(e) => handleCostChange(index, 'isCoinsurance', e.target.checked)}
              />
              Coinsurance
            </label>
          </div>
        ))}
        <button type="submit">Add Plan</button>
      </form>
      <h3>Entered Plans</h3>
      {plans.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Company</th>
              <th>Individual Deductible</th>
              <th>Individual OOP Max</th>
              <th>Family Deductible</th>
              <th>Family OOP Max</th>
              <th>Coinsurance</th>
              <th>Costs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={index}>
                <td>{plan.planName}</td>
                <td>{plan.selectedCompanies.join(', ')}</td>
                <td>{plan.individualDeductible}</td>
                <td>{plan.individualOOPMax}</td>
                <td>{plan.familyDeductible}</td>
                <td>{plan.familyOOPMax}</td>
                <td>{plan.coinsurance}</td>
                <td>
                  <ul>
                    {plan.costs.map((cost, idx) => (
                      <li key={idx}>
                        {cost.costName}: Copay ${cost.copayAmount}, 
                        {cost.isCoinsurance ? ' Coinsurance' : ' No Coinsurance'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button onClick={() => handleModify(index)}>Modify</button>
                  <button onClick={() => handleDelete(index)}>Delete</button>
                  <button onClick={() => handleClone(plan)}>Clone</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No plans entered. Please add a health care plan.</p>
      )}
      <Link to="/cost-names">
        <button>Back</button>
      </Link>
      <Link to="/family">
        <button disabled={plans.length === 0}>Next</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
    </div>
  );
}

export default PlanForm;
