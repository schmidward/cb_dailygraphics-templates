let { html, svg } = require("lit-html");

function key({ series, colorScale: scale }) {
  if (series.length < 2) return null;
  return html`
    <ul>
      ${series.map(
        (s) => html`
        <li>
          <span class="key-block" style="color: ${scale(s)}"></span>
          ${s}
        </li>
        `
      )}
    </ul>
  `;
}

function yAxis({ yScale: scale, yFormat: format, yTicks: ticks }) {
  let [min, max] = scale.domain();
  let [bottom, top] = scale.range();
  return html`
    <svg
      viewBox="-50 0 50 ${Math.abs(top - bottom)}"
      preserveAspectRatio="xMaxYMin slice"
    >
      <g class="y axis">
        <line class="domain" x1="0" x2="0" y1="${scale(min)}" y2="${scale(max)}"></line>
        ${scale.ticks(ticks).map(
          (t) => svg`
        <g class="tick" transform="translate(0,${scale(t) | 0})">
          <line x2="-5"></line>
          <text style="text-anchor: end" x="-6" dy=".4em">${format(t)}</text>
        </g>`
        )}
      </g>
    </svg>
  `;
}

function xAxis({ xScale: scale, xFormat: format, xTicks: ticks }) {
  let [min, max] = scale.domain();
  let [left, right] = scale.range();
  return html`
    <svg
      viewBox="0 0 ${Math.abs(right - left)} 50"
      preserveAspectRatio="xMinYMin slice"
    >
      <g class="x axis">
        <line class="domain" y1="0" y2="0" x1="${scale(min)}" x2="${scale(max)}"></line>
        ${scale.ticks(ticks).map((t) => svg`
        <g class="tick" transform="translate(${scale(t) | 0}, 0)">
          <line y2="5"></line>
          <text style="text-anchor: middle" y="1.5em">${format(t)}</text>
        </g>`
        )}
      </g>
    </svg>
  `;
}

function grid(config) {
  let { xScale, xTicks, yScale, yTicks } = config;
  let [min, max] = yScale.domain();
  let [left, right] = xScale.range();
  let [bottom, top] = yScale.range();
  return svg`
  <g class="grid tick">
    ${xScale.ticks(xTicks).map((x) => svg`
    <line x1=${xScale(x) | 0} x2=${xScale(x) | 0} y1=${top} y2=${bottom} />`
    )}
    ${yScale.ticks(yTicks).map((y) => svg`
    <line x1=${left} x2=${right} y1=${yScale(y) | 0} y2=${yScale(y) | 0} />`
    )}
    ${min >= 0 ? null : svg`
    <line class="zero-line" x1=${left} x2=${right} y1=${yScale(0)} y2=${yScale(0)} />
    `}
  </g>
  `
}

module.exports = { key, grid, yAxis, xAxis };