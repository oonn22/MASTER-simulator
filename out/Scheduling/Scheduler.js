import {Baseline, SlidingWindow, SlotBased} from "./RetransmissionStrategies.js";
import {Schedule} from "./Schedule.js";
import {SlotFrame} from "./SlotFrame.js";

/** A class used to create schedules */
export class Scheduler {
    /**
     * Creates a schedule by determining retransmissions and applying rlpf scheduling algorithm
     * @param flows
     * @param network
     */
    static createSchedule(flows, network) {
        //apply retransmission strategy to flow
        for (const flow of flows) {
            switch (network.retransmissionStrategy) {
                case "baseline":
                    Baseline(flow, network);
                    break;
                case "slot-based":
                    SlotBased(flow, network);
                    break;
                case "SW2":
                    SlidingWindow(flow, network, 2, network.scalingFactor);
                    break;
                case "SW3":
                    SlidingWindow(flow, network, 3, network.scalingFactor);
                    break;
            }
        }
        return this.reverseLongestPathFirst(flows, network);
    }
    static reverseLongestPathFirst(flows, network) {
        let schedule = [];
        flows.sort((a, b) => {
            return a.hops.length > b.hops.length ? -1 : 1;
        }); //sort flows from longest to shortest
        for (let flow of flows) {
            let timeSlot = 0;
            for (let i = flow.hops.length - 1; i >= 0; i--) { //iterate over hops from last to first
                let hop = flow.hops[i];
                if (schedule[timeSlot] === undefined)
                    schedule[timeSlot] = new SlotFrame(network.numChannels);
                while (!schedule[timeSlot].scheduleTransmission(hop)) {
                    timeSlot++; // if not able to schedule in current timeslot move to next
                    if (schedule[timeSlot] === undefined)
                        schedule[timeSlot] = new SlotFrame(network.numChannels);
                }
                timeSlot++;
            }
        }
        return new Schedule(schedule);
    }
}
//# sourceMappingURL=Scheduler.js.map