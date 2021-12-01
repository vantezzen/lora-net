import RREQ from "../../networkPackages/RREQ";
import Router, { ReverseRoutingTableEntry } from "../Router";
import sendACK from "../send/ACK";
import { sendRREP } from "../send/RREP";

export async function handleRREQ(pack: RREQ, router: Router) {
  router.log("Received RREQ from", pack.source, "for", pack.destination);

  pack.hopCount++;
  pack.ttl--;

  if (pack.originatorAddress === router.network.ownAddress) {
    router.log("Ignoring RREQ from myself");
    return;
  }

  const hasReverseRouteEntry = router.reverseRoutingTable.find(entry => (entry.rreqId === pack.rreqId && entry.source === pack.originatorAddress));
  if (hasReverseRouteEntry) {
    router.log("RREQ already handled");
    return;
  }

  // Check if we have an existing route to the destination
  const entry = router.routingTable.find(entry => {
    router.log('Checking routing table entry', entry, entry.destination, pack.destination, entry.isValid);
    return (
      entry.destination === pack.destination &&
      entry.isValid
      // TODO: Check if Sequence Number is newer
      // isSeqNumNewerOrEqual(entry.sequenceNumber, pack.destinationSequenceNumber)
    );
  });
  if (entry) {
    await sendRREP(entry, pack, router);
    return;
  }

  // Create reverse route entry
  const reverseEntry: ReverseRoutingTableEntry = {
    destination: pack.destination,
    source: pack.originatorAddress,
    precusor: pack.source,
    rreqId: pack.rreqId,
    metric: pack.hopCount
  };
  router.reverseRoutingTable.push(reverseEntry);

  // Broadcast RREP further
  if (pack.ttl > 0) {
    pack.source = router.network.ownAddress;
    
    await router.network.timeout.wait();
      
    await router.network.sendPackage(pack);
  }
}