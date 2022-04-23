import {Flow} from "../Network Components/Flow.js";
import {Scheduler} from "../Scheduling/Scheduler.js";
import {Router} from "../Routing/Router.js";
import {SimulationResults} from "./SimulationResults.js";

/** A class performing the function of simulating transmission in a network */
export class Simulator {
    /**
     * Simulates random transmission over a network for a set duration
     * @param network
     * @param simulationDuration
     * @param retransmitFailedFlows - if true, will attempt to retransmit all flows that weren't successfully
     *                                transmitted in the next schedule.
     */
    static simulateNetwork(network, simulationDuration, retransmitFailedFlows = false) {
        let result = new SimulationResults();
        let flowsToRetry = [];
        while (simulationDuration > 0) {
            let randFlows = this.generateRandomFlows(network);
            if (retransmitFailedFlows)
                randFlows = randFlows.concat(flowsToRetry);
            Router.routeFlows(randFlows, network);
            let toSim = Scheduler.createSchedule(randFlows, network);
            let simulated = this.simulateSchedule(toSim, randFlows, network);
            result.appendResults(simulated.results);
            flowsToRetry = simulated.unsuccessfulTransmissions;
            simulationDuration -= toSim.length * network.timeSlotSize;
        }
        return result;
    }
    /**
     * Simulates the results of attempting a schedule created for a network
     * @param schedule - the schedule created over network using flows
     * @param flows - the flows used to create the schedule
     * @param network - the network the schedule was created for
     */
    static simulateSchedule(schedule, flows, network) {
        let results = new SimulationResults();
        let unsuccessfulTransmissions = new Array();
        let flowIdMap = new Map();
        for (let flow of flows) {
            //initialize the flow
            flow.nodeWithMsg = flow.source;
            flow.timeSlotsUsedToTransmit = 0;
            flowIdMap.set(flow.id, flow);
        }
        for (let slotFrame of schedule) {
            let radiosOnInSlot = [];
            for (let transmission of slotFrame.channels) {
                let simulatedFlow = flowIdMap.get(transmission.flowId);
                if (simulatedFlow)
                    radiosOnInSlot = radiosOnInSlot.concat(this.simulateHop(transmission, simulatedFlow, network));
                else
                    throw new Error("Transmission's flow id doesn't exist");
            }
            results.addRadiosOnInSlot(radiosOnInSlot);
            for (let flow of flows)
                if (!flow.successfullyTransmitted)
                    flow.timeSlotsUsedToTransmit++; //counts timeslots for unfinished flows. if flow had just finished, time slot is counted inside sim hop.
        }
        for (let flow of flows) {
            results.addTransmission(flow.successfullyTransmitted, flow.timeSlotsUsedToTransmit * network.timeSlotSize);
            if (!flow.successfullyTransmitted)
                unsuccessfulTransmissions.push(flow);
        }
        return {"results": results, "unsuccessfulTransmissions": unsuccessfulTransmissions};
    }
    /**
     * Creates a random set of flows
     * @param network
     * @return {Flow[]} - randomly generated flows
     */
    static generateRandomFlows(network) {
        let numFlows = this.randInt(1, Math.min(network.numChannels, 5));
        let nodes = [...network.nodes.values()];
        let flows = [];
        for (let _ = 0; _ < numFlows; _++) {
            let flowStart = this.randInt(0, nodes.length - 1);
            let flowEnd = this.randInt(0, nodes.length - 1);
            if (flowEnd === flowStart) {
                if (flowEnd === nodes.length - 1)
                    flowEnd--;
                else
                    flowEnd++;
            }
            flows.push(new Flow(nodes[flowStart].id, nodes[flowEnd].id));
        }
        return flows;
    }
    /**
     * Attempts a transmission in a schedule, recording results and other information
     * @param t - hop to attempt
     * @param flow - hops associated flow, to track related information
     * @param network
     * @return {string[]} - IDs of nodes with radios on during hop
     * @private
     */
    static simulateHop(t, flow, network) {
        let radiosOn = [];
        if (!flow.successfullyTransmitted) {
            let indexOfSource = t.sources.indexOf(flow.nodeWithMsg);
            if (indexOfSource !== -1) { //node with message is scheduled in hop
                let sourceId = t.sources[indexOfSource];
                let destId = t.destinations[indexOfSource];
                let successfulTransmission = this.attemptTransmission(network.getLinkEtx(sourceId, destId));
                radiosOn.push(t.sources[indexOfSource]);
                for (let i = indexOfSource; i < t.destinations.length; i++)
                    radiosOn.push(t.destinations[i]);
                if (successfulTransmission)
                    flow.nodeWithMsg = destId;
                if (flow.successfullyTransmitted)
                    flow.timeSlotsUsedToTransmit++; //accounts for timeslot missed in main loop
            } else { //message hasn't reached a node scheduled in the hop
                //source nodes know they don't have the message to transmit
                //destination nodes don't know yet and are waiting for a transmission
                for (let radio of t.destinations)
                    radiosOn.push(radio);
            }
        }
        return radiosOn;
    }
    static attemptTransmission(etx) {
        return etx === 0 ? false : Math.random() <= (1 / etx);
    }
    static randInt(start, end) {
        return Math.floor(Math.random() * end) + start;
    }
}
//# sourceMappingURL=Simulator.js.map