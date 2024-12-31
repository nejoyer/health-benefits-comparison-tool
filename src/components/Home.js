// src/components/Home.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home({ setCompanies, setCostNames, setFamilyMembers, setPlans }) {
  const [importData, setImportData] = useState('');
  const navigate = useNavigate();

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      setCompanies(data.companies);
      setCostNames(data.costNames);
      setFamilyMembers(data.familyMembers);
      setPlans(data.plans);
      navigate('/results');
    } catch (error) {
      console.error('Invalid JSON data:', error);
    }
  };

  return (
    <div>
      <h2>Welcome</h2>
      <p>Please note that this tool is for informational purposes only and may not cover all aspects of healthcare plans. For detailed and personalized advice, consult a healthcare benefits advisor.</p>
      <p>A non-exhaustive list of limitations</p>
      <ul>
        <li>This is for financial considerations only. You might be better off choosing only on if the network covers your preferred provider.</li>
        <li>This doesn't evaluate the time-cost of money (ie. cashflow since I include HSA tax savings, but you might not get that until you get your refund in the spring), nor any expected future growth on tax-advantaged HSA investments.</li>
        <li>Assumption: For plans with multiple people, I assume that the Annual Deductible per-person is what the individual deductible would be for the same plan and that the OOPM per-person is what the individual OOPM would be for the same plan. (In my experience this has always been the case for the plans I've seen, but I don't know how universal that is).</li>
        <li>I did not evaluate situations where an individual would be covered by multiple plans... mostly because I've never been in that situation and I don't know how the insurance would be applied.</li>
        <li>I assume at MOST 2 working adults (non-dependents)... I'm not sure if more than 2 is a valid tax situation. I don't know how to cover it.</li>
        <li>I didn't cover the craziest edge cases, like if your employer's fixed + max match is greater than the IRS limits.</li>
        <li>Some code for this project was generated using an LLM for expedience and uses coding constructs which I neither understand nor condone... but seem to work.</li>
        <li>Last edited in November 2024 with Tax Year 2025 in mind (for things like HSA contribution limits)</li>
        <li>This hasn't been extensively tested... I probably got some of the calculations wrong. Check the math yourself. If you find discrepancies, let me know (better yet, send PRs).</li>
        <li>The UI is intentionally clunky to show this is an app that was thrown together... so... caveat emptor.</li>
        <li>Source code is at <a href='https://github.com/nejoyer/health-benefits-comparison-tool'>https://github.com/nejoyer/health-benefits-comparison-tool</a>. No warranty expressed or implied.</li>
        <li>Deployed at 2024-12-16 11:06pm</li>
        <li>Privacy: All of the data is just stored in memory on your browser. Nothing is sent to a server. No cookies are used. If you refresh the page, the data is gone.</li>
      </ul>
      <h2>Instructions</h2>
      <ol>
        <li>At any point in the process, click the "Export Data" button to get a json file that has the information that you've entered so far.
          <ul>
            <li>This allows you to come back to it at any time.</li>
            <li>The data that you enter is entirely on your computer in your browser and is never sent to a server.</li>
            <li>No cookies are even used to save your work.</li>
          </ul>
        </li>
        <li>Enter your company names (any identifier is fine, initials work great) that you work for. 
          <ul>
            <li>There must be one company name per spouse. </li>
            <li>If your spouse works in the home, then create a company "home". </li>
            <li>If both spouses work at the same company, then enter the company once and then again as "[your company]-b".</li>
          </ul>
        </li>
        <li>Enter the names of costs that are different between the plans.
          <ul>
            <li>For Example, the most common ones are "Office Visit" and "Specialist Visit".</li>
            <li>Don't worry about entering anything that will just be full cost against your deductible and coinsurance after that.</li>
            <li>Don't enter anything that is covered on every plan with no cost to you (ex. Preventative Care).</li>
          </ul>
        </li>
        <li>Enter each healthcare option available to you (ex. a Copay plan and an HSA plan for each partner (if applicable)
          <ul>
            <li>Specify which company is offering the plan</li>
            <li>Coinsurance is a percentage (ex. "20") that you pay after your deductible up until you've reached your Out Of Pocket Max (OOP Max).</li>
            <li>Deductible and OOP max are in dollars.</li>
            <li>If the plan is HSA eligible, check the box and fill out any relevant employer contributions. Some employers just put money in. Others match a percentage with a max amount they'll contribute. Just fill out the relevant sections.</li>
            <li>Employee Contribution is what the bi-weekly (every two weeks) cost to you to be in that plan is.</li>
            <li>Then say what each cost is for that plan. If the plan is a high-deductible HSA plan, then the cost for most things will likely just be out of pocket until deductible, then coinsurance up to OOP Max. For those cases, check the "coinsurance" button.</li>
          </ul>
        </li>
        <li>
          Enter your family members (any identifer/nickname is fine)
          <ul>
            <li>For each family member select the company they work for.</li>
            <li>Children (dependants) will be identified as those without a company assigned to them.</li>
          </ul>
        </li>
        <li>Enter how much each family member would make in rewards dollars if they were on each plan. (I've seen some amazing rewards programs, so that can really swing the results if you're able to capitalize on those). If there is no rewards program or if any individual is ineligible, just leave it at 0.</li>
        <li>
          Results Page:
          <ul>
            <li>You can enter how much you would contribute to an HSA. Enter your marginal tax rate as a percentage. <a href='https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025'>Tax Rates.</a> </li>
            <li>Then enter a scenario for your health care consumption. For each of the cost types you entered, enter how many times you'll use that type of health care. 
              <ul>
                <li>Ex. If you think you would go to the doctor for a "office visit" twice and between the two times, that would cost $500 ($250 each), then put 2 instances and 500 total.</li>
                <li>Anything that isn't broken out by your cost types, just put in "Other Costs" (instances doesn't really matter). These are things that will just go against your deductible and the coinsurance for every plan.</li>
              </ul>
            </li>
            <li>As you enter your information, the results at the bottom will update showing you which plans have the best financial impact to you.</li>
          </ul>          
        </li>


      </ol>
      <Link to="/companies">
        <button>Get Started</button>
      </Link>
      <div>
        <h3>Import Data</h3>
        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste JSON data here"
          rows="10"
          cols="50"
        />
        <button onClick={handleImport}>Import</button>
      </div>
    </div>
  );
}

export default Home;
