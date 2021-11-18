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
      name: "source",
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
    const outputBuffer = Buffer.alloc(this.getBitLength(), undefined, "binary");
    let offset = 0;
    for (const data of this.data) {
      // @ts-ignore
      const value = this[data.name];

      switch (data.type) {
        case "int":
          const binary = value.toString(2);
          const length = Math.min(data.length, binary.length);
          for (let i = 1; i <= length; i++) {
            const bufferPosition = offset + data.length - i;
            outputBuffer[bufferPosition] = binary[binary.length - i] === "1" ? 1 : 0;
          }
          break;
        case "string":
          outputBuffer.write(value, offset, data.length, "binary");
          break;
      }
      offset += data.length;
    }

    return outputBuffer.toString("base64");
  }

  /**
   * Parse Base64 Encoded string package to set this instance's properties
   * 
   * @param packageString Package
   */
  fromPackage(packageString: string) {
    const inputBuffer = Buffer.from(packageString, "base64");
    const inputArray = new Uint8Array(inputBuffer);

    let offset = 0;
    for (const data of this.data) {
      let value;
      switch (data.type) {
        case "int":
          const binary = inputArray.slice(offset, offset + data.length).join("");
          value = parseInt(binary, 2);
          break;
        case "string":
          value = inputBuffer.slice(offset, offset + data.length).toString("binary");
          break;
      }
      // @ts-ignore
      this[data.name] = value;
      offset += data.length;
    }
  }
}