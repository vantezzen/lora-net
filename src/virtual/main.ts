/**
 * Virtual Network creator to test the code for different network configurations
 */
import cliProgress from 'cli-progress';
import Network from "../Network";
import { NetworkAddress } from '../networkPackages/utils/NetworkPackage';
import { getPackageValueFromRawString } from '../networkPackages/utils/utils';
import { wait } from "../utils";
import { getRoutingTableDiagram, logRoutingTable } from "../utils/Logging";
import CommunicationMock from "./CommunicationMock";
const debug = require('debug')('lora:VNet');

// Main network configuration
// Define nodes in the network and what nodes they can communicate with
const networkConfig = {
  nodes: [
    1, 2, 3, 4
  ],
  links: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1]
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

const multibar = new cliProgress.MultiBar({
  clearOnComplete: true,
  format: `{sender} -> {receiver} [{bar}] {value}/{total}`
}, cliProgress.Presets.shades_grey);

for (const node of networkConfig.nodes) {
  const communication = new CommunicationMock();

  communication.sendMessage = async (message: string) => {
    // Send message to receiving nodes
    const links = networkConfig.links.filter(link => link.includes(node));
    debug("VNet: Sending message", message, "to", links);

    instances[node].isSending = true;
    let totalTimeout = 500 * message.length;
    let tarrgetAddr = getPackageValueFromRawString(message, 8, 16);

    // Nodes that should receive the message
    let receivingNodes = tarrgetAddr === 255 ? links.map((l) => l[0] === node ? l[1] : l[0]) : [tarrgetAddr];

    const progressbar = multibar.create((totalTimeout / 500) - 1, 0, {
      sender: node,
      receiver: tarrgetAddr
    });
    
    // Collisions to addresses
    let collisions: NetworkAddress[] = [];
    let collisionChecks = [];

    collisionChecks.push(setInterval(() => progressbar.increment(), 500));

    // Check for collisions while sending
    for (const receivingNode of receivingNodes) {
      const collisionCheck = setInterval(() => {

        for(const link of networkConfig.links) {

          if (link.includes(tarrgetAddr)) {
            // Link is in range of the receiving node
            // Check if a node in this link is sending

            const otherNode = link[0] === tarrgetAddr ? link[1] : link[0];
            
            if (
              otherNode !== node &&
              otherNode !== 255 &&
              instances[otherNode].isSending
            ) {
              // This other node is sending too -> Collision
              collisions.push(receivingNode);
              debug('Collision detected', node, tarrgetAddr, otherNode);
              clearTimeout(collisionCheck);
              break;
            }

          }
        }

      }, 500);
      collisionChecks.push(collisionCheck);
    }

    // Pretend sending takes some time
    await new Promise(r => setTimeout(r, totalTimeout));
    instances[node].isSending = false;

    collisionChecks.forEach(c => clearInterval(c));
    multibar.remove(progressbar);

    for (const receivingNode of receivingNodes) {
      debug('VNet: Sending to', receivingNode);

      if (!collisions.includes(receivingNode)) {
        // No collision -> Send message
        await instances[receivingNode].communication.receiveMessage(node, message);
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
    await wait(2 * 60 * 1000);
  }
})();

// setInterval(() => {
//   for(const instance of Object.values(instances)) {
//     logRoutingTable(instance.network.router.routingTable, instance.network.ownAddress);

//     console.log(instance.network.ownAddress, ":\n", getRoutingTableDiagram(instance.network.router.routingTable, instance.network.ownAddress));
//   }
// }, 10000);