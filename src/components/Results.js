import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Results({ companies, costNames, familyMembers, plans, rewards, clearAllData }) {
  const [results, setResults] = useState([]);
  const [maximizeHsa, setMaximizeHsa] = useState(false);
  const [employeeHsaContribution, setEmployeeHsaContribution] = useState('');
  const [marginalTaxPercentage, setMarginalTaxPercentage] = useState('');
  const navigate = useNavigate();

  const [costDetails, setCostDetails] = useState(() => {
    return familyMembers.reduce((acc, member) => {
      acc[member.name] = costNames.reduce((costAcc, costName) => {
        costAcc[costName] = { instances: 0, totalCost: 0 };
        return costAcc;
      }, {});
      return acc;
    }, {});
  });

  useEffect(() => {
    const calculateResults = () => {
      // Perform calculations based on the costDetails, plans, and rewards
      // This is a placeholder for the actual calculation logic
      const newResults = plans.map(plan => {
        // Placeholder calculation logic
        const totalCost = familyMembers.reduce((acc, member) => {
          return acc + Object.values(costDetails[member.name]).reduce((costAcc, cost) => {
            return costAcc + cost.totalCost;
          }, 0);
        }, 0);
        return { planName: plan.planName, totalCost };
      });
      setResults(newResults);
      console.log('Calculating results with:', costDetails, plans, rewards);
    };

    calculateResults();
  }, [costDetails, plans, rewards, familyMembers]);

  const handleClearAll = () => {
    clearAllData();
    navigate('/');
  };

  const exportData = () => {
    const data = {
      companies,
      costNames,
      familyMembers,
      plans,
      costDetails,
      rewards
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const createPlanInstances = (plans, familyMembers) => {
    const planInstances = [];

    plans.forEach(plan => {
      plan.employeeContributions.forEach(contribution => {
        if (!contribution.notOffered) {
          const coveredMembers = familyMembers.filter(member => {
            switch (contribution.type) {
              case 'employeeOnly':
                return member.companies.includes(plan.selectedCompanies[0]);
              case 'employeeSpouse':
                return member.companies.length > 0;
              case 'employeeChildren':
                return member.companies.includes(plan.selectedCompanies[0]) || member.companies.length === 0;
              case 'family':
                return true;
              default:
                return false;
            }
          });

          const expectedRewards = coveredMembers.reduce((acc, member) => {
            return acc + (rewards[plan.planName]?.[member.name] || 0);
          }, 0);

          const hsaEmployerContribution = maximizeHsa
            ? contribution.type === 'employeeOnly'
              ? plan.individualFixedEmployerContribution
              : plan.familyFixedEmployerContribution
            : 0;

          const hsaTaxSavings = maximizeHsa
            ? (employeeHsaContribution * marginalTaxPercentage) / 100
            : 0;

          const healthCareCosts = coveredMembers.reduce((acc, member) => {
            return acc + Object.values(costDetails[member.name]).reduce((costAcc, cost) => {
              return costAcc + cost.totalCost;
            }, 0);
          }, 0);

          const planInstance = {
            planName: plan.planName,
            selectedCompany: plan.selectedCompanies.join(', '),
            costs: plan.costs,
            coinsurance: plan.coinsurance,
            hsaEligible: plan.hsaEligible,
            hsaEmployerFixedContribution: contribution.type === 'employeeOnly' ? plan.individualFixedEmployerContribution : plan.familyFixedEmployerContribution,
            hsaEmployerMaxMatch: contribution.type === 'employeeOnly' ? plan.individualEmployerMaxMatch : plan.familyEmployerMaxMatch,
            hsaEmployerMatchPercentage: contribution.type === 'employeeOnly' ? plan.individualEmployerMatchPercentage : plan.familyEmployerMatchPercentage,
            deductible: contribution.type === 'employeeOnly' ? plan.individualDeductible : plan.familyDeductible,
            oopMax: contribution.type === 'employeeOnly' ? plan.individualOOPMax : plan.familyOOPMax,
            totalEmployeeContribution: contribution.biweeklyContribution * 26,
            contributionType: contribution.type,
            coveredMembers: coveredMembers.map(member => member.name),
            expectedRewards,
            hsaTaxSavings,
            hsaEmployerContribution,
            healthCareCosts
          };
          planInstances.push(planInstance);
        }
      });
    });

    return planInstances;
  };

  const planInstances = createPlanInstances(plans, familyMembers);

  const generateCombinations = (arr) => {
    const result = [];
    const f = (prefix, arr) => {
      for (let i = 0; i < arr.length; i++) {
        result.push([...prefix, arr[i]]);
        f([...prefix, arr[i]], arr.slice(i + 1));
      }
    };
    f([], arr);
    return result;
  };

  const isValidCombination = (combination, companies, familyMembers) => {
    if (combination.length > companies.length) return false;

    const selectedCompanies = new Set();
    const coveredMembers = new Set();
    const memberCount = {};

    for (const instance of combination) {
      if (selectedCompanies.has(instance.selectedCompany)) return false;
      selectedCompanies.add(instance.selectedCompany);
      instance.coveredMembers.forEach(member => {
        coveredMembers.add(member);
        memberCount[member] = (memberCount[member] || 0) + 1;
      });
    }

    if (Object.values(memberCount).some(count => count > 1)) return false;

    return familyMembers.every(member => coveredMembers.has(member.name));
  };

  const validCombinations = generateCombinations(planInstances).filter(combination =>
    isValidCombination(combination, companies, familyMembers)
  );

  return (
    <div>
      <h2>Results</h2>
      <div>
        <h3>HSA Contributions</h3>
        <label>
          <input
            type="checkbox"
            checked={maximizeHsa}
            onChange={(e) => setMaximizeHsa(e.target.checked)}
          />
          Maximize HSA
        </label>
        {!maximizeHsa && (
          <div>
            <label>
              Employee HSA Contribution:
              <input
                type="number"
                value={employeeHsaContribution}
                onChange={(e) => setEmployeeHsaContribution(e.target.value)}
                placeholder="Employee HSA Contribution"
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Marginal Tax Percentage:
            <input
              type="number"
              value={marginalTaxPercentage}
              onChange={(e) => setMarginalTaxPercentage(e.target.value)}
              placeholder="Marginal Tax Percentage"
            />
          </label>
        </div>
      </div>
      <div>
        {familyMembers.map((member, memberIndex) => (
          <div key={memberIndex}>
            <h3>{member.name}</h3>
            {costNames.map((costName, costIndex) => (
              <div key={costIndex}>
                <h4>{costName}</h4>
                <label>
                  Instances:
                  <input
                    type="number"
                    value={costDetails[member.name]?.[costName]?.instances || 0}
                    onChange={(e) => setCostDetails(prevDetails => ({
                      ...prevDetails,
                      [member.name]: {
                        ...prevDetails[member.name],
                        [costName]: {
                          ...prevDetails[member.name][costName],
                          instances: e.target.value
                        }
                      }
                    }))}
                  />
                </label>
                <label>
                  Total Cost:
                  <input
                    type="number"
                    value={costDetails[member.name]?.[costName]?.totalCost || 0}
                    onChange={(e) => setCostDetails(prevDetails => ({
                      ...prevDetails,
                      [member.name]: {
                        ...prevDetails[member.name],
                        [costName]: {
                          ...prevDetails[member.name][costName],
                          totalCost: e.target.value
                        }
                      }
                    }))}
                  />
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Link to="/rewards">
        <button>Back</button>
      </Link>
      <button onClick={handleClearAll}>Clear All Data and Go Back to Beginning</button>
      <button onClick={exportData}>Export Data</button>
      <div>
        <h3>Calculation Results</h3>
        {results.map((result, index) => (
          <div key={index}>
            <h4>{result.planName}</h4>
            <p>Total Cost: ${result.totalCost}</p>
          </div>
        ))}
      </div>
      <div>
        <h3>Valid Plan Combinations</h3>
        {validCombinations.map((combination, index) => (
          <div key={index}>
            <h4>Combination {index + 1}</h4>
            {combination.map((instance, idx) => (
              <div key={idx}>
                <p>({instance.planName}, {instance.selectedCompany}, {instance.contributionType})</p>
                <p>Expected Rewards: ${instance.expectedRewards}</p>
                <p>HSA Tax Savings: ${instance.hsaTaxSavings}</p>
                <p>HSA Employer Contribution: ${instance.hsaEmployerContribution}</p>
                <p>Health Care Costs: ${instance.healthCareCosts}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;