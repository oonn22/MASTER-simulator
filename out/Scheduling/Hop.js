/**
 * A class representing a possible transmission in a schedule
 *
 * @property {string[]} sources - A list of node IDs that can possibly transmit during this hop
 *
 * @property {string[]} destinations - a list of node IDs that can possibly receive a transmission during this hop
 *
 * @property {number} flowID - the ID of the flow that this hop is apart of
 */
export class Hop {
    constructor(source, destination, flowId) {
        this.flowId = flowId;
        if (typeof source === "string")
            this.sources = [source];
        else
            this.sources = source;
        if (typeof destination === "string")
            this.destinations = [destination];
        else
            this.destinations = destination;
    }
    toString() {
        let s = "";
        for (let i = 0; i < this.sources.length - 1; i++) {
            s += this.sources[i] + " -> " + this.destinations[i] + " || ";
        }
        s += this.sources[this.sources.length - 1] + " -> " + this.destinations[this.sources.length - 1];
        s += " (" + this.flowId.toString() + ")";
        return s;
    }
}
//# sourceMappingURL=Hop.js.map