/**
 * A class representing a message being sent in a network
 *
 * @property {string} source - the id of the node sourcing the message to be sent.
 *
 * @property {string} destination - the id of the node to receive the message.
 *
 * @property {number} id - unique identifier.
 *
 * @property {string[]} route - the path that the message must take to reach the destination. Each entry is a node id.
 *
 * @property {Hop[]} hops - the transmissions to be performed to execute the route
 *
 * @property {string} nodeWithMsg - the node id of the node furthest in the route that has received the msg.
 *
 * @property {number} timeSlotsUsedToTransmit - the number of time slots used so far in the transmission.
 */
export class Flow {
    /**
     * @constructor
     * @param source - node id of message source
     * @param destination - node id to receive message
     * @param {number} id - OPTIONAL, id to give to flow. If not provided unique id will be assigned
     */
    constructor(source, destination, id = -1) {
        this.source = source;
        this.destination = destination;
        this.id = (id === -1) ? Flow.nextId : id;
        this.route = [];
        this.hops = [];
        this.nodeWithMsg = source;
        this.timeSlotsUsedToTransmit = 0;
        Flow.nextId++;
    }

    /**
     * @return {boolean} - returns whether the flow has successfully transmitted its message to its destination or not
     */
    get successfullyTransmitted() {
        return this.nodeWithMsg === this.destination;
    }

    toString() {
        return "Source node: " + this.source + " Destination node: " + this.destination + " (Flow ID: " + this.id + ")";
    }

    /**
     * @return {string} - returns a string representation of the route to be taken by the flows message.
     */
    routeToString() {
        let s = "";
        for (let hop of this.route) {
            s += hop + " -> ";
        }
        return s.slice(0, s.length - 4) + " (id: " + this.id.toString() + ")";
    }
}

Flow.nextId = 0; //used to assign unique id if not given
//# sourceMappingURL=Flow.js.map