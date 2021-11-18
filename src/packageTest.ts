import RERR from "./networkPackages/RERR";
import RREQ from "./networkPackages/RREQ";

const packageTe = new RERR();
packageTe.nextHop = 10;
packageTe.source = 4;
// packageTe.destination = 5;
// packageTe.hopCount = 3;
// packageTe.sequenceNumber = 1;
// packageTe.destinationSequenceNumber = 32;
// packageTe.rreqId = 9;
// packageTe.ttl = 3;

const packageData = packageTe.toPackage();

const importedPackage = new RREQ();
importedPackage.fromPackage(packageData);

console.log(importedPackage);