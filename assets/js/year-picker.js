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

  let InitalScrollPatchFn = {};

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

  function UpdateYearSelectedUI(byUser, isInital) {
    const container = document.querySelector(`#${Picker.ComponentId}`);
    const [startYear, endYear] = Picker.Selected;

    const labelStart = container.querySelector(`.year-picker-start-box .year-picker-selected span`);
    const labelEnd = container.querySelector(`.year-picker-end-box .year-picker-selected span`);

    labelStart.innerText = startYear;
    labelEnd.innerText = endYear;

    const startYearItemList = container.querySelectorAll(`.year-picker-start-box .year-picker-item`);
    const endYearItemList = container.querySelectorAll(`.year-picker-end-box .year-picker-item`);

    updateYearItemSelection(startYearItemList, true, byUser, isInital);
    updateYearItemSelection(endYearItemList, false, byUser, isInital);
  }

  const STATE_CLICKABLE = "normal";
  const STATE_DISABLED = "disabled";
  const STATE_SELECTED = "selected";
  const STATE_BOUNDARY = "boundary";
  function SetYearItemState(item, state) {
    switch (state) {
      case STATE_CLICKABLE:
        item.className = "year-picker-item";
        break;
      case STATE_DISABLED:
        item.className = "year-picker-item year-picker-item-disabled";
        break;
      case STATE_SELECTED:
        item.className = "year-picker-item year-picker-item-selected";
        break;
      case STATE_BOUNDARY:
        item.className = "year-picker-item year-picker-item-boundary";
        break;
    }
  }

  function CustomScrollTo(container, targetPosition, duration) {
    const startPosition = container.scrollTop;
    const distance = targetPosition - startPosition;

    let startTime;
    function scrollStep(timestamp) {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      container.scrollTop = startPosition + distance * easeProgress;

      if (elapsed < duration) {
        requestAnimationFrame(scrollStep);
      }
    }

    requestAnimationFrame(scrollStep);
  }

  function ScrollItemIntoView(item, byUser, isInital) {
    const isFirst = item.getAttribute("data-is-first") === "1";
    const isLast = item.getAttribute("data-is-last") === "1";
    const idx = item.getAttribute("data-idx");
    const listContainer = item.closest(".year-picker-list");
    const isStartPicker = listContainer.closest("year-picker-start-box") ? "start" : "end";

    let height = 0;
    let heightFix = 0;
    let position = 0;

    if (isFirst) {
      position = 0;
    } else {
      try {
        height = window.getComputedStyle(item).height.replace(/\D/g, "").trim();
        height = parseInt(height);
      } catch (e) {
        height = 36;
      }

      if (isLast) {
        position = height * idx;
      } else {
        try {
          listCss = window.getComputedStyle(listContainer);
          heightFix = listCss.height.replace(/\D/g, "").trim();
          listMarginTop = listCss["marginTop"].replace(/\D/g, "").trim();
          listPaddingTop = listCss["paddingTop"].replace(/\D/g, "").trim();
          heightFix = parseInt(heightFix) - parseInt(listMarginTop) - parseInt(listPaddingTop);
        } catch (e) {
          heightFix = 156;
        }
        position = height * idx - heightFix / 2;
      }
    }

    if (isInital) {
      InitalScrollPatchFn[isStartPicker + ":" + idx] = (function (listContainer, position) {
        return () => {
          listContainer.scrollTop = position;
        };
      })(listContainer, position);
    }

    const targetPosition = Math.max(0, position - listContainer.clientHeight / 8);

    setTimeout(() => {
      if (byUser) {
        // item.scrollIntoView({ behavior: "smooth", block: "center" });
        CustomScrollTo(listContainer, targetPosition, 500);
      } else {
        listContainer.scrollTop = position;
      }
    }, 30);
  }

  const RENDER_MODE_SAME = "same";
  const RENDER_MODE_START = "start";
  const RENDER_MODE_END = "end";
  function GetRenderMode(isStartPicker) {
    const [startYear, endYear] = Picker.Selected;
    if (isStartPicker) {
      if (startYear === endYear) {
        return RENDER_MODE_SAME;
      }
      return RENDER_MODE_START;
    }
    if (startYear === endYear) {
      return RENDER_MODE_SAME;
    }
    return RENDER_MODE_END;
  }

  function updateYearItemSelection(itemList, isStartPicker, byUser, isInital) {
    const [startYear, endYear] = Picker.Selected;
    const renderMode = GetRenderMode(isStartPicker);

    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const thisYear = parseInt(item.getAttribute("data-year"));

      switch (renderMode) {
        case RENDER_MODE_SAME:
          if (isStartPicker) {
            if (thisYear < startYear) {
              SetYearItemState(item, STATE_CLICKABLE);
            } else if (thisYear === startYear) {
              SetYearItemState(item, STATE_BOUNDARY);
              ScrollItemIntoView(item, byUser, isInital);
            } else {
              SetYearItemState(item, STATE_DISABLED);
            }
          } else {
            if (thisYear < startYear) {
              SetYearItemState(item, STATE_DISABLED);
            } else if (thisYear === endYear) {
              SetYearItemState(item, STATE_BOUNDARY);
              ScrollItemIntoView(item, byUser, isInital);
            } else {
              SetYearItemState(item, STATE_CLICKABLE);
            }
          }
          break;
        case RENDER_MODE_START:
          if (thisYear < startYear) {
            SetYearItemState(item, STATE_CLICKABLE);
          } else if (thisYear > endYear) {
            SetYearItemState(item, STATE_DISABLED);
          } else {
            if (thisYear === startYear) {
              SetYearItemState(item, STATE_BOUNDARY);
              ScrollItemIntoView(item, byUser, isInital);
            } else {
              SetYearItemState(item, STATE_SELECTED);
            }
          }
          break;
        case RENDER_MODE_END:
          if (thisYear <= startYear) {
            SetYearItemState(item, STATE_DISABLED);
          } else if (thisYear > endYear) {
            SetYearItemState(item, STATE_CLICKABLE);
          } else {
            if (thisYear === endYear) {
              SetYearItemState(item, STATE_BOUNDARY);
              ScrollItemIntoView(item, byUser, isInital);
            } else {
              SetYearItemState(item, STATE_SELECTED);
            }
          }
          break;
      }
    }
  }

  function InitBaseContainer(container, componentId, startYear, endYear) {
    function generateYearRange(start, end) {
      let years = [];
      for (let i = start; i <= end; i++) {
        years.push({ year: i, state: "normal" });
      }
      return years;
    }

    // TODO  public ?
    function initYearBody(years) {
      let tpl = "";
      years.forEach((yearObj, idx) => {
        const { year, state } = yearObj;
        const isFirst = idx === 0 ? "1" : "0";
        const isLast = idx === years.length - 1 ? "1" : "0";

        const itemClass = state === "disabled" ? "year-picker-item year-picker-item-disabled" : "year-picker-item";
        tpl += `<div class="${itemClass}" data-year="${year}" data-idx="${idx}" data-is-first="${isFirst}" data-is-last="${isLast}" >${year}</div>`;
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

      UpdateYearSelectedUI(true);
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

      UpdateYearSelectedUI(true);
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

    Object.keys(InitalScrollPatchFn).forEach((key) => {
      if (typeof InitalScrollPatchFn[key] === "function") {
        InitalScrollPatchFn[key]();
      }
    });
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

    UpdateYearSelectedUI(false, true);

    Feedback("init");

    return Picker;
  }

  return Bootstrap(container, options);
};
