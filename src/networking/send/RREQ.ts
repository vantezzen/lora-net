import Network from "../../Network";
import RREQ from "../../networkPackages/RREQ";
import { NetworkAddress } from "../../networkPackages/utils/NetworkPackage";
import Router from "../Router";

export async function sendRREQ(destination: NetworkAddress, router: Router): Promise<RREQ> {
  const request = new RREQ();

  request.nextHop = Network.BROADCAST_ADDRESS;
  request.source = router.network.ownAddress;
  request.sequenceNumber = router.network.sequenceNumber;
  request.rreqId = router.currentRreqId++;

  request.destination = destination;
  request.destinationSequenceNumber = router.knownSequenceNumbers[destination] || 0;
  if (!router.knownSequenceNumbers.hasOwnProperty(destination)) {
    request.flags += 1;
  }
  
  request.hopCount = 0;

  request.originatorAddress = router.network.ownAddress;
  request.originatorSequence = router.network.sequenceNumber;
  router.network.increaseSequenceNumber();

  router.log("Sending RREQ for", destination, "with sequence number", request.sequenceNumber);

  await router.network.sendPackage(request);

  return request;
}