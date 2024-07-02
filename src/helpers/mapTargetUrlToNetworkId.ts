import { constants } from "starknet";

const DEVELOPMENT_NETWORK = constants.StarknetChainId.SN_SEPOLIA;

export function mapTargetUrlToNetworkId(target: string): constants.StarknetChainId {
  try {
    const { origin } = new URL(target);
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return DEVELOPMENT_NETWORK;
    }
    if (origin.includes("hydrogen")) {
      return constants.StarknetChainId.SN_SEPOLIA;
    }
    if (origin.includes("staging")) {
      return constants.StarknetChainId.SN_MAIN;
    }
    if (origin.includes("dev")) {
      return constants.StarknetChainId.SN_SEPOLIA;
    }
    if (origin.includes("argent.xyz")) {
      return constants.StarknetChainId.SN_MAIN;
    }
  } catch (e) {
    console.warn("Could not determine network from target URL, defaulting to mainnet-alpha");
  }
  return constants.StarknetChainId.SN_MAIN;
}
