import { io, Socket } from 'socket.io-client';
import TerminalEntryStore from './modules/TerminalEntryStore';
import { RoutingTableEntry, ReverseRoutingTableEntry } from '../../networking/Router';

const LAYERS = {
  1: 'connection',
  2: 'communication',
  3: 'network',
  4: 'console'
}

type Tables = {
  routingTable: RoutingTableEntry[];
  reverseRoutingTable: ReverseRoutingTableEntry[];
}

/**
 * Connection management class for communicating with the backend
 */
export default class Connection {
  isSocketConnected = false;
  socket : Socket;
  terminal: TerminalEntryStore;

  // State
  hasConnection = false;
  isConnecting = false;
  availableBluetoothDevices: string[] = [];

  connectionType = "Unknown";
  connectionTime = 0;
  connectionName = "N/A";

  tables: Tables = {
    routingTable: [],
    reverseRoutingTable: [],
  }

  onChangeHandlers: (() => void)[] = [];

  constructor(terminal: TerminalEntryStore) {
    this.terminal = terminal;
    this.socket = io(':3001');
    this.socket.on('connect', () => {
      this.isSocketConnected = true;
      this.notifyChange();
    });
    this.socket.on('disconnect', () => {
      this.isSocketConnected = false;
      this.notifyChange();
    });

    this.socket.on('consoleData', ({ layer, data }: { layer: number, data: string }) => {
      this.terminal.add({
        isSender: false,
        message: `[${LAYERS[layer as keyof typeof LAYERS]}] ${data}`,
      })
    });
    this.socket.on('routingTables', (tables: Tables) => {
      this.tables = tables;
      this.notifyChange();
    });
    this.socket.emit('getDevices', (devices: string[]) => {
      this.availableBluetoothDevices = devices;
    });
  }

  /**
   * Request the backend to connect to a specific device
   * 
   * @param type Type of connection (bluetooth, tcp, mock)
   * @param address Address of the own node
   * @param device Device to connect to
   * @param data Additional data for the connection
   */
  connectTo(type: string, address: number, device: string = "", data: { [key: string]: any } = {}) {
    if (this.isConnecting) {
      console.error("Already connecting to a device - continuing anyway");
    }
    this.isConnecting = true;
    this.connectionType = type;
    this.connectionName = device || "N/A";

    this.notifyChange();

    this.socket.emit('connectTo', { type, device, address, ...data }, (success: boolean, message?: string) => {
      this.hasConnection = success;
      this.isConnecting = false;
      this.connectionTime = Date.now();
      this.notifyChange();

      if (message) {
        this.terminal.add({
          isSender: false,
          message: `[31mVerbindungsfehler: ${message}[39m`,
        })
      }
    });
  }
  /**
   * Request the backend to disconnect from the current connection
   * 
   * @returns Promise that resolves when the disconnection is complete
   */
  disconnect() {
    return new Promise<void>((resolve, reject) => {
      this.socket.emit('disconnectNetwork', () => {
        this.hasConnection = false;
        resolve();
        this.notifyChange();
      });
    });
  }

  /**
   * Send a command line command to the backend
   * 
   * @param command Command to execute
   */
  sendCommand(command: string) {
    this.terminal.add({
      isSender: true,
      message: command,
    })
    this.socket.emit('console', command);
  }

  onChange(handler: () => void) {
    this.onChangeHandlers.push(handler);
  }
  private notifyChange() {
    this.onChangeHandlers.forEach(handler => handler());
  }
}