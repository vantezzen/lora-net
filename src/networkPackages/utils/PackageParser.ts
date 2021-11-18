import ACK from "../ACK";
import NetworkPackage from "./NetworkPackage";
import { binaryArrayToBuffer, bufferToBinaryArray } from "../../utils";

/**
 * Helper Methods to help converting to string and parsing string back to object
 */


/**
* Convert data in a network package into a Base64 String compliant to the network protocol.
* This function is used internally by the network package's "toPackage()" method
* 
* @param packageInstance Package to convert
* @returns Base64 string
*/
export function getPackageString(packageInstance: NetworkPackage) {
  const binaryBuffer = Array(packageInstance.getBitLength()).fill(0);
  let offset = 0;

  // Add each data packet to the buffer in the correct order
  for (const data of packageInstance.data) {
    // @ts-ignore
    const value = data.data ?? packageInstance[data.name];

    // Get binary representation of value
    let binaryValue: number[] = [];
    switch (data.type) {
      case "int":
        binaryValue = value.toString(2).split("").map((bin: string) => parseInt(bin, 2));
        break;
      case "string":
        Array.from(value as string).forEach((char, i) => {
          binaryValue.push(...char.charCodeAt(0).toString(2).split("").map(char => parseInt(char, 2)));
        });
        break;
    }

    // Merge binary value array into output buffer
    const length = Math.min(data.length, binaryValue.length);
    for (let i = 1; i <= length; i++) {
      const bufferPosition = offset + data.length - i;
      const positionValue = binaryValue[binaryValue.length - i];
      binaryBuffer[bufferPosition] = positionValue;
    }
    
    offset += data.length;
  }

  // Use byte buffer to compact output and convert to base64 string
  return binaryArrayToBuffer(binaryBuffer).toString("base64");
}

/**
* Parse a Base64 string into its containing data and modify a package instance to hold that data.
* 
* This is used internally by the network package's "fromPackage()" method
* 
* @param packageString String to parse
* @param packageInstance Instance to modify
*/
export function setPackageDataFromString(packageString: string, packageInstance: NetworkPackage) {
  const inputData = bufferToBinaryArray(Buffer.from(packageString, "base64"));

  let offset = 0;
  for (const data of packageInstance.data) {
    // Convert binary value to parsed value
    let value;
    switch (data.type) {
      case "int":
        const binary = inputData.slice(offset, offset + data.length).join("");
        value = parseInt(binary, 2);
        break;
      case "string":
        value = inputData.slice(offset, offset + data.length).map((char) => String.fromCharCode(char)).join("");
        break;
    }

    // Update package instance with parsed value
    packageInstance.setPackageProperty(data.name, value);
    offset += data.length;
  }
}