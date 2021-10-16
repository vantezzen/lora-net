/**
 * Static Helper functions for the bluetooth connection
 */
export const requestBluetoothDevice = (): Promise<BluetoothDevice | null> => {
  return new Promise(async (resolve) => {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true
    });
    resolve(device);
  })
}