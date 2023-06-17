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

  function initBaseContainer(container, componentId) {
    const template = `
        <div id="${componentId}" class="year-picker-container">
        <table>
            <thead>
                <tr>
                    <th colspan="2">70s</th>
                    <th colspan="2">80s</th>
                    <th colspan="2">90s</th>
                    <th colspan="2">00s</th>
                    <th colspan="2">10s</th>
                    <th colspan="2">20s</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="year-picker-item">1970</div>
                        <div class="year-picker-item">1971</div>
                        <div class="year-picker-item year-picker-item-active">1972</div>
                        <div class="year-picker-item year-picker-item-active">1973</div>
                        <div class="year-picker-item year-picker-item-active">1974</div>
                    </td>
                    <td>
                        <div class="year-picker-item year-picker-item-active">1975</div>
                        <div class="year-picker-item year-picker-item-active">1976</div>
                        <div class="year-picker-item year-picker-item-active">1977</div>
                        <div class="year-picker-item year-picker-item-active">1978</div>
                        <div class="year-picker-item">1979</div>
                    </td>
                    <td>
                        <div class="year-picker-item">1980</div>
                        <div class="year-picker-item">1981</div>
                        <div class="year-picker-item">1982</div>
                        <div class="year-picker-item">1983</div>
                        <div class="year-picker-item">1984</div>
                    </td>
                    <td>
                        <div class="year-picker-item">1985</div>
                        <div class="year-picker-item">1986</div>
                        <div class="year-picker-item">1987</div>
                        <div class="year-picker-item">1988</div>
                        <div class="year-picker-item">1989</div>
                    </td>
                    <td>
                        <div class="year-picker-item">1990</div>
                        <div class="year-picker-item year-picker-item-active">1991</div>
                        <div class="year-picker-item">1992</div>
                        <div class="year-picker-item year-picker-item-active">1993</div>
                        <div class="year-picker-item">1994</div>
                    </td>
                    <td>
                        <div class="year-picker-item">1995</div>
                        <div class="year-picker-item">1996</div>
                        <div class="year-picker-item">1997</div>
                        <div class="year-picker-item">1998</div>
                        <div class="year-picker-item">1999</div>
                    </td>
                    <td>
                        <div class="year-picker-item">2000</div>
                        <div class="year-picker-item">2001</div>
                        <div class="year-picker-item">2002</div>
                        <div class="year-picker-item">2003</div>
                        <div class="year-picker-item year-picker-item-active">2004</div>
                    </td>
                    <td>
                        <div class="year-picker-item year-picker-item-active">2005</div>
                        <div class="year-picker-item year-picker-item-active">2006</div>
                        <div class="year-picker-item">2007</div>
                        <div class="year-picker-item">2008</div>
                        <div class="year-picker-item">2009</div>
                    </td>
                    <td>
                        <div class="year-picker-item">2010</div>
                        <div class="year-picker-item">2011</div>
                        <div class="year-picker-item">2012</div>
                        <div class="year-picker-item">2013</div>
                        <div class="year-picker-item">2014</div>
                    </td>
                    <td>
                        <div class="year-picker-item">2015</div>
                        <div class="year-picker-item">2016</div>
                        <div class="year-picker-item">2017</div>
                        <div class="year-picker-item">2018</div>
                        <div class="year-picker-item">2019</div>
                    </td>
                    <td>
                        <div class="year-picker-item">2020</div>
                        <div class="year-picker-item">2021</div>
                        <div class="year-picker-item">2022</div>
                        <div class="year-picker-item">2023</div>
                        <div class="year-picker-item year-picker-item-disabled">2024</div>
                    </td>
                    <td>
                    </td>
                </tr>



            </tbody>
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

  function bootstrap(container, options) {
    const componentId = "year-picker-" + Math.random().toString(36).slice(-6);
    Picker.ComponentId = componentId;
    Picker.options = options;
    Picker.Selected = [];
    initBaseContainer(container, componentId);

    return Picker;
  }

  return bootstrap;
})();
