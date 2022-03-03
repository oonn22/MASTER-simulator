import {Flow} from "../Network Components/Flow.js";
import {Network} from "../Network Components/Network.js";
import {Dijkstra} from "./Dijkstra.js";

/** A class that performs routing on flows within a network*/
export class Router {
    static routeFlows(flows: Flow[], network: Network) {
        for (let flow of flows) this.route(flow, network);
    }

    static route(flow: Flow, network: Network) {
        flow.route = Dijkstra(flow.source, flow.destination, network);
    }
}

