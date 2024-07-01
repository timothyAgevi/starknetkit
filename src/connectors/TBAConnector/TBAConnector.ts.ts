import { Connector } from "../connector";
import { TokenboundAccount } from "../../windowObject/tokenboundAccount";
import { getTokenboundStarknetWindowObject } from "../../windowObject/TBAStarknetWindowObject";
import { mapTargetUrlToNetworkId } from "../../helpers/mapTargetUrlToNetworkId";
import { AccountInterface, ProviderInterface, RpcProvider } from "starknet";

interface TokenboundConnectorOptions {
  tokenboundAddress: string;
  parentAccountId: string;
}

export class TokenboundConnector extends Connector {
  private tokenboundAddress: string;
  private parentAccountId: string;
  private provider?: ProviderInterface;
  private account?: AccountInterface;

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

  async connect() {
    const networkId = mapTargetUrlToNetworkId(window.location.href);
    const nodeUrl = networkId === "SN_MAIN" ? "https://starknet-mainnet.public.blastapi.io" : "https://starknet-testnet.public.blastapi.io";
    const defaultProvider = new RpcProvider({ nodeUrl });
    const wallet = getTokenboundStarknetWindowObject({
      id: this.id,
      icon: this.icon.light,
      name: this.name,
      version: "1.0.0",
    }, this.tokenboundAddress, this.parentAccountId, defaultProvider);

    this.provider = defaultProvider;
    this.account = wallet.account as AccountInterface;

    this.emit("connect", { account: this.tokenboundAddress, chainId: BigInt(wallet.provider.chainId) });
    return wallet;
  }

  async disconnect() {
    this.provider = undefined;
    this.account = undefined;
    this.emit("disconnect");
  }

  async account() {
    return this.tokenboundAddress;
  }

  async chainId() {
    return BigInt(this.provider?.chainId || "0");
  }

  get wallet() {
    return {
      id: this.id,
      icon: this.icon.light,
      name: this.name,
      version: "1.0.0",
    };
  }
}
