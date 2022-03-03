import {Hop} from "./Hop.js";

/**
 * Adds hops to a flow using the baseline strategy. This strategy uses a single transmission for each hop along the
 * route of the flow.
 * @param flow
 * @param network
 */
export function Baseline(flow, network) {
    flow.hops = [];
    for (let i = 0; i < flow.route.length - 1; i++) {
        flow.hops.push(new Hop(flow.route[i], flow.route[i + 1], flow.id));
    }
}

/**
 * Adds hops to a flow using the slot based strategy. This strategy uses ceil(link etx) retransmissions for each hop
 * along the route of the flow.
 * @param flow
 * @param network
 */
export function SlotBased(flow, network) {
    flow.hops = [];
    for (let i = 0; i < flow.route.length - 1; i++) {
        let source = flow.route[i];
        let destination = flow.route[i + 1];
        let linkEtx = network.getLinkEtx(source, destination);
        if (linkEtx === 0)
            throw new Error("Can't transmit between unconnected nodes.");
        for (let j = 0; j < Math.ceil(linkEtx); j++) {
            flow.hops.push(new Hop(source, destination, flow.id));
        }
    }
}

/**
 * Uses sliding window strategies to add  hops to a flow.
 * @param flow
 * @param network
 * @param {2 | 3} equationNumber - Determines how the number of transmissions are calculated. 2 offers lower latency
 *                                 at the cost of less reliability, while 3 offers higher reliability at the cost of
 *                                 higher latency.
 * @param scalingFactor - The conservativeness of the algorithm. A higher number offers higher reliability at the cost
 *                        of higher latency.
 */
export function SlidingWindow(flow, network, equationNumber, scalingFactor) {
    flow.hops = [];
    let subFlows = determineSubFlows(flow.route, network.maxFlowLength);
    //determine transmissions for each sub flow
    for (let route of subFlows) {
        let [numTransmissions, windowSize] = determineFlowCosts(route, network, equationNumber, scalingFactor);
        let windowStart = 0;
        let windowEnd = 1;
        let timesTransmitted = {};
        //initialize transmissions count for each hop
        for (let i = 0; i < route.length; i++) {
            timesTransmitted[i] = 0;
        }
        for (let _ = 0; _ < numTransmissions; _++) {
            let source = [];
            let destination = [];
            //determine transmissions in window
            for (let i = windowStart; i < windowEnd; i++) {
                source.push(route[i]);
                destination.push(route[i + 1]);
                timesTransmitted[i]++;
            }
            //create and add hop to flow
            flow.hops.push(new Hop(source, destination, flow.id));
            //adjust window size
            if (timesTransmitted[windowStart] === windowSize)
                windowStart++;
            if (windowEnd - windowStart < windowSize && windowEnd !== route.length - 1)
                windowEnd++;
            // length - 1, so that we don't attempt a transmission form the last node in the route to an undefined node
        }
    }
}

/**
 * Creates even length sub flow routes based off of a route and the max length of a sub flow
 * @param route
 * @param maxSubFlowLength
 */
function determineSubFlows(route, maxSubFlowLength) {
    let routes = [];
    if (route.length > maxSubFlowLength) {
        let numSubFlows = Math.ceil(route.length / maxSubFlowLength);
        let subFlowLength = Math.ceil(route.length / numSubFlows);
        for (let i = 0; i < numSubFlows; i++) {
            if (i == 0)
                routes.push(route.slice(0, subFlowLength));
            else
                routes.push(route.slice((i * subFlowLength) - 1, (i + 1) * subFlowLength));
        }
    } else
        routes.push(route);
    return routes;
}

/**
 * Determines the number of transmissions in a route and the size of the window for retransmissions.
 * @param route
 * @param network
 * @param equationNumber
 * @param scalingFactor
 * @return {[numTransmissions: number, windowSize: number]} - numTransmissons will determine length of the final flow,
 *                                                            while windowSize determines how many slots a node will be
 *                                                            active in.
 */
function determineFlowCosts(route, network, equationNumber, scalingFactor) {
    let cost = 0;
    for (let i = 0; i < route.length - 1; i++) {
        if (equationNumber === 2)
            cost += network.getLinkEtx(route[i], route[i + 1]);
        else
            cost += Math.ceil(network.getLinkEtx(route[i], route[i + 1]));
    }
    if (equationNumber === 2)
        cost = Math.ceil(cost);
    return [scalingFactor * cost, 2 + (scalingFactor * cost) - route.length];
}

//# sourceMappingURL=RetransmissionStrategies.js.map