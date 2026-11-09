# health-benefits-comparison-tool

Try the tool out at https://nejoyer.github.io/health-benefits-comparison-tool/

## Yearly update
Should be done in `src/constants.js` (tax year, HSA limits from the IRS Rev. Proc. published each May, tax bracket link).

## Locally:
Node LTS version is pinned in `.nvmrc` (`fnm use` / `nvm use`).
npm install
npm start
Then browse: http://localhost:5173/health-benefits-comparison-tool/

## Tests:
npm test

## Your plan data:
Keep exported JSON in `data/` (gitignored; this repo is public). Paste it into "Import Data" on the home page.

## To deploy:
npm run deploy
