/**
 * Virtual Network creator to test the code for different network configurations
 */
import Network from "../Network";
import { wait } from "../utils";
import { getRoutingTableDiagram, logRoutingTable } from "../utils/Logging";
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
  {
    sender: 1,
    receiver: 9,
  },
  {
    sender: 5,
    receiver: 6,
  },
  {
    sender: 3,
    receiver: 11,
  }
];

type Instance = {
  communication: CommunicationMock;
  network: Network;
  isSending: boolean;
}

const instances: { [key: number]: Instance } = {};

for (const node of networkConfig.nodes) {
  const communication = new CommunicationMock();

  communication.sendMessage = async (message: string) => {
    // Send message to receiving nodes
    const links = networkConfig.links.filter(link => link.includes(node));
    debug("VNet: Sending message", message, "to", links);
    for (const link of links) {
      const target = link[0] === node ? link[1] : link[0];
      debug('VNet: Sending to', target);

      instances[node].isSending = true;
      
      // Check for collisions while sending
      let collision = false;
      const collisionCheck = setInterval(() => {

        for(const link of networkConfig.links) {

          if (link.includes(target) || link.includes(node)) {
            // Link is in range of the sending or receiving node
            // Check if a node in this link is sending
            for (const otherNode of link) {
              if (otherNode !== node && instances[otherNode].isSending) {
                // This other node is sending too -> Collision
                collision = true;
                clearTimeout(collisionCheck);
                break;
              }
            }

          }
        }

      }, 1000);

      // Pretend sending takes some time
      await new Promise(r => setTimeout(r, 2000 + 500 * message.length));
      instances[node].isSending = false;

      if (!collision) {
        // No collision -> Send message
        await instances[target].communication.receiveMessage(node, message);
      }
    }
  }

  const network = new Network(communication, node);
  network.setup();

  instances[node] = {
    communication,
    network,
    isSending: false,
  };
}
debug("VNet: Instances created");

debug("VNet: Sending test messages");
(async () => {
  for (const message of messages) {
    instances[message.sender].network.sendMessage(`Hello ${message.sender} -> ${message.receiver}`, message.receiver);
    await wait(30000);
  }
})();

setInterval(() => {
  for(const instance of Object.values(instances)) {
    logRoutingTable(instance.network.router.routingTable, instance.network.ownAddress);

    console.log(instance.network.ownAddress, ":\n", getRoutingTableDiagram(instance.network.router.routingTable, instance.network.ownAddress));
  }
}, 10000);