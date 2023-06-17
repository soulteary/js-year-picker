window.YearPicker = (function () {
  var Picker = {
    Show: showPicker,
    Hide: hidePicker,
    GetSelected: function () {
      return this.Selected;
    },
    options: {},
    Selected: null,
    ComponentId: "",
  };

  function GetYearInfo(startYear, endYear) {
    const yearGroups = [];
    let ages = {};
    let tempArray = [];
    for (let i = startYear; i <= endYear; i++) {
      const age = ("" + i).slice(2, -1) + "0s";
      ages[age] = true;
      tempArray.push({ year: i, state: "normal" });
      if (tempArray.length === 5) {
        yearGroups.push(tempArray);
        tempArray = [];
      }
    }

    if (tempArray.length > 0) {
      yearGroups.push(tempArray);
    }

    return { ages: Object.keys(ages), groups: yearGroups };
  }

  function initTableHead(datasets) {
    let tpl = [];
    for (let i = 0; i < datasets.length; i++) {
      tpl.push(`<th colspan="2">${datasets[i]}</th>`);
    }
    return `<tr>${tpl.join("")}</tr>`;
  }

  function initTableBody(datasets) {
    let chunks = {};
    for (let i = 0; i < datasets.length; i++) {
      const age = ("" + datasets[i][0]).slice(2, -1) + "0s";
      chunks[age] = chunks[age] || [];
      if (datasets[i].length < 5) {
        const diff = 5 - datasets[i].length;
        const last = datasets[i][datasets[i].length - 1].year + 1;
        for (let j = last; j < last + diff; j++) {
          console.log(last);
          datasets[i].push({ year: last, state: "disabled" });
        }
      }
      chunks[age].push(datasets[i]);
    }

    let tpl = [];
    for (let key in chunks) {
      for (let i = 0; i < chunks[key].length; i++) {
        tpl.push(`<td>`);
        for (let j = 0; j < chunks[key][i].length; j++) {
          const { year, state } = chunks[key][i][j];
          console.log(year, state);
          if (state === "disabled") {
            tpl.push(`<div class="year-picker-item year-picker-item-disabled">${year}</div>`);
          } else {
            tpl.push(`<div class="year-picker-item">${year}</div>`);
          }
        }
        tpl.push("</td>");
      }
    }
    return `<tr>${tpl.join("")}</tr>`;
  }

  // year-picker-item-active
  //

  function initBaseContainer(container, componentId, startYear, endYear) {
    const datasets = GetYearInfo(startYear, endYear);
    const template = `
        <div id="${componentId}" class="year-picker-container">
        <table>
            <thead>${initTableHead(datasets.ages)}</thead>
            <tbody>${initTableBody(datasets.groups)}</tbody>
        </table>
    </div>
      `;
    document.querySelector(container).innerHTML = template;
  }

  /**
   * Show the domain picker
   */
  function showPicker() {
    document.getElementById(Picker.ComponentId).classList.remove("hide");
  }

  /**
   * Hide the domain picker
   */
  function hidePicker() {
    document.getElementById(Picker.ComponentId).classList.add("hide");
  }

  function bootstrap(container, options = {}) {
    const componentId = "year-picker-" + Math.random().toString(36).slice(-6);
    Picker.ComponentId = componentId;
    Picker.options = options;
    Picker.Selected = [];
    const startYear = options.startYear || 1970;
    const endYear = options.endYear || new Date().getFullYear();
    initBaseContainer(container, componentId, startYear, endYear);

    return Picker;
  }

  return bootstrap;
})();
