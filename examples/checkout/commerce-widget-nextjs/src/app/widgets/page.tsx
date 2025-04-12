"use client";
import { Box } from '@biom3/react';
import { checkout, config, passport } from '@imtbl/sdk';
import { CommerceFlowType, ConnectionSuccess, Widget, WidgetType } from '@imtbl/sdk/checkout';
import { useEffect, useState } from 'react';

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
  redirectUri: 'http://localhost:3000/redirect,rungame://callback', // Replace with your redirect URI
  logoutRedirectUri: 'http://localhost:3000/logout,rungame://logout', // Replace with your logout URI
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

function Widgets() {

  const [widget, setWidget] = useState<Widget<WidgetType.IMMUTABLE_COMMERCE>>();

  useEffect(() => {

    const loadWidgets = async () => {
      const widgetsFactory = await checkoutSDK.widgets({ config: {} });
      console.log('T1'); // PeterG
      const widget = widgetsFactory.create(WidgetType.IMMUTABLE_COMMERCE, {})
      setWidget(widget);
    }

    loadWidgets();
  }, []);


  useEffect(() => {
    if (!widget) return;
    console.log('T2'); // PeterG
    widget.mount("widget-root", {
      flow: CommerceFlowType.WALLET,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        // capture provider after user connects their wallet
        if (type === checkout.CommerceSuccessEventType.CONNECT_SUCCESS) {
          
          const { walletProviderName } = data as ConnectionSuccess;
          console.log('connected to ', walletProviderName);
          // setProvider(data.provider);

          // optional, immediately close the widget
          // widget.unmount();
        }
      }
    );

    // detect when user fails to connect
    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.CONNECT_FAILED) {
          console.log('failed to connect', data.reason);
        }
      }
    );

    // remove widget from view when closed
    widget.addListener(checkout.CommerceEventType.CLOSE, () => {
      widget.unmount();
    });

    // clean up event listeners
    return () => {
      widget.removeListener(checkout.CommerceEventType.SUCCESS);
      widget.removeListener(checkout.CommerceEventType.DISCONNECTED);
      widget.removeListener(checkout.CommerceEventType.CLOSE);
    };


  }, [widget]);


  return (
    <div>
      <Box
        id="widget-root"
        sx={{
          minw: "430px",
          minh: "650px",
          bg: "base.color.translucent.standard.300",
          brad: "base.borderRadius.x5",
        }}
      />
    </div>
  )
}

export default Widgets;
