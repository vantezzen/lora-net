import Network from "../../Network";
import RREQ from "../../networkPackages/RREQ";
import { NetworkAddress } from "../../networkPackages/utils/NetworkPackage";
import Router from "../Router";

export async function sendRREQ(destination: NetworkAddress, router: Router) {
  const request = new RREQ();

  request.nextHop = Network.BROADCAST_ADDRESS;
  request.source = router.network.ownAddress;
  request.rreqId = router.currentRreqId++;

  request.destination = destination;
  const lastKnownDestinationSeqNum = router.routingTable.reduce<number>((lastKnown, entry) => {
    if (entry.destination === destination) {
      return entry.sequenceNumber;
    }
    return lastKnown;
  }, 0);
  request.destinationSequenceNumber = lastKnownDestinationSeqNum;
  
  request.hopCount = 0;

  request.originatorAddress = router.network.ownAddress;
  request.originatorSequence = router.network.sequenceNumber;
  router.network.increaseSequenceNumber();

  router.log("Sending RREQ for", destination, "with sequence number", request.sequenceNumber);

  await router.sendWithAck(request);
}