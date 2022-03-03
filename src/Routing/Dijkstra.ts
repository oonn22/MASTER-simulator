import {PriorityQueue} from "./PriorityQueue.js";
import {NetworkNode} from "../Network Components/NetworkNode.js";
import {Network} from "../Network Components/Network.js";

/**
 * Determines the shortest path in a network from a start node to an end node. The weights of the links in the network
 * graph are weighted by an exponent to increase reliability.
 *
 * @param source - the ID of the start node in the network
 * @param destination - the ID of the end node in the network
 * @param network - the network containing the graph to find the shortest path in, and the exponent used to weight links
 */
export function Dijkstra(source: string, destination: string, network: Network): string[] {
    initialize(source, network);

    let path = [destination];
    let priorityQueue = new PriorityQueue<NetworkNode>();
    let currNode = network.nodes.get(source);

    while (currNode !== undefined && currNode.id !== destination) {
        let adjacentNodes = currNode.links.keys();
        for (const adjacentNode of adjacentNodes) {
            if (!adjacentNode.visited) relax(currNode, adjacentNode, network.etxPower, priorityQueue);
        }
        currNode.visited = true;
        currNode = priorityQueue.pop();
    }

    let curr = network.nodes.get(destination);

    while (curr !== undefined && curr.prev !== undefined) {
        path = [curr.prev.id].concat(path);
        curr = curr.prev;
    }

    return path;
}

/**
 * Initializes the nodes of the network for performing Dijkstra's shortest path algorithm.
 * @param source
 * @param network
 */
function initialize(source: string, network: Network) {
    for (const node of network.nodes.values()) {
        node.visited = false;
        node.prev = undefined;
        node.pathToNodeWeight = Infinity;
        if (node.id === source) {
            node.pathToNodeWeight = 0;
            node.visited = true;
        }
    }
}

function relax(nodeA: NetworkNode, nodeB: NetworkNode, weightScalingFactor: number, pq: PriorityQueue<NetworkNode>) {
    let rawWeight = nodeA.links.get(nodeB);

    if (rawWeight === undefined) throw new Error("Link doesn't exist where link should exist.");
    if (nodeA.pathToNodeWeight === undefined || nodeB.pathToNodeWeight === undefined) throw new Error("node not initialized.")

    let adjustedWeight = rawWeight ** weightScalingFactor;
    let pathWeight = nodeA.pathToNodeWeight + adjustedWeight;

    if (nodeB.pathToNodeWeight > pathWeight) {
        nodeB.pathToNodeWeight = pathWeight;
        nodeB.prev = nodeA;
        pq.push(nodeB, adjustedWeight);
    }
}