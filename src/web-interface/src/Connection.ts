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

  connectTo(type: string, address: number, device: string = "", data: { [key: string]: any } = {}) {
    if (this.isConnecting) {
      console.error("Already connecting to a device - continuing anyway");
    }
    this.isConnecting = true;
    this.connectionType = type;
    this.connectionName = device || "N/A";

    this.notifyChange();

    this.socket.emit('connectTo', { type, device, address, ...data }, (success: boolean) => {
      this.hasConnection = success;
      this.isConnecting = false;
      this.connectionTime = Date.now();
      this.notifyChange();
    });
  }
  disconnect() {
    return new Promise<void>((resolve, reject) => {
      this.socket.emit('disconnectNetwork', () => {
        this.hasConnection = false;
        resolve();
        this.notifyChange();
      });
    });
  }

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