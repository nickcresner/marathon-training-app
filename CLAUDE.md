# Marathon Training App Development Guide

## Build Commands
- Start development server: `npm start`
- Start test environment: `npm run start:test`
- Start production environment: `npm run start:prod`
- Build for production: `npm run build:prod`
- Build for test: `npm run build:test`
- Run tests: `npm test`
- Run single test: `npm test -- -t "test name"`
- Deploy to test: `npm run deploy:test`
- Deploy to production: `npm run deploy:prod`
- Deploy to GitHub Pages: `npm run deploy`
- Deploy using script: `./scripts/deploy-all.sh [test|prod|gh-pages|all]`
- Eject from create-react-app: `npm run eject`

## Code Style Guidelines
- Use functional components with React hooks
- Component naming: PascalCase (WorkoutList.js)
- Variables/functions: camelCase
- Group imports: React, third-party libraries, local components
- Destructure props in function parameters
- Use Bootstrap for consistent styling
- Files structure: components in src/components/, data in src/data/

## Patterns
- Export components as default
- Conditional rendering with ternary operators
- Handle loading states and missing data with fallback UI
- Use null checks before accessing properties
- Set default values in destructuring
- JSX format: spaces inside curly braces { value }
- Use React Testing Library for component tests

## Environments
- Development: Local development environment (`npm start`)
- Test: Testing/QA environment (`npm run start:test`)
- Production: Live environment (`npm run start:prod`)

## Environment Configuration
- Use configService from './services/configService' for environment-specific code
- Feature flags are defined in configService.features
- Use configService.logDebug() for non-production logging