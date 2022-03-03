import {NetworkNode} from "./NetworkNode.js";

/**
 * A class representing a network of communicating nodes and information on how communications should be performed
 *
 * @property {Map<string, NetworkNode>} nodes - A map of ids to their corresponding nodes
 *
 * @property {number} timeSlotSize - the duration in ms that a scheduled communication has to occur, default 10ms
 *
 * @property {number} channels - The number of channels available for communications, max 16.
 *
 * @property {number} etxPower - The exponent to multiply communication link weights by. A higher value results in
 *                               communications being more reliable, but taking more hops. default 2.
 *
 * @property {number} maxFlowLength - The maximum size of a flow in the network. This max size prevents to many radios
 *                                    from being on at the same time, which increases power consumption. This only
 *                                    applies to sliding window strategies. Default 10.
 *
 * @property {number} scalingFactor - By setting this to a higher value, communication schedules will be more
 *                                    conservative, resulting in higher reliability but higher latency as well.
 *                                    Only applies to sliding window strategies. Default 1.
 *
 * @property {"baseline" | "slot-based" | "SW2" | "SW3"} retransmissionStrategy - Determines how the scheduling of
 *                                    communications will handle retransmissions. Possible values are
 *                                    "baseline" (no retransmissions), "slot-based" (has ceil(Link ETX) retransmissions
 *                                    per link), Sliding window 2 and sliding window 3
 */
export class Network {
    constructor() {
        this.nodes = new Map();
        this.timeSlotSize = 10;
        this.numChannels = 16;
        this.etxPower = 2;
        this.maxFlowLength = 10;
        this.scalingFactor = 1;
        this.retransmissionStrategy = "baseline";
    }

    /**
     * Adds a link between nodes to the network. network must remain connected, so adding will fail if the added link
     * isn't connected to rest of network.
     * @param nodeA - ID of first node
     * @param nodeB - ID of second node
     * @param etx - the expected transmission count of the link between the two nodes. must be >= 1.
     * @return {boolean} - indicates whether link was successfully added
     */
    addLink(nodeA, nodeB, etx) {
        if (etx < 1)
            return false;
        else if (nodeA === nodeB)
            return false;
        else if (this.nodes.size !== 0 && !this.nodes.has(nodeA) && !this.nodes.has(nodeB))
            return false;
        else {
            if (!this.nodes.has(nodeA))
                this.nodes.set(nodeA, new NetworkNode(nodeA));
            if (!this.nodes.has(nodeB))
                this.nodes.set(nodeB, new NetworkNode(nodeB));
            this.addLinkBetween(nodeA, nodeB, etx);
            this.addLinkBetween(nodeB, nodeA, etx);
            return true;
        }
    }

    addLinkBetween(a, b, etx) {
        let nodeA = this.nodes.get(a);
        let nodeB = this.nodes.get(b);
        if (nodeA === undefined || nodeB === undefined)
            throw new Error("Can't add link between nonexistent nodes.");
        nodeA.addLink(nodeB, etx);
        nodeB.addLink(nodeA, etx);
    }

    /**
     * gets the expected transmission count of the link between two nodes, if a link exists
     * @param idA - ID of first node
     * @param idB - ID of second node
     * @return {number} - the expected transmission count of the link between two nodes, 0 if nodes not connected
     */
    getLinkEtx(idA, idB) {
        let nodeA = this.nodes.get(idA);
        let nodeB = this.nodes.get(idB);
        if (nodeA !== undefined && nodeB !== undefined) {
            let etx = nodeA.links.get(nodeB);
            if (etx === undefined)
                return 0;
            else
                return etx;
        } else
            return 0;
    }

    toString() {
        let str = "";
        let processedLinks = new Set();
        for (let nodeA of this.nodes.values()) {
            for (let nodeB of nodeA.links.keys()) {
                let etx = nodeA.links.get(nodeB);
                if (!processedLinks.has(nodeA.id + nodeB.id)) {
                    str += nodeA.id + " <---> " + nodeB.id + " (" + etx + ")\n";
                    processedLinks.add(nodeA.id + nodeB.id);
                    processedLinks.add(nodeB.id + nodeA.id);
                }
            }
        }
        return str;
    }
}

//# sourceMappingURL=Network.js.map