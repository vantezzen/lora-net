import Table from 'cli-table'
import { RoutingTableEntry } from "../networking/Router";
import { NetworkAddress } from "../networkPackages/utils/NetworkPackage";

export function logRoutingTable(routingTable: RoutingTableEntry[], address: NetworkAddress) {
  const debug = require("debug")("lora:RoutingTable:" + address);
  debug("Routing table for " + address);

  const table = new Table({
    head: ['Destination', 'Next Hop', 'Precursors', 'Metric', 'Sequence Number', 'Valid']
  });
  for (const entry of routingTable) {
    table.push([
      entry.destination,
      entry.nextHop,
      entry.precursors.join(', '),
      entry.metric,
      entry.sequenceNumber,
      entry.isValid
    ]);
  }
  debug(table.toString());
}