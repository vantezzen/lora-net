import IModuleConnection from "./IModuleConnection";

/**
 * General purpose helpers for all module types.
 */
export function waitFor(message: string, timeout: number, connection: IModuleConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    const listener = (messageData: string) => {
      if (messageData === message) {
        clearTimeout(timer);
        connection.removeDataHandler(listener);
        resolve();
      }
    }
    connection.onData(listener);

    const timer = setTimeout(() => {
        connection.removeDataHandler(listener);
        reject(new Error(`Timeout waiting for ${message}`));
    }, timeout);
  });
}