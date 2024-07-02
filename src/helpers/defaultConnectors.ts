import { Connector } from "../connectors";
import { ArgentMobileConnector, type ArgentMobileConnectorOptions } from "../connectors/argentMobile";
import { InjectedConnector } from "../connectors/injected";
import { WebWalletConnector } from "../connectors/webwallet";
import { TokenboundConnector } from "../connectors/TBAConnector";

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
}: {
  argentMobileOptions?: ArgentMobileConnectorOptions;
  webWalletUrl?: string;
}): Connector[] => {
  const isSafari =
    typeof window !== "undefined"
      ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      : false;

  const defaultConnectors: Connector[] = [];

  if (!isSafari) {
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "argentX" } }),
    );
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "braavos" } }),
    );
  }

  defaultConnectors.push(new ArgentMobileConnector(argentMobileOptions));
  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }));
  defaultConnectors.push(new TokenboundConnector({ tokenboundAddress: "", parentAccountId: "" } as any)); // Ensure options are passed correctly

  return defaultConnectors;
}
