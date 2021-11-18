import RERR from "./networkPackages/RERR";
import RREP from "./networkPackages/RREP";
import RREQ from "./networkPackages/RREQ";
import stringToPackage from "./networkPackages/utils/utils";

const packageTe = new RREQ();
packageTe.nextHop = 10;
packageTe.source = 4;
packageTe.destination = 5;
packageTe.hopCount = 3;
packageTe.sequenceNumber = 1;
packageTe.destinationSequenceNumber = 32;
packageTe.rreqId = 9;
packageTe.ttl = 3;

const packageData = packageTe.toPackage();
console.log("Data", JSON.stringify(packageData));

const importedPackage = stringToPackage(packageData);
console.log(importedPackage);

console.assert(JSON.stringify(packageTe) === JSON.stringify(importedPackage));