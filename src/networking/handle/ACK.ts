import ACK from "../../networkPackages/ACK";
import Router from "../Router";

export function handleACK(pack: ACK, router: Router) {
  if (pack.nextHop === router.network.ownAddress) {
    router.log("ACK for own address");
    router.ackEvent.fire(pack);
    return;
  }
}