
import { COMMUNICATION_TYPE, REQUEST_EVENTS, RESPONSE_EVENTS } from './events';
import {
  messageResponseListener,
} from './messageResponseListener';
import { postRequestMessage } from './postRequestMessage';
import {
  SignMessageRequest,
  SignMessageResponse,
} from './types';
import { StarkSigner } from '../../../types';

export class ImxSigner implements StarkSigner {
  private publicAddress;
  private iframe;

  constructor(publicAddress: string, iframe: HTMLIFrameElement) {
    this.publicAddress = publicAddress;
    this.iframe = iframe;
  }

  public getAddress(): string {
    return this.publicAddress;
  }

  public signMessage(rawMessage: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        messageResponseListener<SignMessageResponse>(
          event,
          RESPONSE_EVENTS.SIGN_MESSAGE_RESPONSE,
          this.iframe,
          (messageDetails) => {
            window.removeEventListener(COMMUNICATION_TYPE, listener);

            if (!messageDetails.success) {
              reject(new Error(messageDetails.error?.message));
            }

            resolve(messageDetails.data.signedMessage);
          },
        );
      };
      window.addEventListener(COMMUNICATION_TYPE, listener);

      postRequestMessage<SignMessageRequest>({
        type: REQUEST_EVENTS.SIGN_MESSAGE_REQUEST,
        details: { starkPublicKey: this.publicAddress, message: rawMessage },
      }, this.iframe);
    });
  }

  public getIframe(): HTMLIFrameElement {
    return this.iframe;
  }
}
