import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const notOffered = (type) => ({ type, notOffered: true, biweeklyContribution: '' });

const plan = (overrides) => ({
  individualDeductible: 1000,
  individualOOPMax: 3000,
  familyDeductible: 2000,
  familyOOPMax: 6000,
  coinsurance: 20,
  costs: [],
  selectedCompanies: ['acme'],
  hsaEligible: false,
  individualFixedEmployerContribution: '',
  individualEmployerMaxMatch: '',
  individualEmployerMatchPercentage: '',
  familyFixedEmployerContribution: '',
  familyEmployerMaxMatch: '',
  familyEmployerMatchPercentage: '',
  ...overrides,
});

const fixture = {
  companies: ['acme'],
  costNames: [],
  familyMembers: [{ name: 'me', companies: ['acme'] }],
  plans: [
    plan({
      planName: 'HSA',
      hsaEligible: true,
      individualFixedEmployerContribution: 500,
      employeeContributions: [
        { type: 'employeeOnly', notOffered: false, biweeklyContribution: '50' },
        notOffered('employeeSpouse'),
        notOffered('employeeChildren'),
        notOffered('family'),
      ],
    }),
    plan({
      planName: 'Copay',
      employeeContributions: [
        { type: 'employeeOnly', notOffered: false, biweeklyContribution: '20' },
        notOffered('employeeSpouse'),
        notOffered('employeeChildren'),
        notOffered('family'),
      ],
    }),
  ],
};

test('imported plans produce expected financial impact', () => {
  window.history.pushState({}, '', '/health-benefits-comparison-tool/');
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(/paste json/i), {
    target: { value: JSON.stringify(fixture) },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Import' }));

  expect(screen.getByText('Total Financial Impact: $-800.00')).toBeInTheDocument();
  expect(screen.getByText('Total Financial Impact: $-520.00')).toBeInTheDocument();
});
