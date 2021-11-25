import MSG from "../../networkPackages/MSG";
import Router from "../Router";

export function handleMSG(pack: MSG, router: Router) {
  if (pack.destination === router.network.ownAddress) {
    router.log("MSG for own address");
    router.network.fireNewMessageEvent(pack.payload);
    return;
  } else {
    router.log("MSG for", pack.destination);
    const route = router.routingTable.find(entry => (entry.destination === pack.destination && entry.isValid));
    if (route) {
      pack.nextHop = route.nextHop;
      pack.source = router.network.ownAddress;
      router.network.sendPackage(pack);
    } else {
      router.log("No route to", pack.destination);
      // TODO: Send RERR
    }
  }
}