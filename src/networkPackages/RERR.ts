import NetworkPackage, { DataInformation, NetworkAddress, NetworkPackageType } from "./utils/NetworkPackage";
import { getPackageValueFromRawString } from "./utils/utils";

export type UnavailableDestinationInfo = {
  destination: NetworkAddress;
  sequenceNumber: number;
}

export default class RERR extends NetworkPackage {
  type: NetworkPackageType = NetworkPackageType.RERR;

  originalDataArray: DataInformation[];

  constructor() {
    super();
    this.originalDataArray = this.data;
  }

  destinations: UnavailableDestinationInfo[] = [];

  toPackage(): string {
    // toPackage method needs to be wrapped because the data length is dynamic thus
    // the data array needs to be updated before the package is created

    // Dynamically build data array
    this.data = this.originalDataArray;
    this.data.push({
      data: this.destinations.length,
      type: "int",
      name: 'RERR:destionationCount',
      length: 8,
    });
    console.log(this.destinations.length);
    for (const destination of this.destinations) {
      this.data.push({
        data: destination.destination,
        type: "int",
        name: 'RERR:destionation',
        length: 8,
      });
      this.data.push({
        data: destination.sequenceNumber,
        type: "int",
        name: 'RERR:destionationSequenceNumber',
        length: 8,
      });
    }

    const pack = super.toPackage();

    // Reset data array
    this.data = this.originalDataArray;

    return pack;
  }

  fromPackage(packageString: string): void {
    // As with toPackage, fromPackage needs to prepare the data array before the package is parsed
    const numDestinations = getPackageValueFromRawString(packageString, 24, 32);
    
    this.data = this.originalDataArray;
    this.data.push({
      type: "int",
      name: 'RERR:destionationCount',
      length: 8,
    });
    for (let i = 0; i < numDestinations; i++) {
      this.data.push({
        type: "int",
        name: 'RERR:destionation',
        length: 8,
      });
      this.data.push({
        type: "int",
        name: 'RERR:destionationSequenceNumber',
        length: 8,
      });
    }

    super.fromPackage(packageString);
  }

  setPackageProperty(name: string, value: any) {
    if (name.startsWith("RERR:")) {

      const type = name.replace("RERR:", "");
      if (type === "destionation") {
        this.destinations.push({
          destination: value,
          sequenceNumber: 0,
        });
      } else if (type === "destionationSequenceNumber") {
        this.destinations[this.destinations.length - 1].sequenceNumber = value;
      }

    } else {
      super.setPackageProperty(name, value);
    }
  }
}