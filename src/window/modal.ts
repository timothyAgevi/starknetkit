import type { GetWalletOptions } from "get-starknet-core";
import { StarknetWindowObject } from "starknet-types";
import type {
  Connector,
  ConnectorData,
  ConnectorIcons,
} from "../connectors/connector";
import type { ArgentMobileConnectorOptions } from "../connectors/argentMobile";

export type StoreVersion = "chrome" | "firefox" | "edge";

export interface ConnectOptions extends GetWalletOptions {
  argentMobileOptions?: ArgentMobileConnectorOptions;
  dappName?: string;
  connectors?: Connector[];
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk";
  modalTheme?: "light" | "dark" | "system";
  storeVersion?: StoreVersion | null;
  webWalletUrl?: string;
  resultType?: "connector" | "wallet";
}

export type ModalWallet = {
  name: string;
  id: string;
  icon: ConnectorIcons;
  download?: string;
  subtitle?: string;
  title?: string;
  connector: Connector;
}

export type ModalResult = {
  connector: Connector | null;
  connectorData: ConnectorData | null;
  wallet?: StarknetWindowObject | null;
}
