import {Dijkstra} from "./Dijkstra.js";

/** A class that performs routing on flows within a network*/
export class Router {
    static routeFlows(flows, network) {
        for (let flow of flows)
            this.route(flow, network);
    }

    static route(flow, network) {
        flow.route = Dijkstra(flow.source, flow.destination, network);
    }
}

//# sourceMappingURL=Router.js.map