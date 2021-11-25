import Table from 'cli-table'
import { ReverseRoutingTableEntry, RoutingTableEntry } from "../networking/Router";
import { NetworkAddress } from "../networkPackages/utils/NetworkPackage";

export function getReverseRoutingTable(routingTable: ReverseRoutingTableEntry[]): string {
  const table = new Table({
    head: ['Destination', 'Source', 'RREQ ID', 'Precusor', 'Metric']
  });
  for (const entry of routingTable) {
    table.push([
      entry.destination,
      entry.source,
      entry.rreqId,
      entry.precusor,
      entry.metric
    ]);
  }
  return table.toString();
}

export function getRoutingTableString(routingTable: RoutingTableEntry[]): string {
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
  return table.toString();
}

export function logRoutingTable(routingTable: RoutingTableEntry[], address: NetworkAddress) {
  const debug = require("debug")("lora:RoutingTable:" + address);
  debug("Routing table for " + address);
  debug(getRoutingTableString(routingTable));
}