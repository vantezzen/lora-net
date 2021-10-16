import IModuleConnection, { ConnectionInfo } from "./IModuleConnection";
import TerminalEntryStore from "./TerminalEntryStore";

export default class WebSerialConnection implements IModuleConnection {
  private connectionStart = new Date();
  private terminal: TerminalEntryStore;

  private port?: SerialPort;
  private writer?: WritableStreamDefaultWriter<Uint8Array>;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;

  private dataListeners: ((data: string) => any)[] = [];

  constructor(terminal: TerminalEntryStore) {
    this.terminal = terminal;
    this.log('Neue WebSerial Verbindung erstellt');
  }
  
  getConnectionType(): string {
    return "WebSerial";
  }

  private log(message: string): void {
    this.terminal.add({
      isSender: false,
      message: `| WS LOG: ${message}`,
    });
  }

  private processData(data: Uint8Array): void {
    const str = String.fromCharCode.apply(null, Array.from(data));

    this.terminal.add({
      isSender: false,
      message: str,
    });
    this.dataListeners.forEach(listener => listener(str));
  }
  private startReader(): void {
    console.log("WebSerial waiting for next data");
    this.reader?.read().then(({ value, done }) => {
      console.log("Reader signal read", { value, done });
      if (done) {
        this.log('WebSerial Reader beendet - done signal empfangen');
        return;
      }
      if (value) {
        this.processData(value);
      }

      // Read next data
      this.startReader();
    });
  }

  async connect(): Promise<boolean> {
    this.log('Stelle WebSerial Verbindung her...');

    // Request Device to connect to
    this.port = await navigator.serial.requestPort().catch(() => {
      this.log('WebSerial Verbindung fehlgeschlagen');
      return undefined;
    });
    if (!this.port) {
      return false;
    }

    // Open connection
    await this.port.open({ baudRate: 9600 });

    // Write Support
    if (!this.port.writable) {
      this.log('WebSerial Gerät unterstützt kein Write!');
    } else {
      this.writer = this.port.writable.getWriter();
    }
    // Read Support
    if (!this.port.readable) {
      this.log('WebSerial Gerät unterstützt kein Read!');
    } else {
      this.reader = this.port.readable.getReader();
      this.startReader();
    }

    this.log('WebSerial Gerät eingerichtet');
    this.connectionStart = new Date();

    return true;
  }
  
  async disconnect(): Promise<boolean> {
    this.log('Trenne Verbindung...');

    this.port = undefined;

    this.log('Verbindung getrennt');
    return true;
  }

  getConnectionInfo(): false | ConnectionInfo {
    return {
      name: this.port ? `${(this.port.getInfo()['usbVendorId'] ? 'USB' : 'Bluetooth')} Gerät` : 'Unbekannt',
      icon: 'Radio',
      connectionStart: this.connectionStart
    }
  }
  
  getIsConnected(): boolean {
    return !!this.port;
  }

  async send(data: string): Promise<void> {
    await this.writer?.write(new TextEncoder().encode(`${data}\n`));
    this.terminal.add({
      isSender: true,
      message: data
    });
  }

  onData(callback: (data: string) => any): void {
    this.dataListeners.push(callback);
  }
  
}