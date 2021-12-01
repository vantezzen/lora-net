import MSG from "../../networkPackages/MSG";
import Router from "../Router";
import sendACK from "../send/ACK";
import { sendRRER } from "../send/RERR";

export async function handleMSG(pack: MSG, router: Router) {
  // We need to wait for ACK sended as the module might be busy otherwise
  await sendACK(pack.source, router);

  router.knownSequenceNumbers[pack.source] = pack.sequenceNumber;

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

      // await router.network.timeout.wait();

      await router.sendWithAck(pack);
    } else {
      router.log("No route to", pack.destination);
      sendRRER(pack.destination, pack.source, router);
    }
  }
}