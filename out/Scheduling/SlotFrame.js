/** A class representing a timeslot and channels in a schedule
 *
 * @property {Hop[]} channels - The transmissions scheduled in this timeslot.
 *
 * @property {number} numChannels - The maximum number of schedulable channels in this time slot.
 *
 * @property {Set<string>} scheduledNodes - A set of nodes scheduled in this timeslot. Used to prevent a node from being
 *                                          scheduled twice in this timeslot.
 */
export class SlotFrame {
    constructor(numChannels) {
        this.numChannels = numChannels;
        this.channels = [];
        this.scheduledNodes = new Set();
    }
    /**
     * Attempt to schedule a hop in this timeslot. A hop can't be scheduled if there isn't an available channel or
     * one of the nodes has already been scheduled in this timeslot.
     * @param t
     * @return {boolean} - indicates if successfully scheduled.
     */
    scheduleTransmission(t) {
        if (this.channels.length === this.numChannels)
            return false;
        for (let i = 0; i < t.sources.length; i++) {
            if (this.scheduledNodes.has(t.sources[i]) || this.scheduledNodes.has(t.destinations[i]))
                return false;
        }
        this.channels.push(t);
        for (let i = 0; i < t.sources.length; i++) {
            this.scheduledNodes.add(t.sources[i]);
            this.scheduledNodes.add(t.destinations[i]);
        }
        return true;
    }
}
//# sourceMappingURL=SlotFrame.js.map