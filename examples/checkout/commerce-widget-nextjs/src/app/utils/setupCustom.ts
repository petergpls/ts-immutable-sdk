// Import the checkout and config modules from the Immutable SDK package
import { checkout, config, passport } from '@imtbl/sdk';

// Create a new Immutable SDK configuration

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? '';
const PUBLIC_CLIENT_ID = process.env.PUBLIC_CLIENT_ID ?? '';

// Set the environment to SANDBOX for testnet or PRODUCTION for mainnet
const baseConfig = {
  environment: config.Environment.SANDBOX,
  publishableKey: PUBLISHABLE_KEY,
};

const passportInstance = new passport.Passport({
  baseConfig,
  clientId: PUBLIC_CLIENT_ID, // Replace with your actual client ID
  redirectUri: 'http://localhost:3000/redirect,rungame://callback', // Replace with your redirect URI
  logoutRedirectUri: 'http://localhost:3000/logout,rungame://logout', // Replace with your logout URI
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

// Instantiate the Checkout SDKs with the default configurations
const checkoutInstance = new checkout.Checkout({
  baseConfig,
  bridge: { enable: true },
  onRamp: { enable: true },
  swap: { enable: true },
  passport: passportInstance,
});