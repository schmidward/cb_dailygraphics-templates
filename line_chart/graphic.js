let { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

let d3 = {
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-shape/dist/d3-shape.min"),
};

let { isMobile } = require("./lib/breakpoints");
let { html, svg, render } = require("lit-html");
let COLORS = require("./lib/helpers/colors");
let { key, yAxis, xAxis, grid } = require("./lib/chartAxes");

let exclude = new Set(["date", "x", "group"]);
// convert date strings into a scalar value
for (let item of window.DATA) {
  let [month, day, year] = item.date.split("/").map(Number);
  year += year < 50 ? 2000 : 1900;
  item.x = new Date(year, month - 1, day);
}
window.DATA.sort((a, b) => a.x - b.x);

var containers = document.querySelectorAll(".chart-container");
draw();
window.addEventListener("resize", draw);

function draw() {
  for (var container of containers) {
    var data = window.DATA;
    if (container.dataset.group) {
      data = data.filter(d => d.group == container.dataset.group);
    }
    renderLineChart(data, container);
  }
}

function renderLineChart(chartData, container) {
  let yContainer = container.querySelector(".y-axis");
  let xContainer = container.querySelector(".x-axis");
  let chartContainer = container.querySelector(".chart");
  let keyContainer = container.querySelector(".mobile-key");

  let series = Object.keys(chartData[0]).filter((c) => chartData[0][c] && !exclude.has(c));
  let colorScale = d3
    .scaleOrdinal()
    .domain(series)
    .range([
      COLORS.teal2,
      COLORS.purple2,
      COLORS.peach2,
      COLORS.blue2,
      COLORS.gray2,
    ]);

  let dates = chartData.map((d) => d.x);
  let xDomain = [Math.min(...dates), Math.max(...dates)];
  let values = chartData.flatMap((d) => series.map((s) => d[s]));
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min > 0) min = 0;

  let yScale = d3.scaleLinear()
    .domain([min, max])
    .range([yContainer.offsetHeight, 0])
    .nice();

  let xScale = d3.scaleTime()
    .domain(xDomain)
    .range([0, xContainer.offsetWidth])
    .nice();

  let config = {
    series,
    xScale,
    yScale,
    colorScale,
    xFormat: (d) => d.getFullYear(),
    yFormat: (d) => d.toFixed(0),
    labelFormat: d => d.toFixed(1),
    xTicks: isMobile.matches ? 5 : 7,
    yTicks: isMobile.matches ? 4 : 7
  };

  render(key(config), keyContainer);
  render(yAxis(config), yContainer);
  render(xAxis(config), xContainer);
  render(chart(chartData, config), chartContainer);
}

function chart(data, config) {
  let {
    xScale,
    yScale,
    labelFormat,
    series,
    colorScale,
  } = config;
  return html`
    <svg>
      ${grid(config)}
      <g class="lines">
        ${series.map((s) => {
          let line = d3.line().x((d) => xScale(d.x)).y((d) => yScale(d[s]));
          return svg`
        <path d="${line(data)}" stroke="${colorScale(s)}" stroke-width="3" />`;
        })}
      </g>
      <g class="value">
        ${series.map((s) => {
          let d = data.at(-1)
          return svg`
        <foreignObject x=${xScale(d.x) + 10} y=${yScale(d[s]) - 10} width="100%" height="100%">
          <div>
            <span class="series-label">${s}: </span>${labelFormat(d[s])}
          </div>
        </foreignObject>`;
        })}
      </g>
    </svg>
  `;
}
