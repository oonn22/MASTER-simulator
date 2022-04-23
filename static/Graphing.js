window.displayNetworkGraph = (graph, onNodeClick) => {
    let width = document.querySelector(".network-graph-container").clientWidth;
    let height = document.querySelector(".network-graph-container").clientHeight;
    let info = document.querySelector("#info_paragraph");
    let color = d3.scaleOrdinal(d3.schemeCategory20);

    info.style.display = 'none'

    let svg = d3.select("#network_graph");
    svg.style('display', 'flex');
    svg.selectAll("*").remove();

    let webCola = cola.d3adaptor(d3)
        .linkDistance((l) => {
            return l.etx * 75
        })
        .avoidOverlaps(true)
        .size([width, height]);

    webCola
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    let link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "graph-link");

    let node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("class", "graph-node")
        .attr("width", function (d) {
            return d.width;
        })
        .attr("height", function (d) {
            return d.height;
        })
        .attr("rx", 5).attr("ry", 5)
        .style("fill", function (d) {
            return color(1);
        })
        .call(webCola.drag)
        .on("click", onNodeClick);

    let label = svg.selectAll(".label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "graph-label")
        .text(function (d) {
            return d.name;
        })
        .call(webCola.drag)
        .on("click", onNodeClick);

    node.append("title")
        .text(function (d) {
            return d.name;
        });

    webCola.on("tick", function () {
        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node.attr("x", function (d) {
            return d.x - d.width / 2;
        })
            .attr("y", function (d) {
                return d.y - d.height / 2;
            });

        label.attr("x", function (d) {
            return d.x;
        })
            .attr("y", function (d) {
                let h = this.getBBox().height;
                return d.y + h / 4;
            });
    });
}

window.clearNetworkGraph = () => {
    let svg = d3.select("#network_graph");
    let info = document.querySelector("#info_paragraph");

    svg.selectAll("*").remove();
    svg.style("display", "none");
    info.style.display = 'flex';
}