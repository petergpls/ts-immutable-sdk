'use client';

import { useEffect } from 'react';
import { passport, config } from '@imtbl/sdk';

const baseConfig = {
  environment: config.Environment.SANDBOX,
  publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
};

const passportInstance = new passport.Passport({
  baseConfig,
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
  redirectUri: 'http://localhost:3000/redirect', // 'http://localhost:3000/redirect,rungame://callback'
  logoutRedirectUri: 'http://localhost:3000/logout', // 'http://localhost:3000/logout,rungame://logout'
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});


// PeterG - Added this via AI - IMPORTANT!!!!!!!
//================================================================================
// The console.log fcn does not get seen in chrome debugger and it looks like the 
// below fcn does not get called BUT IT DOES!.but tests have shown that 
// the logincallback is called and without this, the google federated login 
// (login with google) in passport just hangs.
//================================================================================
export default function RedirectPage() {
  useEffect(() => {
    console.log("RedirectPage called...........................................");
    passportInstance.loginCallback().then(user => {
      console.log('Passport login success:', user);
      // Optionally redirect or store user info
    }).catch(err => {
      console.error('Login error:', err);
    });
  }, []);

  return <p>Logging in...</p>;
}
