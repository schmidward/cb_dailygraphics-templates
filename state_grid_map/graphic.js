var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

// build our custom D3 object
var d3 = {
  ...require("d3-scale/dist/d3-scale.min")
};

var { COLORS, classify } = require("./lib/helpers");
var { isMobile } = require("./lib/breakpoints");
var $ = require("./lib/qsa");

// Global vars

// Initialize the graphic.
var onWindowLoaded = function () {
  formatData();
  render();

  window.addEventListener("resize", render);
};

// Format graphic data.
var formatData = function () {
  if (!LABELS.show_territories) {
    var territories = ["Puerto Rico", "U.S. Virgin Islands", "Guam", "Northern Mariana Islands", "American Samoa"];

    DATA = DATA.filter((d) => territories.indexOf(d.state_name) == -1);
  }
};

// Render the graphic(s).
var render = function () {
  var isNumeric = LABELS.is_numeric;

  // Render the map!
  var container = "#state-grid-map";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderStateGridMap({
    container,
    element,
    width,
    data: DATA,
    // isNumeric will style the legend as a numeric scale
    isNumeric,
  });
};

// Render a state grid map.
var renderStateGridMap = function (config) {
  var valueColumn = "category";

  // Clear existing graphic (for redraw)
  var containerElement = config.element;
  containerElement.innerHTML = "";

  // Copy map template
  var template = document.querySelector("#map-template");
  containerElement.append(template.content.cloneNode(true));

  // Extract categories from data
  var categories = [];

  if (LABELS.legend_labels && LABELS.legend_labels !== "") {
    // If custom legend labels are specified
    categories = LABELS.legend_labels.split("|").map((l) => l.trim());

    if (config.isNumeric) {
      categories.forEach(function (d, i) {
        categories[i] = Number(categories[i]);
      });
    }
  } else {
    // Default: Return sorted array of categories
    config.data.forEach(function (state) {
      if (state[valueColumn] != null) {
        categories.push(state[valueColumn]);
      }
    });

    //dedupe
    categories = Array.from(new Set(categories)).sort();
  }

  // Create legend
  var legendWrapper = containerElement.querySelector(".key-wrap");
  var legendElement = containerElement.querySelector(".key");

  if (config.isNumeric) {
    legendWrapper.classList.add("numeric-scale");

    var colorScale = d3
      .scaleThreshold()
      .domain(categories)
      .range([COLORS.teal6, COLORS.teal5, COLORS.teal4, COLORS.teal3, COLORS.teal2, COLORS.teal1]);
  } else {
    // Define color scale
    var colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range([COLORS.red3, COLORS.yellow3, COLORS.blue3, COLORS.orange3, COLORS.teal3]);
  }

  colorScale.domain().forEach(function (key, i) {
    var keyItem = document.createElement("li")
    legendElement.append(keyItem)
    keyItem.classList.add("key-item");

    var b = document.createElement("b");
    b.style.background = colorScale(key);
    keyItem.append(b);

    var label = document.createElement("label");
    label.innerHTML = key;
    keyItem.append(label);

    // Add the optional upper bound label on numeric scale
    if (config.isNumeric && i == categories.length - 1) {
      if (LABELS.max_label && LABELS.max_label !== "") {
        var upperBound = document.createElement("label");
        upperBound.classList.add("end-label");
        upperBound.innerHTML = LABELS.max_label;
        keyItem.append(upperBound);
      }
    }
  });

  // Select SVG element
  var chartElement = containerElement.querySelector("svg");

  // Set state colors
  config.data.forEach(function (state) {
    if (state[valueColumn] !== null && state[valueColumn] !== undefined) {
      var stateClass = "state-" + classify(state.state_name);
      var categoryClass = "category-" + classify(state[valueColumn] + "");

      var selected = chartElement.querySelector("." + stateClass);
      selected.setAttribute("class", `${stateClass} ${categoryClass} state-active`);
      selected.setAttribute("fill", colorScale(state[valueColumn]));
    }
  });

  var ns = chartElement.namespaceURI;
  var labelGroup = document.createElementNS(ns, "g");
  chartElement.append(labelGroup);
  for (var d of config.data) {
    var state = STATES.find(s => s.name == d.state_name);
    var text = document.createElementNS(ns, "text");
    text.setAttribute("text-anchor", "middle");
    text.textContent = isMobile.matches ? state.usps : state.ap;
    labelGroup.append(text);
    if (valueColumn in d) {
      text.setAttribute("class", `category-${classify(d[valueColumn] + "")} label label-active`);
    } else {
      text.setAttribute("class", "label");
    }
    var box = chartElement.querySelector(`.state-${classify(state.name)}`);
    var boxBounds = box.getBBox();
    var textBounds = text.getBBox();
    text.setAttribute("x", boxBounds.x + boxBounds.width * .5 + .52);
    text.setAttribute("y", boxBounds.y + boxBounds.width * .5 + textBounds.height * .6);
  }
};

// Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
