# Marathon Training App Development Guide

## Build Commands
- Start development server: `npm start`
- Build for production: `npm run build`
- Run tests: `npm test`
- Run single test: `npm test -- -t "test name"`
- Deploy to GitHub Pages: `npm run deploy`
- Deploy to Firebase: `npm run firebase-deploy`
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

