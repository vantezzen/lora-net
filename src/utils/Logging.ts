import Table from 'cli-table'
import Diagram from 'cli-diagram';
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

export function getRoutingTableDiagram(routingTable: RoutingTableEntry[], address: NetworkAddress): string {
  const routes: { [nextHop: NetworkAddress]: Diagram } = {};

  for (const entry of routingTable) {
    if (!entry.isValid) continue;

    if (!routes[entry.nextHop]) {
      routes[entry.nextHop] = new Diagram();
    }
    routes[entry.nextHop].box(`Dest: ${entry.destination}\nMetric:${entry.metric}`);
  }

  const diagram = new Diagram();
  for (const nextHop in routes) {
    diagram.box(`Hop: ${nextHop}${Number(nextHop) === address ? ' (self)' : ''}\n${routes[nextHop].join("\n")}`)
  }

  return diagram.toString();
}