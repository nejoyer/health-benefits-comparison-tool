import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Results({ companies, costNames, familyMembers, plans, rewards, clearAllData }) {
    const [maximizeHsa, setMaximizeHsa] = useState(false);
    const [employeeHsaContribution, setEmployeeHsaContribution] = useState(0);
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
                            return acc + (parseFloat(plan.rewards?.[member.name]) || 0);
                        }, 0);

                        let hsaEmployerContribution = 0;
                        let tempEmployeeHsaContribution = 0;
                        if (plan.hsaEligible) {
                            const fixedContribution = contribution.type === 'employeeOnly'
                                ? parseFloat(plan.individualFixedEmployerContribution)
                                : parseFloat(plan.familyFixedEmployerContribution);

                            const maxMatch = contribution.type === 'employeeOnly'
                                ? parseFloat(plan.individualEmployerMaxMatch)
                                : parseFloat(plan.familyEmployerMaxMatch);

                            const matchPercentage = contribution.type === 'employeeOnly'
                                ? parseFloat(plan.individualEmployerMatchPercentage)
                                : parseFloat(plan.familyEmployerMatchPercentage);

                            if (fixedContribution) {
                                hsaEmployerContribution = fixedContribution;
                            } else {
                                if (maximizeHsa) {
                                    hsaEmployerContribution = maxMatch;
                                } else {
                                    const calculatedMatch = (parseFloat(employeeHsaContribution) * matchPercentage) / 100.0;
                                    hsaEmployerContribution = Math.min(calculatedMatch, maxMatch);
                                }
                            }

                            if (maximizeHsa) {
                                tempEmployeeHsaContribution = contribution.type === 'employeeOnly' ? 4300 - hsaEmployerContribution : 8550 - hsaEmployerContribution;
                            } else {
                                tempEmployeeHsaContribution = parseFloat(employeeHsaContribution);
                            }
                        }

                        const hsaTaxSavings = (tempEmployeeHsaContribution * parseFloat(marginalTaxPercentage)) / 100.0;

                        const healthCareCosts = coveredMembers.map(member => {
                            const totalCost = Object.entries(costDetails[member.name]).reduce((costAcc, [costName, costDetail]) => {
                                const planCost = plan.costs.find(c => c.costName === costName);
                                if (planCost) {
                                    if (planCost.isCoinsurance) {
                                        return costAcc + parseFloat(costDetail.totalCost);
                                    } else {
                                        return costAcc + (parseFloat(costDetail.instances) * parseFloat(planCost.copayAmount));
                                    }
                                }
                                return costAcc;
                            }, 0);

                            let memberCost = totalCost;
                            if (totalCost > parseFloat(plan.individualDeductible)) {
                                const coinsuranceAmount = (totalCost - parseFloat(plan.individualDeductible)) * (parseFloat(plan.coinsurance) / 100.0);
                                memberCost = parseFloat(plan.individualDeductible) + coinsuranceAmount;
                            }
                            if (memberCost > parseFloat(plan.individualOOPMax)) {
                                memberCost = parseFloat(plan.individualOOPMax);
                            }

                            return {
                                name: member.name,
                                totalCost: memberCost
                            };
                        });

                        const totalHealthCareCosts = healthCareCosts.reduce((acc, cost) => acc + cost.totalCost, 0);

                        const financialImpact = (expectedRewards + hsaTaxSavings + hsaEmployerContribution - parseFloat(contribution.biweeklyContribution) * 26.0 - totalHealthCareCosts).toFixed(2);

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
                            totalEmployeeContribution: parseFloat(contribution.biweeklyContribution) * 26,
                            contributionType: contribution.type,
                            coveredMembers: coveredMembers.map(member => member.name),
                            expectedRewards,
                            hsaTaxSavings,
                            hsaEmployerContribution,
                            healthCareCosts,
                            totalHealthCareCosts,
                            financialImpact: parseFloat(financialImpact)
                        };
                        planInstances.push(planInstance);
                    }
                });
            });

            return planInstances;
        };

        const calculateResults = () => {
            const planInstances = createPlanInstances(plans, familyMembers);
            const validCombinations = generateCombinations(planInstances).filter(combination =>
                isValidCombination(combination, companies, familyMembers)
            );

            const combinationsWithImpact = validCombinations.map(combination => {
                const totalFinancialImpact = combination.reduce((acc, instance) => acc + instance.financialImpact, 0);
                return { combination, totalFinancialImpact };
            });

            const maxImpactCombination = combinationsWithImpact.reduce((max, current) => current.totalFinancialImpact > max.totalFinancialImpact ? current : max, combinationsWithImpact[0]);

            setResults(combinationsWithImpact);
            setMaxImpactCombination(maxImpactCombination);
        };

        calculateResults();
    }, [costDetails, plans, rewards, familyMembers, companies, employeeHsaContribution, maximizeHsa, marginalTaxPercentage]);

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
                    {results.map(({ combination, totalFinancialImpact }, index) => (
                        <div key={index} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: totalFinancialImpact === maxImpactCombination.totalFinancialImpact ? '#d4edda' : 'transparent' }}>
                            <h4>Combination {index + 1}</h4>
                            {combination.map((instance, idx) => (
                                <div key={idx}>
                                    <h5>({instance.planName}, {instance.selectedCompany}, {instance.contributionType})</h5>
                                    <div>Expected Rewards: ${instance.expectedRewards.toFixed(2)}</div>
                                    <div>HSA Tax Savings: ${instance.hsaTaxSavings.toFixed(2)}</div>
                                    <div>HSA Employer Contribution: ${instance.hsaEmployerContribution.toFixed(2)}</div>
                                    <div>Payroll Deductions: ${instance.totalEmployeeContribution.toFixed(2)}</div>
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
                            <div><strong>Total Financial Impact: ${totalFinancialImpact.toFixed(2)}</strong></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Results;