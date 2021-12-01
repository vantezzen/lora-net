import RREP from "../../networkPackages/RREP";
import RREQ from "../../networkPackages/RREQ";
import Router, { RoutingTableEntry } from "../Router";

export async function sendRREP(entry: RoutingTableEntry, pack: RREQ, router: Router) {
  const rrep = new RREP();

  rrep.nextHop = pack.source;
  rrep.source = router.network.ownAddress;
  rrep.rreqId = pack.rreqId;
  
  rrep.destination = pack.originatorAddress;
  rrep.destinationSequenceNumber = pack.originatorSequence;
  rrep.hopCount = entry.metric;

  rrep.originatorAddress = pack.destination;
  rrep.sequenceNumber = router.network.sequenceNumber;
  router.network.increaseSequenceNumber();
  rrep.ttl = pack.hopCount + 1;

  router.log("Sending RREP for", pack.destination, "with sequence number", rrep.destinationSequenceNumber);

  await router.sendWithAck(rrep);
}