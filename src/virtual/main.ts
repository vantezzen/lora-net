/**
 * Virtual Network creator to test the code for different network configurations
 */
import Network from "../Network";
import { wait } from "../utils";
import CommunicationMock from "./CommunicationMock";
const debug = require('debug')('lora:VNet');

// Main network configuration
// Define nodes in the network and what nodes they can communicate with
const networkConfig = {
  nodes: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  ],
  links: [
    [1, 2],
    [1, 6],
    [2, 3],
    [3, 4],
    [4, 5], 
    [5, 10],
    [2, 12],
    [12, 7],
    [7, 9],
    [7, 8],
    [8, 11],
    [8, 10],
  ],
  probabilityFailSending: 0,
};
// const networkConfig = {
//   nodes: [
//     1, 2, 3, 4
//   ],
//   links: [
//     [1, 2],
//     [2, 3],
//     [3, 4],
//   ],
//   probabilityFailSending: 0.1,
// };
// Messages to send over the network
const messages = [
  {
    sender: 1,
    receiver: 11,
  },
  // {
  //   sender: 1,
  //   receiver: 9,
  // },
  // {
  //   sender: 5,
  //   receiver: 6,
  // },
  // {
  //   sender: 3,
  //   receiver: 11,
  // }
];

type Instance = {
  communication: CommunicationMock;
  network: Network;
}

const instances: { [key: number]: Instance } = {};

const messageQueue: { 
  receiver: number,
  sender: number,
  data: string,
}[] = [];

for (const node of networkConfig.nodes) {
  const communication = new CommunicationMock();

  communication.sendMessage = async (message: string) => {
    // Send message to receiving nodes
    const links = networkConfig.links.filter(link => link.includes(node));
    debug("VNet: Sending message", message, "to", links);
    for (const link of links) {
      const target = link[0] === node ? link[1] : link[0];
      debug('VNet: Sending to', target);
      messageQueue.push({
        receiver: target,
        sender: node,
        data: message,
      });
    }
  }

  const network = new Network(communication, node);
  network.setup();

  instances[node] = {
    communication,
    network
  };
}
debug("VNet: Instances created");

const runMessageQueue = async () => {
  if (messageQueue.length === 0) {
    setTimeout(runMessageQueue, 100);
    return;
  }

  if (
    // Random chance to fail sending
    Math.random() < networkConfig.probabilityFailSending
  ) {
    debug("VNet: Simulated Failed sending");
    runMessageQueue();
    return;
  }

  const message = messageQueue.shift();
  if (message) {
    debug("VNet: Sending message from queue");
    await instances[message.receiver].communication.receiveMessage(message.sender, message.data);
  }
  runMessageQueue();
}
runMessageQueue();

debug("VNet: Sending test messages");
(async () => {
  for (const message of messages) {
    instances[message.sender].network.sendMessage(`Hello ${message.sender} -> ${message.receiver}`, message.receiver);
    await wait(3000);
  }
})();
