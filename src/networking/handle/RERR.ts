import RERR from "../../networkPackages/RERR";
import { NetworkAddress } from "../../networkPackages/utils/NetworkPackage";
import Router from "../Router";

export async function handleRERR(pack: RERR, router: Router) {
  router.log("Received RERR from", pack.source, "for", pack.destinations.reduce((str, addr) => str + " " + addr, ""));
  
  let errMessages: { [nextHop: NetworkAddress]: {
    destination: NetworkAddress,
    sequenceNumber: number
  }[]} = {};
  
  router.routingTable.forEach(entry => {
    const routeEntry = pack.destinations.find(destination => destination.destination === entry.destination);
    
    if (
      // Check if this route is invalidated by the RERR
      routeEntry &&
      entry.nextHop === pack.source &&
      entry.isValid
    ) {
      entry.isValid = false;

      entry.precursors.forEach(precursor => {

        if (!errMessages[precursor]) {
          errMessages[precursor] = [];
        }

        errMessages[precursor].push({
          destination: entry.destination,
          sequenceNumber: entry.sequenceNumber
        });
      });
    }
  });

  router.log("Relaying RERR to", Object.keys(errMessages).length, "nodes");

  for (const nextHop in errMessages) {
    const rerr = new RERR();

    rerr.nextHop = Number(nextHop);
    rerr.source = router.network.ownAddress;
    rerr.destinations = errMessages[nextHop];

    // await router.network.timeout.wait();
    
    router.network.sendPackage(rerr);
  }
}