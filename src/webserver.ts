/**
 * Webserver: Backend for the React frontend
 */
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import SerialPort from 'serialport';
import Net from "net";

import Connection from './Connection';
import CommunicationMock from './virtual/CommunicationMock';
import ICommunication from './interfaces/ICommunication';
import Communication from './Communication';
import Network from './Network';
import Console from './Console';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());

// React Frontend
app.use(express.static(__dirname + '/../build'));

let allSockets: Socket[] = [];

type SocketInfo<T> = {
  [socket: string]: T | undefined;
};

let connections: SocketInfo<Connection> = {};
let communications: SocketInfo<ICommunication> = {};
let networks: SocketInfo<Network> = {};
let consoles: SocketInfo<Console> = {};
let tcpConnections: SocketInfo<Net.Socket> = {};

// STOCKET.IO LISTENERS
io.on('connection', (socket) => {

  console.log('a user connected');
  allSockets.push(socket);

  // Socket requested the list of available ports
  socket.on('getDevices', async (callback: (devices: string[]) => void) => {
    callback((await SerialPort.list()).map(port => port.path));
  });

  // Socket requested to open a connection to a specific communication device
  socket.on('connectTo', async (data: { type: string, device: string, address: number, tcpAddr: string, tcpPort: number }, callback: (success: boolean, message?: string) => void) => {
    const { type, device, address, tcpAddr, tcpPort } = data;
    if (type === 'bluetooth') {
      connections[socket.id] = new Connection(device);
      connections[socket.id]!.onData((data: string) => {
        socket.emit('consoleData', {
          layer: 1,
          data
        });
      });

      try {
        await connections[socket.id]!.connect();
      } catch (e: any) {
        console.error(e);
        callback(false, e.message);
        return;
      }

      communications[socket.id] = new Communication(connections[socket.id]!);
      await communications[socket.id]!.setup();
      
      connections[socket.id]!.onData((data) => {
        socket.emit('consoleData', {
          layer: 2,
          data
        });
      });
    } else if (type === 'mock') {
      communications[socket.id] = new CommunicationMock();
      communications[socket.id]!.sendMessage = async (message: string) => {
        for(const socketId of Object.keys(connections)) {
          const communication = connections[socketId];
          if (communication && 'isMock' in communication) {
            (communication as CommunicationMock).receiveMessage(255, message);
          }
        }
      };
    } else if (type === 'tcp') {
      const tcpLog = (data: string) => {
        socket.emit('consoleData', {
          layer: 3,
          data
        });
      };

      const net = new Net.Socket();

      // Set up Mock
      const communication = new CommunicationMock();
      // Sending data
      communication.sendMessage = async (message: string) => {
        net.write("P\r\n");
      
        // Pretend sending takes some time
        let totalTimeout = 1000 + message.length * 200;
        await new Promise(r => setTimeout(r, totalTimeout));
        
        net.write(`M${message}\r\n`);
      }
      communications[socket.id] = communication;

      // Receiving data
      net.on('data', function(data) {
          const message = data.toString();
          const messageType = message[0];

          if (messageType === 'M') {
            const [, sender,, ...msg] = message.split(",");
            const messageString = msg.join(",");
            communication.receiveMessage(parseInt(sender), messageString);
          } else if (messageType === 'E') {
            tcpLog('Fehler bei der Adressvergabe');
          }

      });
      net.on('close', function() {
        tcpLog('Verbindung zum Server wurde getrennt');
      });
      
      // Set up Network instance
      const connectPromify = () => {
        return new Promise<void>((resolve, reject) => {
          net.connect(tcpPort, tcpAddr, () => {
            tcpLog(`Verbindung zum Server wurde hergestellt`);
            resolve();
          });
        });
      }
      await connectPromify();
      net.write(`A${address}\r\n`);
      tcpConnections[socket.id] = net;
    }

    console.log("Setting up network...");
    const network = new Network(communications[socket.id]!, address);
    await network.setup();
    network.onMessage((message: string) => {
      socket.emit('consoleData', {
        layer: 3,
        data: message
      });
    });
    networks[socket.id] = network;

    const sendRoutingTable = () => {
      const routingTable = network.router.routingTable;
      const reverseRoutingTable = network.router.reverseRoutingTable;
      socket.emit('routingTables', {
        routingTable,
        reverseRoutingTable
      });
    };
    sendRoutingTable();
    network.router.newRouteEvent.add(sendRoutingTable);

    consoles[socket.id] = new Console(communications[socket.id]!, network);

    callback(true);
  });

  // Socket requested to execute a command line command
  socket.on('console', (input: string) => {
    const log = (...args: string[]) => {
      socket.emit('consoleData', {
        layer: 4,
        data: args.join(' ')
      });
    }

    if (consoles[socket.id]) {
      consoles[socket.id]!.interpretCommand(input, log);
    } else {
      log('ERROR: No console');
    }
  })

  // Socket requested to disconnect from the network
  // Reset all instances to allow creating a new one on the same socket
  socket.on('disconnectNetwork', async (callback: () => void) => {
    if (connections[socket.id]) {
      await connections[socket.id]!.close();
    }
    if (tcpConnections[socket.id]) {
      tcpConnections[socket.id]!.end();
    }

    connections[socket.id] = undefined;
    communications[socket.id] = undefined;
    networks[socket.id] = undefined;

    callback();
  });

  // Socket disconnected from the network - reset its connections
  socket.on('disconnect', () => {
    console.log('user disconnected');
    if (connections[socket.id]) {
      connections[socket.id]!.close();
    }
    allSockets = allSockets.filter(s => s !== socket);
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
