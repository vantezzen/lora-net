import RERR from "./networkPackages/RERR";
import RREP from "./networkPackages/RREP";
import RREQ from "./networkPackages/RREQ";
import stringToPackage from "./networkPackages/utils/utils";

// const packageTe = new RREQ();

// packageTe.source = 1;
// packageTe.rreqId = 2;
// packageTe.destination = 3;
// packageTe.destinationSequenceNumber = 4;
// packageTe.hopCount = 5;
// packageTe.originatorAddress = 6;
// packageTe.originatorSequence = 7;

const packageTe = new RREP();
packageTe.nextHop = 1;
packageTe.source = 2;
packageTe.rreqId = 0;
packageTe.destination = 1;
packageTe.destinationSequenceNumber = 2;

packageTe.hopCount = 1;
packageTe.originatorAddress = 2;
packageTe.ttl = 3;

const packageData = packageTe.toPackage();
console.log("Data", JSON.stringify(packageData));

const importedPackage = stringToPackage(packageData);
console.log(importedPackage);

console.assert(JSON.stringify(packageTe) === JSON.stringify(importedPackage));

// const packageTe = new RERR();
// packageTe.nextHop = 10;
// packageTe.source = 4;
// packageTe.destinations.push({
//   destination: 5,
//   sequenceNumber: 25
// })
// packageTe.destinations.push({
//   destination: 2,
//   sequenceNumber: 32
// })
// packageTe.destinations.push({
//   destination: 8,
//   sequenceNumber: 58
// })


// const packageData = packageTe.toPackage();
// console.log("Data", JSON.stringify(packageData));

// const importedPackage = stringToPackage(packageData);
// console.log(importedPackage);