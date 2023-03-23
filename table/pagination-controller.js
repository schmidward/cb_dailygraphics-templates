
var range = function*(start, stop, step = 1) {
  for (var i = start; i <= stop; i += step) {
    yield i;
  }
};

var template = require("./_pagination-controller.html");

class PaginationController extends HTMLElement {
  constructor() {
    super();
    var root = this.attachShadow({ mode: "open" });
    root.innerHTML = template;
    this.elements = {};
    for (var el of root.querySelectorAll("[as]")) {
      var as = el.getAttribute("as");
      var existing = this.elements[as];
      if (existing instanceof Array) {
        existing.push(el)
      } else if (existing) {
        this.elements[as] = [existing, el];
      } else {
        this.elements[as] = el;
      }
    }

    var sortMarkerTemplate = root.querySelector("template.sortable-marker");

    for (var select of this.elements.selects) {
      select.addEventListener("input", this.handlePaginationClick.bind(this));
    }
    this.elements.search.addEventListener("input", this.handleSearch.bind(this));
    this.elements.clear.addEventListener("click", this.handleClear.bind(this));
  }

  connectedCallback() {
    var table = this.table = this.querySelector("table");
    if (!table) return;
    var rowCount = table.querySelectorAll("tbody tr").length;
    var pageSize = this.getAttribute("pagesize") || 10;
    var pages = Math.ceil(rowCount / pageSize);
    for (var select of this.elements.selects) {
      select.innerHTML = [...range(1, pages)].map(i => `
        <option value="${i - 1}">${i}</option>
      `).join("\n");
    }
    for (var total of this.elements.totals) {
      total.innerHTML = pages;
    }
    this.selectPage(0);

    var sortColumns = (this.getAttribute("sortable") || "").split(",");
    var numericColumns = (this.getAttribute("numeric") || "").split(",");
    var headers = table.querySelectorAll("thead th");
    for (var c of sortColumns) {
      var th = headers[c];
      var sortHeader = document.createElement("sortable-header");
      sortHeader.append(...th.childNodes);
      th.append(sortHeader);
      sortHeader.dataset.index = c;
      if (numericColumns.includes(c)) {
        sortHeader.dataset.numeric = true;
      }
      sortHeader.addEventListener("click", this.handleSort.bind(this));
    }
  }

  handlePaginationClick(e) {
    var page = e.target.value;
    if (!page) return;
    this.selectPage(page);
  }

  selectPage(index) {
    var rows = this.table.querySelectorAll("tbody tr");
    var pageSize = Number(this.getAttribute("pagesize") || 10);
    var start = index * pageSize;
    var end = start + pageSize;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.toggleAttribute("hidden", i < start || i >= end);
    }
    for (var select of this.elements.selects) {
      select.value = index;
    }
  }

  handleSearch() {
    var query = this.elements.search.value.trim();
    if (!query) {
      return this.handleClear();
    }
    var re = new RegExp(query, "i");
    var rows = this.table.querySelectorAll("tbody tr");
    var visible = 0;
    for (var row of rows) {
      var name = row.innerText.trim();
      var hidden = row.toggleAttribute("hidden", !name.match(re));
      if (!hidden) visible++;
    }
    if (!visible) {
      this.setAttribute("empty", "");
    }
    this.setAttribute("searching", "");
  }

  handleClear() {
    this.removeAttribute("searching");
    this.removeAttribute("empty");
    this.elements.search.value = "";
    this.selectPage(0);
  }

  handleSort(e) {
    var header = e.target;
    var currentDirection = header.getAttribute("sort");
    var newDirection = !currentDirection || currentDirection == "descending" ? "ascending" : "descending";
    header.setAttribute("sort", newDirection);
    var flip = newDirection == "descending" ? -1 : 1;
    var index = header.dataset.index;
    var numeric = header.dataset.numeric;
    var rows = Array.from(this.table.querySelectorAll("tbody tr"));
    var numeralize = v => v.replace(/[\$,]/g, "") * 1;
    rows.sort((a, b) => {
      var aCell = a.children[index].innerText.trim();
      var bCell = b.children[index].innerText.trim();
      if (numeric) {
        return (numeralize(aCell) - numeralize(bCell)) * flip;
      } else {
        var value = aCell == bCell ? 0 : aCell < bCell ? -1 : 1;
        return value * flip;
      }
    });
    var tbody = this.table.querySelector("tbody");
    tbody.append(...rows);
    this.selectPage(0);
    var allHeaders = this.table.querySelectorAll("sortable-header");
    for (var h of allHeaders) {
      if (h != header) h.removeAttribute("sort");
    }
  }
}

window.customElements.define("pagination-controller", PaginationController);

var sortHeaderTemplate = `
<style>
:host {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  vertical-align: center;
  cursor: pointer;
}
svg { margin-left: 8px; }
:host([sort="ascending"]) .down-arrow { display: none }
:host([sort="descending"]) .up-arrow { display: none }
</style>
<slot></slot>
<svg width="10" height="16" viewBox="0 0 10 16" aria-label="sortable" role="image">
  <path class="up-arrow" d="M5,0 L10,5 L0,5Z" fill="currentColor" />
  <path class="separator" d="M0,8 L10,8" stroke="currentColor" strokeWidth=2 />
  <path class="down-arrow" d="M5,16 L0,11 L10,11Z" fill="currentColor" />
</svg>`

class SortableHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = sortHeaderTemplate;
  }

  static observedAttributes = ["sort"];
  attributeChangedCallback(attr, was, value) {
    var icon = this.shadowRoot.querySelector("svg");
    if (value) {
      icon.setAttribute("aria-label", "sorted " + value);
    } else {
      icon.setAttribute("aria-label", "sortable");
    }
  }
}

window.customElements.define("sortable-header", SortableHeader);