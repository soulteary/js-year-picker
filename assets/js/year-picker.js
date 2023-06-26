window.YearPicker = function (container, options = {}) {
  const Picker = {
    // expose states
    ComponentId: "",
    Options: {},
    Selected: [],
    Visiable: false,
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
    return item.classList.contains("year-picker-item-disabled");
  }

  function Feedback(event) {
    if (Picker.Options && Picker.Options.updater && typeof Picker.Options.updater === "function") {
      Picker.Selected.sort((a, b) => a - b);
      Picker.Options.updater(Picker.Selected, event, Picker);
    }
  }

  function scrollToYear(year) {
    const startYearPickerItem = document.querySelector(`.year-picker-start-box .year-picker-item[data-year="${year}"]`);
    const endYearPickerItem = document.querySelector(`.year-picker-end-box .year-picker-item[data-year="${year}"]`);
    startYearPickerItem.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      endYearPickerItem.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function updateYearItemSelection(yearItems, selectedYear) {
    yearItems.forEach(item => {
      if (IsDisabled(item)) return;
      const itemYear = parseInt(item.innerText);
      const isSelected = itemYear === selectedYear;
      const state = isSelected ? "selected" : "normal";
      SetItemState(item, state);
      scrollToYear(selectedYear);
    });
  }

  function UpdateUISelected() {
    const startYear = Picker.Selected[0];
    const endYear = Picker.Selected[1] ? Picker.Selected[1] : Picker.Selected[0];

    const startSelected = document.querySelector(`#${Picker.ComponentId} .year-picker-start-box .year-picker-selected span`);
    const endSelected = document.querySelector(`#${Picker.ComponentId} .year-picker-end-box .year-picker-selected span`);

    startSelected.innerText = startYear;
    endSelected.innerText = endYear;

    const startYearItems = document.querySelectorAll(`#${Picker.ComponentId} .year-picker-start-box .year-picker-item`);
    const endYearItems = document.querySelectorAll(`#${Picker.ComponentId} .year-picker-end-box .year-picker-item`);

    updateYearItemSelection(startYearItems, startYear);
    updateYearItemSelection(endYearItems, endYear);
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

    function initYearBody(years) {
      let tpl = "";
      years.forEach(yearObj => {
        const { year, state } = yearObj;
        const itemClass = state === "disabled" ? "year-picker-item year-picker-item-disabled" : "year-picker-item";
        tpl += `<div class="${itemClass}" data-year="${year}">${year}</div>`;
      });
      return tpl;
    }

    function handleStartYearSelection(event) {
      const target = event.target;
      const container = target.closest(".year-picker-container");
      const yearItem = target.closest(".year-picker-item");
      if (!yearItem || !container || IsDisabled(yearItem)) return;
      const year = parseInt(target.innerText);
      const [startYear, endYear] = Picker.Selected;

      if (startYear && endYear) {
        if (year <= endYear) {
          Picker.Selected = [year, endYear];
        }
      } else if (startYear) {
        if (year >= startYear) {
          Picker.Selected = [startYear, year];
        } else {
          Picker.Selected = [year, startYear];
        }
      } else {
        Picker.Selected = [year, year];
      }

      UpdateUISelected();
      Feedback(event);
    }

    function handleEndYearSelection(event) {
      const target = event.target;
      const container = target.closest(".year-picker-container");
      const yearItem = target.closest(".year-picker-item");
      if (!yearItem || !container || IsDisabled(yearItem)) return;
      const year = parseInt(target.innerText);
      const [startYear, endYear] = Picker.Selected;

      if (startYear && endYear) {
        if (year >= startYear) {
          Picker.Selected = [startYear, year];
        }
      } else if (endYear) {
        if (year <= endYear) {
          Picker.Selected = [year, endYear];
        } else {
          Picker.Selected = [endYear, year];
        }
      } else {
        Picker.Selected = [year, year];
      }

      UpdateUISelected();
      Feedback(event);
    }

    const years = generateYearRange(startYear, endYear);
    const visiableClass = Picker.Visiable ? "" : "hide";
    const template = `
      <div id="${componentId}" class="year-picker-container ${visiableClass}">
        <div class="year-picker-box flex flex-row justify-between">
          <div class="year-picker-start-box">
            <div class="year-picker-tips">起始时间（年份）</div>
            <div class="year-picker-selected">
              <span></span>
            </div>
            <div class="year-picker-list">
              ${initYearBody(years)}
            </div>
          </div>
          <div class="year-picker-line"></div>
          <div class="year-picker-end-box">
            <div class="year-picker-tips">结束时间（年份）</div>
            <div class="year-picker-selected">
              <span></span>
            </div>
            <div class="year-picker-list">
              ${initYearBody(years)}
            </div>
          </div>
        </div>
      </div>
    `;
    document.querySelector(container).innerHTML = template;
    const startYearPicker = document.getElementById(componentId).querySelector(".year-picker-start-box");
    const endYearPicker = document.getElementById(componentId).querySelector(".year-picker-end-box");
    startYearPicker.addEventListener("click", handleStartYearSelection);
    endYearPicker.addEventListener("click", handleEndYearSelection);
  }

  /**
   * Show the region picker
   */
  function ShowPicker() {
    const container = document.getElementById(Picker.ComponentId);
    container.className = container.className.replace(/\s?hide/g, "");
    Picker.Visiable = true;
  }

  /**
   * Hide the region picker
   */
  function HidePicker() {
    const container = document.getElementById(Picker.ComponentId);
    container.className = container.className + " hide";
    Picker.Visiable = false;
    Feedback("submit");
  }

  function Bootstrap(container, options = {}) {
    const componentId = "year-picker-" + Math.random().toString(36).slice(-6);
    Picker.ComponentId = componentId;

    Picker.Options = options;
    const { preselected, range, visiable } = options;
    Picker.Visiable = !!visiable;

    // Only handle correct parameters
    if (preselected) {
      if (typeof preselected === "number") {
        Picker.Selected = [preselected];
      } else if (Array.isArray(preselected) && preselected.length === 2) {
        Picker.Selected = preselected.map(item => Number(item)).sort((a, b) => a - b);
      }
    }

    if (Picker.Selected.length === 0) {
      const currentYear = new Date().getFullYear();
      Picker.Selected = [currentYear - 10, currentYear];
    }

    // create base template
    const [begin, end] = range || [1970, new Date().getFullYear()];
    InitBaseContainer(container, componentId, begin, end);
    UpdateUISelected();

    Feedback("init");

    return Picker;
  }

  return Bootstrap(container, options);
};
