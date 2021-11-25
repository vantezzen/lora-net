import ACK from "../../networkPackages/ACK";
import { NetworkAddress } from "../../networkPackages/utils/NetworkPackage";
import Router from "../Router";

export default async function sendACK(receiver: NetworkAddress, router: Router) {
  const ack = new ACK();
  ack.nextHop = receiver;
  ack.source = router.network.ownAddress;
  await router.network.sendPackage(ack);
}