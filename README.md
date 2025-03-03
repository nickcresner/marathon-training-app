# Marathon Training App

A comprehensive application for managing marathon training plans, tracking workouts, and improving running performance.

## Environments

This application supports three environments:

- **Development**: Local development environment
- **Test**: Testing environment for QA and validation
- **Production**: Live production environment

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/marathon-training-app.git
   cd marathon-training-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Environment-specific Commands

### Development
```
npm start
```

### Test
```
npm run start:test
npm run build:test
npm run deploy:test
```

### Production
```
npm run start:prod
npm run build:prod
npm run deploy:prod
```

## Deployment

The app can be deployed to different environments:

- **GitHub Pages**: For production hosting
  ```
  npm run deploy
  ```

- **Firebase (Test Environment)**:
  ```
  npm run deploy:test
  ```

- **Firebase (Production Environment)**:
  ```
  npm run deploy:prod
  ```

## Environment Configuration

Environment-specific configurations are managed through `.env` files:

- `.env.development` - Development environment settings
- `.env.test` - Test environment settings
- `.env.production` - Production environment settings
- `.env.local` - Local overrides (gitignored)

## Feature Flags

Use `configService` to check for environment-specific features:

```javascript
import configService from './services/configService';

if (configService.isFeatureEnabled('enableDebugLogging')) {
  // Do something for debug mode
}
```

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

## CRA Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
For more information about Create React App, please refer to the [CRA documentation](https://facebook.github.io/create-react-app/docs/getting-started).
