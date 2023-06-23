window.YearPicker = function (container, options = {}) {
  var Picker = {
    // expose states
    ComponentId: "",
    Options: {},
    Selected: [],
    // expose functions
    GetSelected: GetSelected,
    Show: ShowPicker,
    Hide: HidePicker,
  };

  function GetSelected() {
    return this.Selected;
  }

  function UpdateUISelected() {
    const [startYear, endYear] = Picker.Selected;
    const yearItems = document.querySelectorAll(`#${Picker.ComponentId} .year-picker-item`);
    yearItems.forEach((item) => {
      const itemYear = parseInt(item.innerText);
      const isDisabled = (item.className || "").indexOf("year-picker-item-disabled") > -1;
      if (!isDisabled) {
        if (startYear && endYear) {
          if (itemYear >= startYear && itemYear <= endYear) {
            item.className = "year-picker-item year-picker-item-selected";
          } else {
            item.className = "year-picker-item";
          }
        } else {
          if (itemYear == startYear) {
            item.className = "year-picker-item year-picker-item-selected";
          } else {
            item.className = "year-picker-item";
          }
        }
      }
    });
  }

  function InitBaseContainer(container, componentId, startYear, endYear) {
    function getYearInfo(startYear, endYear) {
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

    function handleYearSelection(event) {
      const target = event.target;
      const container = target.closest(".year-picker-container");
      const yearItem = target.closest(".year-picker-item");
      if (!yearItem || !container) return;

      const isDisabled = (yearItem.className || "").indexOf("year-picker-item-disabled") > -1;
      if (isDisabled) return;

      const selectedYear = parseInt(yearItem.innerText);

      if (Picker.Selected.length === 0) {
        yearItem.classList.add("year-picker-item-selected");
        Picker.Selected.push(selectedYear);
      } else if (Picker.Selected.length === 1) {
        const startYear = Picker.Selected[0];
        const endYear = selectedYear;

        if (startYear === endYear) {
          yearItem.classList.remove("year-picker-item-selected");
          Picker.Selected = [];
        } else {
          Picker.Selected.push(endYear);

          const yearItems = container.querySelectorAll(`.year-picker-item`);
          yearItems.forEach((item) => {
            const itemYear = parseInt(item.innerText);
            if (itemYear >= Math.min(startYear, endYear) && itemYear <= Math.max(startYear, endYear)) {
              item.classList.add("year-picker-item-selected");
            } else {
              item.classList.remove("year-picker-item-selected");
            }
          });
        }
      } else {
        yearItem.classList.add("year-picker-item-selected");
        Picker.Selected = [selectedYear];

        const yearItems = container.querySelectorAll(".year-picker-item");
        yearItems.forEach((item) => {
          if (item !== yearItem) {
            item.classList.remove("year-picker-item-selected");
          }
        });
      }

      if (Picker.Options && Picker.Options.updater && typeof Picker.Options.updater === "function") {
        Picker.Selected.sort((a, b) => a - b);
        Picker.Options.updater(Picker.Selected);
      }
    }

    const datasets = getYearInfo(startYear, endYear);
    const template = `
        <div id="${componentId}" class="year-picker-container">
          <table>
            <thead>${initTableHead(datasets.ages)}</thead>
            <tbody>${initTableBody(datasets.groups)}</tbody>
          </table>
        </div>
      `;
    document.querySelector(container).innerHTML = template;
    document.getElementById(componentId).addEventListener("click", handleYearSelection);
  }

  function ShowPicker() {
    document.getElementById(Picker.ComponentId).classList.remove("hide");
  }

  function HidePicker() {
    document.getElementById(Picker.ComponentId).classList.add("hide");
  }

  function Bootstrap(container, options = {}) {
    const componentId = "year-picker-" + Math.random().toString(36).slice(-6);
    Picker.ComponentId = componentId;

    Picker.Options = options;
    const { preselected, range } = options;

    // Only handle correct parameters
    if (preselected) {
      if (typeof preselected === "number") {
        Picker.Selected = [preselected];
      } else {
        if (preselected.length === 2) {
          Picker.Selected = preselected.map((item) => Number(item)).sort((a, b) => a - b);
        }
      }
    }
    // fallback use last ten years
    if (Picker.Selected.length === 0) {
      const currentYear = new Date().getFullYear();
      Picker.Selected = [currentYear - 10, currentYear];
    }

    // create base template
    const [begin, end] = range || [1970, new Date().getFullYear()];
    InitBaseContainer(container, componentId, begin, end);
    UpdateUISelected();
    return Picker;
  }

  return Bootstrap(container, options);
};
