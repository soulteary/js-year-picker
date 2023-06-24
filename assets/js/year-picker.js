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

  function SetItemState(item, state) {
    const YEAR_ITEM_NORMAL = "year-picker-item";
    const YEAR_ITEM_SELECTED = "year-picker-item year-picker-item-selected";
    if (!item) return;
    switch (state) {
      case "normal":
        item.className = YEAR_ITEM_NORMAL;
        break;
      case "selected":
        item.className = YEAR_ITEM_SELECTED;
        break;
    }
  }

  function IsDisabled(item) {
    if (!item) return true;
    const isDisabled = (item.className || "").indexOf("year-picker-item-disabled") > -1;
    return isDisabled;
  }

  function Feedback() {
    if (Picker.Options && Picker.Options.updater && typeof Picker.Options.updater === "function") {
      Picker.Selected.sort((a, b) => a - b);
      Picker.Options.updater(Picker.Selected, Picker);
    }
  }

  function UpdateUISelected() {
    const [startYear, endYear] = Picker.Selected;
    const yearItems = document.querySelectorAll(`#${Picker.ComponentId} .year-picker-item`);
    yearItems.forEach((item) => {
      const itemYear = parseInt(item.innerText);
      if (!IsDisabled(item)) {
        if (startYear && endYear) {
          if (itemYear >= startYear && itemYear <= endYear) {
            SetItemState(item, "selected");
          } else {
            SetItemState(item, "normal");
          }
        } else {
          if (itemYear == startYear) {
            SetItemState(item, "selected");
          } else {
            SetItemState(item, "normal");
          }
        }
      }
    });
  }

  function InitBaseContainer(container, componentId, startYear, endYear) {
    function generateYearRange(start, end) {
      const prefix = start % 5;
      const append = end % 5;
      let years = [];
      const lastNum = ("" + end).slice(-1);

      if (prefix > 0) {
        for (let i = start - prefix; i < start; i++) {
          years.push({ year: i, state: "disabled" });
        }
      }
      for (let i = start; i <= end; i++) {
        years.push({ year: i, state: "normal" });
      }
      if (lastNum !== "9" || lastNum !== 4) {
        for (let i = end + 1; i < end + (5 - append); i++) {
          years.push({ year: i, state: "disabled" });
        }
      }
      return years;
    }

    function getYearInfo(startYear, endYear) {
      const yearGroups = [];
      let ages = {};
      let tmpArr = [];
      generateYearRange(startYear, endYear).forEach((item) => {
        const age = ("" + item.year).slice(2, -1) + "0s";
        ages[age] = true;
        tmpArr.push(item);
        if (tmpArr.length === 5) {
          yearGroups.push(tmpArr);
          tmpArr = [];
        }
      });
      return { ages: Object.keys(ages), groups: yearGroups };
    }

    function initTableHead(labels, datasets) {
      let tpl = [];
      for (let i = 0; i < labels.length; i++) {
        let useSingleCol = false;
        if (i === 0) {
          if (labels.length === 1) {
            useSingleCol = true;
          } else if (labels.length > 1) {
            if (("" + datasets[0][0].year).slice(2, -1) !== ("" + datasets[1][0].year).slice(2, -1)) {
              useSingleCol = true;
            }
          }
        }
        if (useSingleCol) {
          tpl.push(`<th colspan="1">${labels[i]}</th>`);
        } else {
          tpl.push(`<th colspan="2">${labels[i]}</th>`);
        }
      }
      return `<tr>${tpl.join("")}</tr>`;
    }

    function initTableBody(datasets) {
      let chunks = {};
      for (let i = 0; i < datasets.length; i++) {
        const age = ("" + datasets[i][0]).slice(2, -1) + "0s";
        chunks[age] = chunks[age] || [];
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
      if (!yearItem || !container || IsDisabled(yearItem)) return;

      const selectedYear = parseInt(yearItem.innerText);

      if (Picker.Selected.length === 0) {
        SetItemState(yearItem, "selected");
        Picker.Selected.push(selectedYear);
      } else if (Picker.Selected.length === 1) {
        const startYear = Picker.Selected[0];
        const endYear = selectedYear;

        if (startYear === endYear) {
          item.className = item.className.replace(/\s?year-picker-item-selected/g, "");
          Picker.Selected = [];
        } else {
          Picker.Selected.push(endYear);

          const yearItems = container.querySelectorAll(`.year-picker-item`);
          yearItems.forEach((item) => {
            const itemYear = parseInt(item.innerText);
            if (itemYear >= Math.min(startYear, endYear) && itemYear <= Math.max(startYear, endYear)) {
              SetItemState(item, "selected");
            } else {
              if (!IsDisabled(item)) {
                SetItemState(item, "normal");
              }
            }
          });
        }
      } else {
        SetItemState(yearItem, "selected");
        Picker.Selected = [selectedYear];

        const yearItems = container.querySelectorAll(".year-picker-item");
        yearItems.forEach((item) => {
          if (item !== yearItem) {
            item.className = item.className.replace(/\s?year-picker-item-selected/g, "");
          }
        });
      }

      Feedback();
    }

    const datasets = getYearInfo(startYear, endYear);
    const template = `
        <div id="${componentId}" class="year-picker-container">
          <table>
            <thead>${initTableHead(datasets.ages, datasets.groups)}</thead>
            <tbody>${initTableBody(datasets.groups)}</tbody>
          </table>
        </div>
      `;
    document.querySelector(container).innerHTML = template;
    document.getElementById(componentId).addEventListener("click", handleYearSelection);
  }

  function ShowPicker() {
    const container = document.getElementById(Picker.ComponentId);
    container.className = container.className.replace(/\s?hide/g, "");
  }

  function HidePicker() {
    const container = document.getElementById(Picker.ComponentId);
    container.className = container.className + " hide";

    Feedback();
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

    Feedback();

    return Picker;
  }

  return Bootstrap(container, options);
};
