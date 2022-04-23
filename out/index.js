import {Network} from "./Network Components/Network.js";
import {Flow} from "./Network Components/Flow.js";
import {Router} from "./Routing/Router.js";
import {Scheduler} from "./Scheduling/Scheduler.js";
import {Simulator} from "./Simulation/Simulator.js";
// functions required to display graphs added to window scope in Graphing.js
// @ts-ignore
const displayNetworkGraph = window.displayNetworkGraph;
// @ts-ignore
const clearNetworkGraph = window.clearNetworkGraph;
let network = new Network();
let flows = [];
let nodeAInput = document.getElementById("nodeA_input");
let nodeBInput = document.getElementById("nodeB_input");
let etxInput = document.getElementById("etx_input");
let addNodeBtn = document.getElementById("add_node_btn");
let selectedNodeDisplay = document.getElementById("node_selected_display");
let selectedNeighbour = document.getElementById("neighbour_selected");
let newEtxInput = document.getElementById("new_etx_input");
let changeEtxBtn = document.getElementById("edit_link_btn");
let numChannelsInput = document.getElementById("num_channels_input");
let timeSlotSizeInput = document.getElementById("time_slot_size_input");
let etxPowerInput = document.getElementById("etx_power_input");
let maxFlowLengthInput = document.getElementById("flow_length_input");
let scalingFactorInput = document.getElementById("scaling_factor_input");
let retransmissionInput = document.getElementById("retransmission_strategy_input");
let clearNetworkBtn = document.getElementById("clear_network_btn");
let sourceInput = document.getElementById("source_input");
let destinationInput = document.getElementById("destination_input");
let addFlowBtn = document.getElementById("add_flow_btn");
let displayFlowRoutes = document.getElementById("flow_display");
let randFlowsBtn = document.getElementById("random_flow_btn");
let clearFlowsBtn = document.getElementById("clear_flow_btn");
let displaySchedule = document.getElementById("display_schedule");
let simTimeInput = document.getElementById("sim_time_input");
let simNetworkBtn = document.getElementById("sim_network_btn");
let simScheduleBtn = document.getElementById("sim_schedule_btn");
let displaySimResults = document.getElementById("display_sim_results");
function updateNumChannels() {
    let numChannels = numChannelsInput.value;
    if (numChannels !== '') {
        network.numChannels = Number.parseInt(numChannels);
        if (flows.length > 0)
            createSchedule();
    }
}
function updateEtxPower() {
    let etxPower = etxPowerInput.value;
    if (etxPower !== '') {
        network.etxPower = Number.parseInt(etxPower);
        if (flows.length > 0) {
            Router.routeFlows(flows, network);
            displayFlows();
            createSchedule();
        }
    }
}
function updateMaxFlowLength() {
    let flowLength = maxFlowLengthInput.value;
    if (flowLength !== '' && Number.parseInt(flowLength) > 0) {
        network.maxFlowLength = Number.parseInt(flowLength);
        if (flows.length > 0)
            createSchedule();
    }
}
function updateScalingFactor() {
    let scalingFactor = scalingFactorInput.value;
    if (scalingFactor !== '' && Number.parseInt(scalingFactor) > 0) {
        network.scalingFactor = Number.parseInt(scalingFactor);
        displaySimResults.innerHTML = "No Results";
        if (flows.length > 0)
            createSchedule();
    }
}

function updateRetransmissionStrategy() {
    if (retransmissionInput.value === "baseline" ||
        retransmissionInput.value === "slot-based" ||
        retransmissionInput.value === "SW2" ||
        retransmissionInput.value === "SW3") {
        network.retransmissionStrategy = retransmissionInput.value;
        displaySimResults.innerHTML = "No Results";
        if (flows.length > 0)
            createSchedule();
    }
}

function updateTimeSlotSize() {
    let slotSize = timeSlotSizeInput.value;
    if (slotSize !== '' && Number.parseInt(slotSize) > 0) {
        network.timeSlotSize = Number.parseInt(slotSize);
        if (flows.length > 0)
            createSchedule();
    }
}

function updateEtxDisplayed() {
    if (selectedNeighbour.value === "") {
        newEtxInput.value = "";
        changeEtxBtn.disabled = true;
    } else {
        let idA = selectedNodeDisplay.innerText;
        let idB = selectedNeighbour.value;
        let etx = network.getLinkEtx(idA, idB);
        if (etx === 0)
            newEtxInput.value = "";
        else {
            newEtxInput.value = etx.toString();
            changeEtxBtn.disabled = false;
        }
    }
}

function changeEtxValue() {
    let newValue = parseFloat(newEtxInput.value);
    let nodeA = selectedNodeDisplay.innerText;
    let nodeB = selectedNeighbour.value;
    if (!isNaN(newValue) && network.nodes.has(nodeA) && network.nodes.has(nodeB)) {
        network.editLinkEtx(nodeA, nodeB, newValue);
        displayNetwork();
    }
    updateEtxDisplayed();
}

function addNode() {
    let nodeA = nodeAInput.value;
    let nodeB = nodeBInput.value;
    let etx = Number(etxInput.value);
    if (!isNaN(etx)) {
        if (network.addLink(nodeA, nodeB, etx))
            displayNetwork();
        if (flows.length > 0) {
            Router.routeFlows(flows, network);
            displayFlows();
            createSchedule();
        }
        if (selectedNodeDisplay.innerText !== "")
            onNodeClick({"name": selectedNodeDisplay.innerText});
    }
    nodeAInput.value = "";
    nodeBInput.value = "";
    etxInput.value = "";
}
function addFlow() {
    let source = sourceInput.value;
    let destination = destinationInput.value;
    if (source !== "" && destination !== "" && network.nodes.has(source) && network.nodes.has(destination)) {
        let flow = new Flow(source, destination);
        flows.push(flow);
        Router.route(flow, network);
        displayFlow(flow);
        sourceInput.value = "";
        destinationInput.value = "";
        createSchedule();
    }
}
function randomFlows() {
    if (network.nodes.size >= 2) {
        clearFlows();
        flows = Simulator.generateRandomFlows(network);
        Router.routeFlows(flows, network);
        displayFlows();
        createSchedule();
    }
}
function createSchedule() {
    let schedule = Scheduler.createSchedule(flows, network);
    displaySchedule.innerHTML = schedule.toString(network.timeSlotSize);
}

function simulateSchedule() {
    if (flows.length > 0) {
        let schedule = Scheduler.createSchedule(flows, network);
        let result = Simulator.simulateSchedule(schedule, flows, network).results;
        displaySimResults.innerHTML = result.toString(network.timeSlotSize);
    }
}

function simulateNetwork() {
    let duration = Number(simTimeInput.value);
    if (simTimeInput.value !== "" && duration > 0 && network.nodes.size >= 2) {
        displaySimResults.innerHTML = "Simulating...\n\n\n\n\n\n\n";
        setTimeout(() => {
            displaySimResults.innerHTML = Simulator.simulateNetwork(network, duration).toString(network.timeSlotSize);
        }, 50); //Timeout allows page to be updated before simulation starts
    }
}

function onNodeClick(d) {
    let node = network.nodes.get(d.name);
    newEtxInput.value = "";
    if (node === undefined)
        throw new Error("Node doesn't exist in network!");
    selectedNodeDisplay.innerText = d.name;
    for (let i = selectedNeighbour.options.length - 1; i >= 0; i--)
        selectedNeighbour.remove(i);
    let emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.text = "";
    emptyOption.selected = true;
    selectedNeighbour.add(emptyOption);
    for (let neighbour of node.links.keys()) {
        let newOption = document.createElement("option");
        newOption.value = neighbour.id;
        newOption.text = neighbour.id;
        selectedNeighbour.add(newOption);
    }
}

function displayNetwork() {
    let graph = network.toGraphableObject();
    displayNetworkGraph(graph, onNodeClick);
}

function displayFlows() {
    displayFlowRoutes.innerHTML = "";
    for (let flow of flows)
        displayFlow(flow);
}

function displayFlow(flow) {
    if (displayFlowRoutes.innerHTML === "No Routed Flows")
        displayFlowRoutes.innerHTML = "";
    displayFlowRoutes.innerHTML = displayFlowRoutes.innerHTML + flow.routeToString() + "\n";
}

function clearNetwork() {
    let newNetwork = new Network();
    newNetwork.retransmissionStrategy = network.retransmissionStrategy;
    newNetwork.etxPower = network.etxPower;
    newNetwork.numChannels = network.numChannels;
    newNetwork.maxFlowLength = network.maxFlowLength;
    newNetwork.timeSlotSize = network.timeSlotSize;
    selectedNodeDisplay.innerText = "";
    newEtxInput.value = "";
    for (let i = selectedNeighbour.options.length - 1; i >= 0; i--)
        selectedNeighbour.remove(i);
    changeEtxBtn.disabled = true;
    network = newNetwork;
    clearNetworkGraph();
    clearFlows();
    displaySimResults.innerHTML = "No Results";
}
function clearFlows() {
    flows = [];
    displayFlowRoutes.innerHTML = "No Routed Flows";
    displaySchedule.innerHTML = "No Schedule";
}

numChannelsInput.addEventListener('input', updateNumChannels);
timeSlotSizeInput.addEventListener('input', updateTimeSlotSize);
etxPowerInput.addEventListener('input', updateEtxPower);
maxFlowLengthInput.addEventListener('input', updateMaxFlowLength);
scalingFactorInput.addEventListener('input', updateScalingFactor);
retransmissionInput.addEventListener('change', updateRetransmissionStrategy);
addNodeBtn.addEventListener('click', addNode);
selectedNeighbour.addEventListener('change', updateEtxDisplayed);
changeEtxBtn.addEventListener('click', changeEtxValue);
addFlowBtn.addEventListener('click', addFlow);
randFlowsBtn.addEventListener('click', randomFlows);
clearNetworkBtn.addEventListener('click', clearNetwork);
clearFlowsBtn.addEventListener('click', clearFlows);
simNetworkBtn.addEventListener('click', simulateNetwork);
simScheduleBtn.addEventListener('click', simulateSchedule);
numChannelsInput.value = network.numChannels.toString();
timeSlotSizeInput.value = network.timeSlotSize.toString();
etxPowerInput.value = network.etxPower.toString();
maxFlowLengthInput.value = network.maxFlowLength.toString();
scalingFactorInput.value = network.scalingFactor.toString();
nodeAInput.value = "";
nodeBInput.value = "";
etxInput.value = "";
sourceInput.value = "";
destinationInput.value = "";
simTimeInput.value = "";
//# sourceMappingURL=index.js.map