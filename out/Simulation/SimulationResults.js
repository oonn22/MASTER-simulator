/** a class representing and aggregating the results of simulating a network */
export class SimulationResults {
    constructor() {
        this._numTransmissions = 0;
        this._numSuccessfulTransmissions = 0;
        this._numTimeSlots = 0;
        this._timeTransmitting = 0;
        this._numSlotsRadioOn = new Map();
    }
    /**
     * Adds the result of a flow to the overall results. This includes if the flow was able to reach its destination
     * following the schedule, and how long that took.
     * @param successful
     * @param timeTook
     */
    addTransmission(successful, timeTook) {
        this._numTransmissions++;
        if (successful)
            this._numSuccessfulTransmissions++;
        this._timeTransmitting += timeTook;
    }
    /**
     * Tracks which radios were on in a timeslot.
     * @param radiosOn - the nodes either transmitting or receiving in a timeslot
     */
    addRadiosOnInSlot(radiosOn) {
        this._numTimeSlots++;
        for (let radio of radiosOn) {
            this._numSlotsRadioOn.set(radio, (this._numSlotsRadioOn.get(radio) ?? 0) + 1);
        }
    }
    toString(timeSlotSize) {
        let s = "Total Transmissions: " + this._numTransmissions +
            " Successful Transmissions: " + this._numSuccessfulTransmissions +
            " Simulation Duration: " + this.timeSimulated(timeSlotSize) + "ms\n";
        s += "Network Reliability: " +
            (this._numSuccessfulTransmissions / this._numTransmissions).toLocaleString("en", {
                style: "percent",
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            }) + "\n";
        s += "Average Latency: " + (this._timeTransmitting / this._numTransmissions) + " ms\n";
        s += "Radio on time: \n";
        let sumRadioOnTime = 0;
        let sortedRadios = [...this._numSlotsRadioOn.keys()].sort();
        for (let radio of sortedRadios) {
            let slotsOn = this._numSlotsRadioOn.get(radio) ?? 0;
            s += radio + ": " + (slotsOn / this._numTimeSlots).toLocaleString("en", {
                style: "percent",
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            }) + "\n";
            sumRadioOnTime += slotsOn / this._numTimeSlots;
        }
        s += "Average radio on time: " + (sumRadioOnTime / this._numSlotsRadioOn.size).toLocaleString("en", {style: "percent"});
        return s;
    }

    timeSimulated(timeSlotSize) {
        return this._numTimeSlots * timeSlotSize;
    }

    get numTransmissions() {
        return this._numTransmissions;
    }

    get numSuccessfulTransmissions() {
        return this._numSuccessfulTransmissions;
    }

    get timeTransmitting() {
        return this._timeTransmitting;
    }

    get numTimeSlots() {
        return this._numTimeSlots;
    }
    get numSlotsRadioOn() {
        return this._numSlotsRadioOn;
    }
    /**
     * Adds the results of some other simulation to self.
     * @param results
     */
    appendResults(results) {
        this._numTransmissions += results.numTransmissions;
        this._numSuccessfulTransmissions += results.numSuccessfulTransmissions;
        this._numTimeSlots += results.numTimeSlots;
        this._timeTransmitting += results.timeTransmitting;
        for (let [radio, totalOnSlots] of results.numSlotsRadioOn.entries()) {
            this._numSlotsRadioOn.set(radio, (this._numSlotsRadioOn.get(radio) ?? 0) + totalOnSlots);
        }
    }
}
//# sourceMappingURL=SimulationResults.js.map