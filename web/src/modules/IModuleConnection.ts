import * as Icons from "react-feather";

export type ConnectionInfo = {
  // Module name
  name: string;

  // Time since when we are connected to the module
  connectionStart: Date;

  // Feathericon to use for displaying this device
  icon: keyof typeof Icons;
};

/**
 * Connection to a LoRa Module using a serial AT UART connection
 */
export default interface IModuleConnection {
  /**
   * Get a descriptive name for this classes connection type.
   * e.g. "Bluetooth"
   */
  getConnectionType(): string;

  /**
   * Connect to the Module.
   * The returned promise should resolve with "true" if the connection has been estabilshed
   * successfully or "false" otherwise
   */
  connect(): Promise<boolean>;

  /**
   * Disconnect from the module
   * The returned promise should resolve with "true" if the connection has been disconnected
   * successfully or "false" otherwise
   */
  disconnect(): Promise<boolean>;

  /**
   * Get info about the current connection.
   * This will return false if no connection is currently active
   */
  getConnectionInfo(): ConnectionInfo | false;

  /**
   * Returns true if the connection is currently connected to a module
   */
  getIsConnected(): boolean;

  /**
   * Send data to the module.
   * 
   * @param data AT Command to send
   */
  send(data: string): Promise<void>;

  /**
   * Add a callback for when data is received
   * 
   * @param callback Callback
   */
  onData(callback: (data: string) => any): void;

  /**
   * Remove a message listener from the connection
   * 
   * @param callback Callback to remove
   */
  removeDataHandler(callback: (data: string) => any): void;
}