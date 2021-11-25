import RREP from "../../networkPackages/RREP";
import { isSeqNumNewer, isSeqNumNewerOrEqual } from "../../networkPackages/utils/SequenceNumbers";
import Router, { ReverseRoutingTableEntry, RoutingTableEntry } from "../Router";
import sendACK from "../send/ACK";

export async function handleRREP(pack: RREP, router: Router) {
  router.log("Received RREP from", pack.source, "for", pack.destination);
  pack.hopCount++;
  pack.ttl--;

  // We need to wait for ACK sended as the module might be busy otherwise
  await sendACK(pack.source, router);

  // Get reverse table entry
  const reverseEntry = router.reverseRoutingTable.reduce<ReverseRoutingTableEntry | null>((last, entry) => {
    router.log(
      'Checking reverse table entry',
      entry,
      entry.source,
      pack.originatorAddress,
    );
    if (
      entry.source === pack.destination &&
      entry.rreqId === pack.rreqId &&
      (
        !last ||
        entry.metric < last.metric
      )
    ) {
      return entry;
    }
    return last;
  }, null);
  router.log("RREP: Reverse Table Entry:", reverseEntry, router.reverseRoutingTable);

  // Check if we should use this route for ourself
  const tableEntry = router.routingTable.reduce<RoutingTableEntry | null>((entry, current) => {
    if (current.destination === pack.originatorAddress && current.isValid) {
      return current;
    }
    return entry;
  }, null);
  router.log("RREP: Routing Table Entry:", tableEntry);
  if (
    (
      tableEntry &&
      (
        // Must be Newer
        isSeqNumNewer(pack.sequenceNumber, tableEntry.sequenceNumber) ||

        // Or same age with lower metric
        (
          tableEntry.sequenceNumber === pack.sequenceNumber &&
          tableEntry.metric > pack.hopCount
        )
      )
    ) || !tableEntry
  ) {
    if (tableEntry) {
      // Invalidate old route so we don't use it anymore
      tableEntry.isValid = false;
    }
    
    const newEntry: RoutingTableEntry = {
      destination: pack.originatorAddress,
      nextHop: pack.source,
      precursors: reverseEntry ? [reverseEntry.precusor] : [],
      metric: pack.hopCount,
      sequenceNumber: pack.sequenceNumber,
      isValid: true
    };
    router.log("RREP: Newer or better route found, using it to get to", pack.destination, newEntry);
    router.routingTable.push(newEntry);
    router.newRouteEvent.fire(newEntry);
  }

  // Check if we have an existing reverse route so we need to send RREP further
  if (pack.destination !== router.network.ownAddress && reverseEntry) {
    router.log('Has reverse entry, relaying package to next hop');
    pack.nextHop = reverseEntry.precusor;
    pack.source = router.network.ownAddress;
    await router.sendWithAck(pack);
  }
}
