"use client";

import { useEffect, useState } from 'react';
import { checkout, config, passport } from '@imtbl/sdk';

// create Checkout SDK
//const checkoutSDK = new checkout.Checkout();

//========================= New work PeterG =================================================
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? '';
const PUBLIC_CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID ?? '';

// Set the environment to SANDBOX for testnet or PRODUCTION for mainnet
const baseConfig = {
  environment: config.Environment.SANDBOX,
  publishableKey: PUBLISHABLE_KEY,
};

const passportInstance = new passport.Passport({
  baseConfig,
  clientId: PUBLIC_CLIENT_ID, // Replace with your actual client ID
  redirectUri: 'http://localhost:3000/redirect', // 'http://localhost:3000/redirect,rungame://callback'
  logoutRedirectUri: 'http://localhost:3000/logout', // 'http://localhost:3000/logout,rungame://logout'
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

// Instantiate the Checkout SDKs with the default configurations
const checkoutSDK = new checkout.Checkout({
  baseConfig,
  bridge: { enable: true },
  onRamp: { enable: true },
  swap: { enable: true },
  passport: passportInstance,
});
//===========================================================================================


function Sales() {
  const [widget, setWidget] =
    useState<checkout.Widget<typeof checkout.WidgetType.IMMUTABLE_COMMERCE>>();

  // Initialise widget and mount a SALE flow
  useEffect(() => {
    (async () => {
      const widgets = await checkoutSDK.widgets({
        config: { theme: checkout.WidgetTheme.DARK },
      });
      const checkoutWidget = widgets.create(checkout.WidgetType.IMMUTABLE_COMMERCE);
      setWidget(checkoutWidget);
    })();
  }, []);

  // mount primary sales widget and add event listeners66097248-6039-4fb2-9f44-ea4bea24e8d0
  useEffect(() => {
    if (!widget) return;

    const items = [
      {
        productId: 'BOSS1',
        qty: 1,
        name: 'Boss',
        image: 'https://peterg-metadata-bucket.s3.ap-southeast-2.amazonaws.com/nft-images/15.png',
        description: 'SA rugged, authority-bearing figure, exuding ....',
      },
    ];

    widget.mount('mount-point', {
      flow: checkout.CommerceFlowType.SALE,
      language: 'en',
      environmentId: '66097248-6039-4fb2-9f44-ea4bea24e8d0', // From project->settings in hub
      collectionName: 'WorkProjectERC721',
      items: items,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        // narrow the event to a successfull sale event
        if (payload.type === checkout.CommerceSuccessEventType.SALE_SUCCESS) {
          const { transactionHash } = payload.data;
          console.log('successfull sale', transactionHash);
        } if (payload.type === checkout.CommerceSuccessEventType.SALE_TRANSACTION_SUCCESS) {
          const { paymentMethod, transactions } = payload.data;
          console.log('successfull sale transaction', paymentMethod, transactions);
        }
      }
    );

    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        // narrow the event to a failed sale event
        if (payload.type === checkout.CommerceFailureEventType.SALE_FAILED) {
          const { reason, timestamp } = payload.data;
          console.log('sale failed', reason, timestamp);
        }
      }
    );

    widget.addListener(
      checkout.CommerceEventType.USER_ACTION,
      (payload: checkout.CommerceUserActionEvent) => {
        if (payload.type === checkout.CommerceUserActionEventType.PAYMENT_METHOD_SELECTED) {
          const { paymentMethod } = payload.data;
          console.log('Payment method selected:', paymentMethod);
        }
      }
    );

    widget.addListener(checkout.CommerceEventType.CLOSE, () => {
      widget.unmount();
      console.log('widget closed');
    });

    // clean up event listeners
    return () => {
      widget.removeListener(checkout.CommerceEventType.SUCCESS);
      widget.removeListener(checkout.CommerceEventType.CLOSE);
      widget.removeListener(checkout.CommerceEventType.FAILURE);
      widget.removeListener(checkout.CommerceEventType.USER_ACTION);
    };
  }, [widget]);

  return <div id="mount-point" />;
}

export default Sales;