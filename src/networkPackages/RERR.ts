import NetworkPackage, { NetworkAddress, NetworkPackageType } from "./utils/NetworkPackage";

export type UnavailableDestinationInfo = {
  destination: NetworkAddress;
  sequenceNumber: number;
}

export default class RERR extends NetworkPackage {
  type: NetworkPackageType = NetworkPackageType.RERR;

  destinations: UnavailableDestinationInfo[] = [];
}