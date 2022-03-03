/**
 * A class representing a node in a network and its associated information
 *
 * @property {string} id - The node's id, should be unique within its network.
 *
 * @property {Map<NetworkNode, number>} links - A mapping of all connections this makes with other nodes in the network.
 *                                              If nodes are connected, this map will return the expected transmission
 *                                              count of the connection.
 *
 * @property {NetworkNode | undefined} prev - A value used for routing flows in the network. It holds the node with the
 *                                            shortest path to this node.
 *
 * @property {boolean} visited - A value used for routing flows in the network. It indicates whether the routing process
 *                               has already been to this node or not.
 */
export class NetworkNode {
    id: string;
    links: Map<NetworkNode, number>;
    prev: NetworkNode | undefined;
    pathToNodeWeight: number | undefined;
    visited: boolean;

    constructor(id: string) {
        this.id = id;
        this.links = new Map<NetworkNode, number>();
        this.prev = undefined;
        this.pathToNodeWeight = undefined;
        this.visited = false;
    }

    addLink(linked: NetworkNode, etx: number): void {
        this.links.set(linked, etx);
    }
}