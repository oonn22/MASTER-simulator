import {Network} from "./Network Components/Network.js";
import {Flow} from "./Network Components/Flow.js";
import {Router} from "./Routing/Router.js";
import {Scheduler} from "./Scheduling/Scheduler.js";
import {Simulator} from "./Simulation/Simulator.js";

let network = new Network();
let flows: Flow[] = [];

let numChannelsInput = <HTMLInputElement>document.getElementById("num_channels_input");
let etxPowerInput = <HTMLInputElement>document.getElementById("etx_power_input");
let maxFlowLengthInput = <HTMLInputElement>document.getElementById("flow_length_input");
let scalingFactorInput = <HTMLInputElement>document.getElementById("scaling_factor_input");
let retransmissionInput = <HTMLInputElement>document.getElementById("retransmission_strategy_input");

let nodeAInput = <HTMLInputElement>document.getElementById("nodeA_input");
let nodeBInput = <HTMLInputElement>document.getElementById("nodeB_input");
let etxInput = <HTMLInputElement>document.getElementById("etx_input");
let addNodeBtn = <HTMLButtonElement>document.getElementById("add_node_btn");
let clearNetworkBtn = <HTMLButtonElement>document.getElementById("clear_network_btn");

let displayNetwork = <HTMLElement>document.getElementById("display_network");

let sourceInput = <HTMLInputElement>document.getElementById("source_input");
let destinationInput = <HTMLInputElement>document.getElementById("destination_input");
let releaseTimeInput = <HTMLInputElement>document.getElementById("release_time_input");
let deadlineInput = <HTMLInputElement>document.getElementById("deadline_input");
let addFlowBtn = <HTMLButtonElement>document.getElementById("add_flow_btn");
let randFlowsBtn = <HTMLButtonElement>document.getElementById("random_flow_btn");
let clearFlowsBtn = <HTMLButtonElement>document.getElementById("clear_flow_btn")

let displayRoutes = <HTMLElement>document.getElementById("display_routes");

let displaySchedule = <HTMLElement>document.getElementById("display_schedule");

let simTimeInput = <HTMLInputElement>document.getElementById("sim_time_input");
let simNetworkBtn = <HTMLButtonElement>document.getElementById("sim_network_btn");
let simScheduleBtn = <HTMLButtonElement>document.getElementById("sim_schedule_btn");
let displaySimResults = <HTMLElement>document.getElementById("display_sim_results");

function updateNumChannels() {
    let numChannels = numChannelsInput.value;
    if (numChannels !== '') {
        network.numChannels = Number.parseInt(numChannels);
        if (flows.length > 0) createSchedule();
    }
}

function updateEtxPower() {
    let etxPower = etxPowerInput.value;
    if (etxPower !== '') {
        network.etxPower = Number.parseInt(etxPower);
        if (flows.length > 0) {
            Router.routeFlows(flows, network);
            displayFlows(flows)
            createSchedule();
        }
    }
}

function updateMaxFlowLength() {
    let flowLength = maxFlowLengthInput.value;
    if (flowLength !== '' && Number.parseInt(flowLength) > 0) {
        network.maxFlowLength = Number.parseInt(flowLength);
        if (flows.length > 0) createSchedule();
    }
}

function updateScalingFactor() {
    let scalingFactor = scalingFactorInput.value;
    if (scalingFactor !== '' && Number.parseInt(scalingFactor) > 0) {
        network.scalingFactor = Number.parseInt(scalingFactor);
        if (flows.length > 0) createSchedule();
    }
}

function updateRetransmissionStrategy() {
    if (retransmissionInput.value === "baseline" ||
        retransmissionInput.value === "slot-based" ||
        retransmissionInput.value === "SW2" ||
        retransmissionInput.value === "SW3") {
        network.retransmissionStrategy = retransmissionInput.value;
        if (flows.length > 0) createSchedule();
    }
}

function addNode() {
    let nodeA = nodeAInput.value;
    let nodeB = nodeBInput.value;
    let etx = Number(etxInput.value);

    if (network.addLink(nodeA, nodeB, etx))
        displayNetwork.innerHTML = network.toString().replaceAll('\n', '<br/>');

    if (flows.length > 0) {
        Router.routeFlows(flows, network);
        displayFlows(flows);
        createSchedule();
    }

    nodeAInput.value = "";
    nodeBInput.value = "";
    etxInput.value = "";
}

function addFlow() {
    let source = sourceInput.value;
    let destination = destinationInput.value;
    let releaseTime = Number(releaseTimeInput.value);
    let deadline = Number(deadlineInput.value);
    let flow = new Flow(source, destination);

    flows.push(flow);

    Router.route(flow, network);
    displayFlow(flow);

    sourceInput.value = "";
    destinationInput.value = "";
    releaseTimeInput.value = "0";
    deadlineInput.value = "0";

    createSchedule();
}

function randomFlows() {
    clearFlows();
    flows = Simulator.generateRandomFlows(network);
    Router.routeFlows(flows, network);
    displayFlows(flows);

    createSchedule();
}

function displayFlows(flowsToDisplay: Flow[]) {
    displayRoutes.innerHTML = "";
    for (let flow of flowsToDisplay) displayFlow(flow);
}

function displayFlow(flow: Flow) {
    if (displayRoutes.innerHTML === "No Routes") displayRoutes.innerHTML = "";
    displayRoutes.innerHTML = displayRoutes.innerHTML + flow.routeToString() + "<br/>";
}

function createSchedule() {
    let schedule = Scheduler.createSchedule(flows, network);
    displaySchedule.innerHTML = schedule.toString(network.timeSlotSize);
}

function simulateSchedule() {
    if (flows.length > 0) {
        let schedule = Scheduler.createSchedule(flows, network);
        let result = Simulator.simulateSchedule(schedule, flows, network).results

        displaySimResults.innerHTML = result.toString(network.timeSlotSize);
    }
}

function simulateNetwork() {
    if (simTimeInput.value !== "" && Number(simTimeInput.value) > 0) {
        let duration = Number(simTimeInput.value);
        let result = Simulator.simulateNetwork(network, duration);

        displaySimResults.innerHTML = result.toString(network.timeSlotSize);
    }
}

function clearNetwork() {
    let newNetwork = new Network();

    newNetwork.retransmissionStrategy = network.retransmissionStrategy;
    newNetwork.etxPower = network.etxPower;
    newNetwork.numChannels = network.numChannels;
    newNetwork.maxFlowLength = network.maxFlowLength;
    newNetwork.timeSlotSize = network.timeSlotSize;

    network = newNetwork;

    displayNetwork.innerHTML = "No Network";
    clearFlows();
}

function clearFlows() {
    flows = [];
    displayRoutes.innerHTML = "No Routes";
    displaySchedule.innerHTML = "No Schedule";
}

numChannelsInput.addEventListener('input', updateNumChannels);
etxPowerInput.addEventListener('input', updateEtxPower);
maxFlowLengthInput.addEventListener('input', updateMaxFlowLength);
scalingFactorInput.addEventListener('input', updateScalingFactor);
retransmissionInput.addEventListener('change', updateRetransmissionStrategy);

addNodeBtn.addEventListener('click', addNode);
addFlowBtn.addEventListener('click', addFlow);
randFlowsBtn.addEventListener('click', randomFlows);
clearNetworkBtn.addEventListener('click', clearNetwork);
clearFlowsBtn.addEventListener('click', clearFlows);
simNetworkBtn.addEventListener('click', simulateNetwork);
simScheduleBtn.addEventListener('click', simulateSchedule);

numChannelsInput.value = network.numChannels.toString();
etxPowerInput.value = network.etxPower.toString();
maxFlowLengthInput.value = network.maxFlowLength.toString();
scalingFactorInput.value = network.scalingFactor.toString();