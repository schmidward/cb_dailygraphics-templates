Line Chart
==========

Line charts are built on a CSS grid for the different sections.

====== ==========
Y Axis Chart area
====== ==========
spacer X Axis
====== ==========

The aspect ratio and sizes of the grid are controlled using CSS variables at the top of the graphic.less file.

Line labels are inserted as SVG foreignObject tags, which lets them take advantage of HTML wrapping and text formatting. However, there is a bug in Safari (sigh) that causes these tags to be incorrectly positioned if they're moved to a separate rendering context, so *do not* apply CSS transforms to these elements.

The grid for each chart is inserted via the EJS template, so that CSS can be applied before rendering. The chart is then rendered using `Lit <https://lit.dev/docs/templates/overview/>`_ template functions in ``graphic.js``. Some of these functions are imported from ``lib/chartAxes.js``.

As much as possible, a priority for this template is to keep all chart configuration in a single, compact location. So just as the CSS controls are at the top of the stylesheet in custom properties, the chart JS passes a common config object into the different rendering functions. This config object should look roughly like this:

.. code:: javascript

  let config = {
    series, // list of lines to draw from object properties
    xScale, // D3 scale for the x-axis
    yScale, // D3 scale for the y-axis
    colorScale, // D3 scale for coloring (can be overridden from CSS, using the series name)
    xFormat: (d) => d.getFullYear(), // x-axis label formatter function
    yFormat: (d) => d.toFixed(0), // y-axis label formatter function
    labelFormat: d => d.toFixed(1), // line label formatter function
    xTicks: isMobile.matches ? 5 : 7, // number of preferred ticks/gridlines on the x-axis
    yTicks: isMobile.matches ? 4 : 7 // number of preferred ticks/gridlines on the y-axis
  };

The format functions are also used to filter the tick and gridline output: to suppress a given line, return a false-y value (such as an empty string) from your formatter.

FAQ
---

**Can I create a small multiple graphic?**

Yes, this template supports that natively. Add a ``group`` column to your data to assign a given row to a particular chart. The ``group`` value will also be used for the chart subheads, and it will be added as the ``data-group`` attribute for each small multiple. You can then use this to tweak the individual styles. For example, you might use the following rule to adjust the y-axis spacing on a test result chart:

.. code:: css

  [data-group="Reading"] { --spacing-left: 35px; }

**Can I use different y-axis data formats and labeling methods on certain small multiples?**

Sure. As one method, create a list that contains exceptions to your default axis settings. Then add a ternary to check for those exceptions on the yScale max, yFormat labels, and labelFormat labels. 

For instance:

.. code:: javascript

  let absoluteStates = new Set(["Maine"]);

Change the axis max conditionally:

.. code:: javascript

  let max = absoluteStates.has(state) ? 3000 : 20;

Change the labels conditionally:

.. code:: javascript

    yFormat: absoluteStates.has(state) ? (d) => d.toLocaleString() : (d) => d.toFixed(0) + "%",
    labelFormat: absoluteStates.has(state) ? d => d.toLocaleString() : d => d.toFixed(1) + "%",

**What if I don't have my data in DD/MM/YYYY format?**

The default date formatter is:

.. code:: javascript

  for (let item of window.DATA) {
    let [month, day, year] = item.date.split("/").map(Number);
    year += year < 50 ? 2000 : 1900;
    item.x = new Date(year, month - 1, day);
  }

As one option, you can just add 1/1/YYYY as the prefix to each year, then adjust the labels to reflect only the year. Alternatively, you can rewrite the date formatter.
