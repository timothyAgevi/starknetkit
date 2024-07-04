// src/connectors/TBAConnector/TBAConnector.ts
import { Connector, ConnectorData, ConnectorEvents } from "../connector";
import { TokenboundAccount } from "../../window/tokenboundAccount";
import { getTokenboundStarknetWindowObject } from "../../window/TBAStarknetWindowObject";
import { mapTargetUrlToNetworkId } from "../../helpers/mapTargetUrlToNetworkId";
import { AccountInterface, ProviderInterface, RpcProvider, constants, Account, Signer } from "starknet";
import { StarknetWindowObject } from "starknet-types";

interface TokenboundConnectorOptions {
  tokenboundAddress: string;
  parentAccountId: string;
}

export class TokenboundConnector extends Connector {
  private tokenboundAddress: string;
  private parentAccountId: string;
  public provider?: ProviderInterface;
  public accountInstance?: AccountInterface;

  constructor(options: TokenboundConnectorOptions) {
    super();
    this.tokenboundAddress = options.tokenboundAddress;
    this.parentAccountId = options.parentAccountId;
  }

  get id() {
    return "tokenbound";
  }

  get name() {
    return "Tokenbound Connector";
  }

  get icon() {
    return {
      dark: "https://tokenbound.org/_next/image?url=%2Ftb-mark.svg&w=96&q=75",
      light: "https://tokenbound.org/_next/image?url=%2Ftb-mark.svg&w=96&q=75"
    };
  }

  available() {
    return true;
  }

  async ready() {
    return true;
  }

  async connect(): Promise<ConnectorData> {
    const networkId = mapTargetUrlToNetworkId(window.location.href);
    const nodeUrl = networkId === constants.StarknetChainId.SN_MAIN ? "https://starknet-mainnet.public.blastapi.io" : "https://starknet-testnet.public.blastapi.io";
    const defaultProvider = new RpcProvider({ nodeUrl });

    // Fetch the parent account using parentAccountId
    const parentAccount = new Account(defaultProvider, this.parentAccountId, new Signer());

    const wallet = getTokenboundStarknetWindowObject({
      id: this.id,
      icon: this.icon.light,
      name: this.name,
      version: "1.0.0",
    }, this.tokenboundAddress, parentAccount, defaultProvider);

    this.provider = defaultProvider;
    this.accountInstance = new TokenboundAccount(defaultProvider, this.tokenboundAddress, parentAccount);

    const connectorData: ConnectorData = {
      account: this.tokenboundAddress,
      chainId: networkId
    };

    this.emit("connect", connectorData);
    return connectorData;
  }

  async disconnect(): Promise<void> {
    this.provider = undefined;
    this.accountInstance = undefined;
    this.emit("disconnect");
  }

  async account(): Promise<string | null> {
    return this.tokenboundAddress || null;
  }

  async chainId(): Promise<constants.StarknetChainId> {
    if (this.provider) {
      const chainId = await this.provider.getChainId();
      return chainId as constants.StarknetChainId;
    }
    throw new Error("Provider is not available");
  }

  get wallet(): StarknetWindowObject {
    const self = this; // To ensure the correct `this` context in methods

    return {
      id: this.id,
      icon: this.icon.light,
      name: this.name,
      version: "1.0.0",
      isConnected: !!this.accountInstance,
      provider: this.provider,
      async request(method: string, params?: any[]): Promise<any> {
        // Implement request logic if needed
        throw new Error("Method not implemented.");
      },
      on<E extends keyof ConnectorEvents>(event: E, listener: ConnectorEvents[E]): void {
        self.addListener(event, listener as (...args: any[]) => void);
      },
      off<E extends keyof ConnectorEvents>(event: E, listener: ConnectorEvents[E]): void {
        self.removeListener(event, listener as (...args: any[]) => void);
      },
    } as unknown as StarknetWindowObject;
  }

  // Method to fetch parent account
  private async getParentAccount(parentAccountId: string, provider: ProviderInterface): Promise<AccountInterface> {
    // Implement logic to fetch the parent account using parentAccountId and provider
    // This is a placeholder implementation and should be replaced with actual logic
    return new Account(provider, parentAccountId, new Signer());
  }
}
