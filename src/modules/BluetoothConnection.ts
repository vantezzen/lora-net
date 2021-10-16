import { requestBluetoothDevice } from "./BluetoothConnectionHelpers";
import IModuleConnection, { ConnectionInfo } from "./IModuleConnection";
import TerminalEntryStore from "./TerminalEntryStore";

export default class BluetoothConnection implements IModuleConnection {
  private connectionStart = new Date();
  private device?: BluetoothDevice;
  private characteristics?: BluetoothRemoteGATTCharacteristic;
  private terminal: TerminalEntryStore;

  private inputBuffer: string = "";
  private dataListeners: ((data: string) => any)[] = [];

  constructor(terminal: TerminalEntryStore) {
    this.terminal = terminal;
    this.log('Neue Bluetooth Verbindung erstellt');
  }
  
  getConnectionType(): string {
    return "Bluetooth";
  }

  private log(message: string): void {
    this.terminal.add({
      isSender: false,
      message: `| BT LOG: ${message}`,
    });
  }

  async connect(): Promise<boolean> {
    this.log('Stelle Bluetooth Verbindung her...');
    const device = await requestBluetoothDevice();
    this.device = device ?? undefined;
    this.log('Gerät bekommen');

    if (device) {
      this.connectionStart = new Date();

      // TODO: Handle
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Disconnected')
        this.device = undefined;
      });

      // Connect to GATT
      const server = await device.gatt?.connect().catch(() => {
        this.log('FEHLER: Gerät stellt keinen GATT Server bereit');
        return null;
      });
      if (!server) {
        this.log('FEHLER: Kein Server Host gefunden');
        return false;
      }

      const service = await server.getPrimaryService(0xFFE0);
      this.characteristics = await service.getCharacteristic(0xFFE1);

      this.log('Verbindung hergestellt');
      console.log('Got device', device, service, this.characteristics);

      // Listen for notifications
      await this.characteristics.startNotifications();
      this.characteristics.addEventListener('characteristicvaluechanged', (event) => {
        if (!event.target) {
          this.log('INFO: Characteristics geändert aber kein target');
          console.log("Not event target but characteristics changed", event);
          return;
        }

        // @ts-ignore
        const value = new TextDecoder().decode(event.target?.value);
    
        for (const c of value) {
          if (c === "\n") {
            const data = this.inputBuffer.trim();
            this.inputBuffer = '';
    
            if (data) {
              this.dataListeners.forEach(listener => listener(data));
            }
          } else {
            this.inputBuffer += c;
          }
        }
      });
    }

    return true;
  }
  
  async disconnect(): Promise<boolean> {
    this.log('Trenne Verbindung...');
    this.device?.gatt?.disconnect();
    this.device = undefined;
    this.log('Verbindung getrennt');
    return true;
  }

  getConnectionInfo(): false | ConnectionInfo {
    if (!this.device) return false;
    return {
      name: this.device?.name ?? 'Unbekannt',
      icon: 'Bluetooth',
      connectionStart: this.connectionStart
    }
  }
  
  getIsConnected(): boolean {
    return !!this.device;
  }

  send(data: string): Promise<string | false> {
    // TODO
    return Promise.resolve("AT+OK");
  }

  onData(callback: (data: string) => any): void {
    this.dataListeners.push(callback);
  }
  
}