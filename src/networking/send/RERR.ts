import RERR from "../../networkPackages/RERR";
import { NetworkAddress } from "../../networkPackages/utils/NetworkPackage";
import Router from "../Router";

export async function sendRRER(unavailableNode: NetworkAddress, destination: NetworkAddress, router: Router) {
  const rerr = new RERR();

  rerr.nextHop = destination;
  rerr.source = router.network.ownAddress;
  rerr.destinations = [
    {
      destination: unavailableNode,
      sequenceNumber: router.knownSequenceNumbers[unavailableNode],
    }
  ];

  router.log("Sending RRER for", unavailableNode);

  await router.sendWithAck(rerr);
}