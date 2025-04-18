import {
  ReactNode, useRef, useState,
} from 'react';
import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  WalletProviderRdns,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';

import { MenuItemProps } from '@biom3/react';
import { UnableToConnectDrawer } from '../../../components/UnableToConnectDrawer/UnableToConnectDrawer';
import { WalletDrawer } from '../../../components/WalletDrawer/WalletDrawer';
import { WalletChangeEvent } from '../../../components/WalletDrawer/WalletDrawerEvents';
import { useAnalytics, UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useProvidersContext, ProvidersContextActions } from '../../../context/providers-context/ProvidersContext';
import { identifyUser } from '../../../lib/analytics/identifyUser';
import { ConnectEIP6963ProviderError, connectEIP6963Provider } from '../../../lib/connectEIP6963Provider';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import { removeSpace } from '../../../lib/utils';

type PurchaseConnectWalletDrawerProps = {
  heading: string;
  visible: boolean;
  onClose: (address?: string) => void;
  onConnect?: (
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
  onError?: (errorType: ConnectEIP6963ProviderError) => void;
  providerType: 'from' | 'to';
  walletOptions: EIP6963ProviderDetail[];
  bottomSlot?: ReactNode;
  menuItemSize?: MenuItemProps['size'];
  disabledOptions?: {
    label: string;
    rdns: string;
  }[];
  shouldIdentifyUser?: boolean;
};

export function PurchaseConnectWalletDrawer({
  heading,
  visible,
  onClose,
  onConnect,
  onError,
  providerType,
  walletOptions,
  bottomSlot,
  menuItemSize = 'small',
  disabledOptions = [],
  shouldIdentifyUser = true,
}: PurchaseConnectWalletDrawerProps) {
  const {
    providersState: { checkout },
    providersDispatch,
  } = useProvidersContext();

  const { identify, track, user } = useAnalytics();

  const prevWalletChangeEvent = useRef<WalletChangeEvent | undefined>();

  const [showUnableToConnectDrawer, setShowUnableToConnectDrawer] = useState(false);

  const setProviderInContext = async (
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    const address = await (await provider.getSigner()).getAddress();
    providersDispatch({
      payload: {
        type: ProvidersContextActions.SET_PROVIDER,
        fromAddress: address,
        fromProvider: provider,
        fromProviderInfo: providerInfo,
      },
    });

    providersDispatch({
      payload: {
        type: ProvidersContextActions.SET_PROVIDER,
        toAddress: address,
        toProvider: provider,
        toProviderInfo: providerInfo,
      },
    });

    return address;
  };

  const handleWalletConnection = async (event: WalletChangeEvent) => {
    const { providerDetail } = event;
    const { info } = providerDetail;

    // Trigger analytics connect wallet, menu item, with wallet details
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: removeSpace(info.name),
      controlType: 'MenuItem',
      extras: {
        providerType,
        wallet: getProviderSlugFromRdns(info.rdns),
        walletRdns: info.rdns,
      },
    });

    if (info.rdns === WalletProviderRdns.PASSPORT) {
      const { isConnected } = await checkout.checkIsWalletConnected({
        provider: new WrappedBrowserProvider(providerDetail.provider!),
      });

      if (isConnected) {
        await checkout.passport?.logout();
      }
    }

    let address: string | undefined;

    try {
      const { provider } = await connectEIP6963Provider(
        providerDetail,
        checkout,
        true,
      );

      // Identify connected wallet, retaining current anonymousId
      if (shouldIdentifyUser) {
        const userData = user ? await user() : undefined;
        const anonymousId = userData?.anonymousId();

        await identifyUser(identify, provider, { anonymousId });
      }

      // Store selected provider as fromProvider in context
      address = await setProviderInContext(provider, providerDetail.info);

      // Notify successful connection
      onConnect?.(provider, providerDetail.info);
    } catch (error: ConnectEIP6963ProviderError | any) {
      let errorType = error.message;
      switch (error.message) {
        case ConnectEIP6963ProviderError.CONNECT_ERROR:
          setShowUnableToConnectDrawer(true);
          break;
        default:
          errorType = ConnectEIP6963ProviderError.CONNECT_ERROR;
      }

      // Notify failure to connect
      onError?.(errorType as ConnectEIP6963ProviderError);
      return;
    }

    onClose(address);
  };

  const handleOnWalletChangeEvent = async (event: WalletChangeEvent) => {
    // Keep prev wallet change event
    prevWalletChangeEvent.current = event;

    handleWalletConnection(event);
  };

  return (
    <>
      <WalletDrawer
        testId="select-from-wallet-drawer"
        showWalletConnect
        showDrawer={visible}
        drawerText={{ heading }}
        walletOptions={walletOptions}
        disabledOptions={disabledOptions}
        menuItemSize={menuItemSize}
        setShowDrawer={(show: boolean) => {
          if (show === false) onClose();
        }}
        onWalletChange={handleOnWalletChangeEvent}
        bottomSlot={bottomSlot}
      />
      <UnableToConnectDrawer
        visible={showUnableToConnectDrawer}
        checkout={checkout!}
        onCloseDrawer={() => setShowUnableToConnectDrawer(false)}
        onTryAgain={() => setShowUnableToConnectDrawer(false)}
      />
    </>
  );
}
