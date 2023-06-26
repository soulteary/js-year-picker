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

  function IsDisabled(item) {
    return item.classList.contains("year-picker-item-disabled");
  }

  function Feedback(event) {
    if (Picker.Options && Picker.Options.updater && typeof Picker.Options.updater === "function") {
      Picker.Selected.sort((a, b) => a - b);
      Picker.Options.updater(Picker.Selected, event, Picker);
    }
  }

  function updateYearItemSelection(itemList, itemPicked, yearSelected) {
    itemList.forEach((item) => {
      if (IsDisabled(item)) return;
      const itemYear = parseInt(item.innerText);
      const isSelected = itemYear === yearSelected;

      if (isSelected) {
        item.className = "year-picker-item year-picker-item-selected";
        setTimeout(() => {
          itemPicked.scrollIntoView({ block: "center" });
        }, 50);
      } else {
        item.className = "year-picker-item";
      }
    });
  }

  function UpdateYearSelectedUI() {
    const container = document.querySelector(`#${Picker.ComponentId}`);
    const [startYear, endYear] = Picker.Selected;

    const labelStart = container.querySelector(`.year-picker-start-box .year-picker-selected span`);
    const labelEnd = container.querySelector(`.year-picker-end-box .year-picker-selected span`);

    labelStart.innerText = startYear;
    labelEnd.innerText = endYear;

    const startYearItemList = container.querySelectorAll(`.year-picker-start-box .year-picker-item`);
    const endYearItemList = container.querySelectorAll(`.year-picker-end-box .year-picker-item`);

    const startYearItemPicked = container.querySelector(`.year-picker-start-box .year-picker-item[data-year="${startYear}"]`);
    const endYearItemPicked = container.querySelector(`.year-picker-end-box .year-picker-item[data-year="${endYear}"]`);

    updateYearItemSelection(startYearItemList, startYearItemPicked, startYear);
    updateYearItemSelection(endYearItemList, endYearItemPicked, endYear);
  }

  function InitBaseContainer(container, componentId, startYear, endYear) {
    function generateYearRange(start, end) {
      let years = [];
      for (let i = start; i <= end; i++) {
        years.push({ year: i, state: "normal" });
      }
      return years;
    }

    function initYearBody(years) {
      let tpl = "";
      years.forEach((yearObj) => {
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

      UpdateYearSelectedUI();
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

      UpdateYearSelectedUI();
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

    if (preselected) {
      if (typeof preselected === "number") {
        Picker.Selected = [preselected, preselected];
      } else if (Array.isArray(preselected) && preselected.length === 2) {
        Picker.Selected = preselected.map((item) => Number(item)).sort((a, b) => a - b);
      }
    }

    const [userBeginYear, userEndYear] = range || [1970, new Date().getFullYear()];
    let [startYear, endYear] = [userBeginYear, userEndYear];

    if (Picker.Selected.length === 0) {
      const currentYear = new Date().getFullYear();
      Picker.Selected = [currentYear - 10, currentYear];
    } else {
      // auto scale range to include selected year
      if (startYear > Picker.Selected[0]) startYear = Picker.Selected[0];
      if (endYear < Picker.Selected[1]) endYear = Picker.Selected[1];
    }

    InitBaseContainer(container, componentId, startYear, endYear);

    UpdateYearSelectedUI();

    Feedback("init");

    return Picker;
  }

  return Bootstrap(container, options);
};
