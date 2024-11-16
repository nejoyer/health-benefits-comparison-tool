import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function parseFloatOrDefault(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function Results({ companies, costNames, familyMembers, plans, rewards, clearAllData }) {
    const [maximizeHsa, setMaximizeHsa] = useState(false);
    const [userEnteredEmployeeHsaContribution, setUserEnteredEmployeeHsaContribution] = useState(0);
    const [marginalTaxPercentage, setMarginalTaxPercentage] = useState(0);
    const [results, setResults] = useState([]);
    const [maxImpactCombination, setMaxImpactCombination] = useState(null);
    const navigate = useNavigate();

    const [costDetails, setCostDetails] = useState(() => {
        return familyMembers.reduce((acc, member) => {
            acc[member.name] = costNames.reduce((costAcc, costName) => {
                costAcc[costName] = { instances: 0, totalCost: 0 };
                return costAcc;
            }, { "Other Costs": { instances: 0, totalCost: 0 } });
            return acc;
        }, {});
    });

    useEffect(() => {
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
                            return acc + (parseFloatOrDefault(plan.rewards?.[member.name]) || 0);
                        }, 0);

                        const healthCareCosts = coveredMembers.map(member => {
                            const totalCost = Object.entries(costDetails[member.name]).reduce((costAcc, [costName, costDetail]) => {
                                const planCost = plan.costs.find(c => c.costName === costName);
                                if (planCost) {
                                    if (planCost.isCoinsurance) {
                                        return costAcc + parseFloatOrDefault(costDetail.totalCost);
                                    } else {
                                        return costAcc + (parseFloatOrDefault(costDetail.instances) * parseFloatOrDefault(planCost.copayAmount));
                                    }
                                }
                                else {
                                    return costAcc + parseFloatOrDefault(costDetail.totalCost);
                                }
                            }, 0);

                            let memberCost = totalCost;
                            if (totalCost > parseFloatOrDefault(plan.individualDeductible)) {
                                const coinsuranceAmount = (totalCost - parseFloatOrDefault(plan.individualDeductible)) * (parseFloatOrDefault(plan.coinsurance) / 100.0);
                                memberCost = parseFloatOrDefault(plan.individualDeductible) + coinsuranceAmount;
                            }
                            if (memberCost > parseFloatOrDefault(plan.individualOOPMax)) {
                                memberCost = parseFloatOrDefault(plan.individualOOPMax);
                            }

                            return {
                                name: member.name,
                                totalCost: memberCost
                            };
                        });

                        let totalHealthCareCosts = healthCareCosts.reduce((acc, cost) => acc + cost.totalCost, 0);
                        if(totalHealthCareCosts > parseFloatOrDefault(plan.familyOOPMax)) {
                            totalHealthCareCosts = parseFloatOrDefault(plan.familyOOPMax);
                        }

                        const financialImpact = (expectedRewards - parseFloatOrDefault(contribution.biweeklyContribution) * 26.0 - totalHealthCareCosts).toFixed(2);

                        const planInstance = {
                            planName: plan.planName,
                            selectedCompany: plan.selectedCompanies.join(', '),
                            costs: plan.costs,
                            coinsurance: plan.coinsurance,
                            hsaEligible: plan.hsaEligible,
                            hsaEmployerFixedContribution: contribution.type === 'employeeOnly' ? parseFloatOrDefault(plan.individualFixedEmployerContribution) : parseFloatOrDefault(plan.familyFixedEmployerContribution),
                            hsaEmployerMaxMatch: contribution.type === 'employeeOnly' ? parseFloatOrDefault(plan.individualEmployerMaxMatch) : parseFloatOrDefault(plan.familyEmployerMaxMatch),
                            hsaEmployerMatchPercentage: contribution.type === 'employeeOnly' ? parseFloatOrDefault(plan.individualEmployerMatchPercentage) : parseFloatOrDefault(plan.familyEmployerMatchPercentage),
                            hsaLegalLimit: contribution.type === 'employeeOnly' ? 4300 : 8550,
                            deductible: contribution.type === 'employeeOnly' ? parseFloatOrDefault(plan.individualDeductible) : parseFloatOrDefault(plan.familyDeductible),
                            oopMax: contribution.type === 'employeeOnly' ? parseFloatOrDefault(plan.individualOOPMax) : parseFloatOrDefault(plan.familyOOPMax),
                            totalEmployeeContribution: parseFloatOrDefault(contribution.biweeklyContribution) * 26,
                            contributionType: contribution.type,
                            coveredMembers: coveredMembers.map(member => member.name),
                            expectedRewards,
                            healthCareCosts,
                            totalHealthCareCosts,
                            financialImpact: parseFloatOrDefault(financialImpact)
                        };
                        planInstances.push(planInstance);
                    }
                });
            });

            return planInstances;
        };

        const calculateHsaImpact = (combination) => {
            const hsaEligibleInstances = combination.instances.filter(instance => instance.hsaEligible);
            let totalLegalLimit = 0;
            if (hsaEligibleInstances.length > 1 || hsaEligibleInstances.some(instance => instance.contributionType !== 'employeeOnly')) {
                totalLegalLimit = 8550;
            } else if (hsaEligibleInstances.length === 1 && hsaEligibleInstances[0].contributionType === 'employeeOnly') {
                totalLegalLimit = 4300;
            }

            let totalHsaEmployerContribution = 0;
            let totalHsaEmployeeContribution = 0;

            hsaEligibleInstances.forEach(instance => { totalHsaEmployerContribution += instance.hsaEmployerFixedContribution; });

            // Sort instances by employer match percentage
            hsaEligibleInstances.sort((a, b) => b.hsaEmployerMatchPercentage - a.hsaEmployerMatchPercentage);

            // Filter out instances with a match percentage of 0
            const filteredHsaEligibleInstances = hsaEligibleInstances.filter(instance => instance.hsaEmployerMatchPercentage > 0);

            filteredHsaEligibleInstances.forEach(instance => {

                let matchFraction = instance.hsaEmployerMatchPercentage / 100.0;
                let amountNeededToMaxEmployerMatch = instance.hsaEmployerMaxMatch / matchFraction

                let instanceEmployeeContribution = Math.min(
                    (totalLegalLimit - totalHsaEmployerContribution) / (1 + matchFraction),
                    maximizeHsa ? 1000000 /*ensures we maximize*/ : (parseFloatOrDefault(userEnteredEmployeeHsaContribution) - totalHsaEmployeeContribution),
                    amountNeededToMaxEmployerMatch,
                    (instance.hsaLegalLimit - instance.hsaEmployerFixedContribution) / (1 + matchFraction));
                
                totalHsaEmployeeContribution += instanceEmployeeContribution;
                totalHsaEmployerContribution += instanceEmployeeContribution * matchFraction;
            });

            if(maximizeHsa) {
                totalHsaEmployeeContribution = totalLegalLimit - totalHsaEmployerContribution;
            }
            else{
                totalHsaEmployeeContribution = parseFloatOrDefault(userEnteredEmployeeHsaContribution);
            }
            combination.hsaEmployeeContribution = totalHsaEmployeeContribution;
            combination.hsaEmployerContribution = totalHsaEmployerContribution;
            combination.hsaTaxSavings = totalHsaEmployeeContribution * (marginalTaxPercentage / 100.0);
            combination.hsaImpact = totalHsaEmployerContribution + combination.hsaTaxSavings;
        };

        const calculateResults = () => {
            const planInstances = createPlanInstances(plans, familyMembers);
            const validCombinations = generateCombinations(planInstances).filter(combination =>
                isValidCombination(combination, companies, familyMembers)
            );

            validCombinations.forEach(combination => {
                combination.comboName = combination.instances.map(instance => `(${instance.planName}, ${instance.selectedCompany}, ${instance.contributionType})`).join(', ');
                calculateHsaImpact(combination);
                combination.totalFinancialImpact = combination.instances.reduce((acc, instance) => acc + instance.financialImpact, 0) + combination.hsaImpact;
            });

            const maxImpactCombination = validCombinations.reduce((max, current) => current.totalFinancialImpact > max.totalFinancialImpact ? current : max, validCombinations[0]);

            setResults(validCombinations);
            setMaxImpactCombination(maxImpactCombination);
        };

        calculateResults();
    }, [costDetails, plans, rewards, familyMembers, companies, userEnteredEmployeeHsaContribution, maximizeHsa, marginalTaxPercentage]);

    const generateCombinations = (arr) => {
        const result = [];
        const f = (prefix, arr) => {
            for (let i = 0; i < arr.length; i++) {
                result.push({ instances: [...prefix, arr[i]] });
                f([...prefix, arr[i]], arr.slice(i + 1));
            }
        };
        f([], arr);
        return result;
    };

    const isValidCombination = (combination, companies, familyMembers) => {
        if (combination.instances.length > companies.length) return false;

        const selectedCompanies = new Set();
        const coveredMembers = new Set();
        const memberCount = {};

        for (const instance of combination.instances) {
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
                                value={userEnteredEmployeeHsaContribution}
                                onChange={(e) => setUserEnteredEmployeeHsaContribution(e.target.value)}
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
                <h3>Enter Cost Details</h3>
                {Object.entries(costDetails).map(([memberName, costs]) => (
                    <div key={memberName}>
                        <h4>{memberName}</h4>
                        {Object.entries(costs).map(([costName, costDetail]) => (
                            <div key={costName}>
                                <h5>{costName}</h5>
                                <label>
                                    Instances:
                                    <input
                                        type="number"
                                        value={costDetail.instances}
                                        onChange={(e) => setCostDetails(prevDetails => ({
                                            ...prevDetails,
                                            [memberName]: {
                                                ...prevDetails[memberName],
                                                [costName]: {
                                                    ...prevDetails[memberName][costName],
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
                                        value={costDetail.totalCost}
                                        onChange={(e) => setCostDetails(prevDetails => ({
                                            ...prevDetails,
                                            [memberName]: {
                                                ...prevDetails[memberName],
                                                [costName]: {
                                                    ...prevDetails[memberName][costName],
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
                <h3>Valid Plan Combinations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {results.map(({ instances, totalFinancialImpact, hsaEmployeeContribution, hsaEmployerContribution, hsaTaxSavings, hsaImpact }, index) => (
                        <div key={index} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: totalFinancialImpact === maxImpactCombination.totalFinancialImpact ? '#d4edda' : 'transparent' }}>
                            <h4>Combination {index + 1}</h4>
                            {instances.map((instance, idx) => (
                                <div key={idx}>
                                    <h5>({instance.planName}, {instance.selectedCompany}, {instance.contributionType})</h5>
                                    <div>Expected Rewards: ${instance.expectedRewards.toFixed(2)}</div>
                                    <div>Payroll Premiums: ${instance.totalEmployeeContribution.toFixed(2)}</div>
                                    <div>Health Care Costs:</div>
                                    <ul>
                                        {instance.healthCareCosts.map((cost, costIdx) => (
                                            <li key={costIdx}>{cost.name}: ${cost.totalCost.toFixed(2)}</li>
                                        ))}
                                    </ul>
                                    <div>Total Health Care Costs: ${instance.totalHealthCareCosts.toFixed(2)}</div>
                                    <div><strong>Financial Impact: ${instance.financialImpact.toFixed(2)}</strong></div>
                                </div>
                            ))}
                            <div>HSA Employee Contribution: ${hsaEmployeeContribution.toFixed(2)}</div>
                            <div>HSA Employer Contribution: ${hsaEmployerContribution.toFixed(2)}</div>
                            <div>HSA Tax Savings: ${hsaTaxSavings.toFixed(2)}</div>
                            <div>HSA Impact: ${hsaImpact.toFixed(2)}</div>
                            <div><strong>Total Financial Impact: ${totalFinancialImpact.toFixed(2)}</strong></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Results;