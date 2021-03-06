import { getPackageString, setPackageDataFromString } from "./PackageParser";

export enum NetworkPackageType {
  RREQ = 0,
  RREP = 1,
  RERR = 2,
  MSG = 3,
  ACK = 4,
  UNKNOWN = -1,
}

export type NetworkAddress = number;

export type DataInformation = {
  name: string;

  // Data can be used to dirrectly supply the needed value instead of using the class property
  // with the given name
  data?: any;

  type: "int" | "string";
  length: number;
}

/**
 * Generic Network Package that handles all types of packages
 */
export default class NetworkPackage {
  // General Header
  type: NetworkPackageType = NetworkPackageType.UNKNOWN;
  flags: number = 0;
  nextHop: NetworkAddress = 0;
  source: NetworkAddress = 0;

  // Data and order of data in sent packages
  data: DataInformation[] = [
    {
      name: "type",
      type: "int",
      length: 4
    },
    {
      name: "flags",
      type: "int",
      length: 4
    },
    {
      name: "nextHop",
      type: "int",
      length: 8
    },
    {
      name: "source", // Source/Previous Hop Address
      type: "int",
      length: 8
    },
  ];

  /**
   * Get total length of package in bits
   * 
   * @returns Length
   */
  getBitLength() {
    return this.data.reduce((acc, cur) => acc + cur.length, 0);
  }

  /**
   * Create base64 encoded string for package for sending over network
   * 
   * @returns Base64 encoded string
   */
  toPackage() {
    return getPackageString(this);
  }

  /**
   * Parse Base64 Encoded string package to set this instance's properties
   * 
   * @param packageString Package
   */
  fromPackage(packageString: string) {
    setPackageDataFromString(packageString, this);
  }

  /**
   * Set a specific property of the package.
   * This is used internally by "fromPackage" to allow sub-packages to override
   * the behaviour
   * 
   * @param name Name of property
   * @param value Value of property
   */
  setPackageProperty(name: string, value: any) {
    // @ts-ignore
    this[name] = value;
  }
}