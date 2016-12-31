export default {
  AUTO_SETUP: {
    page: "00",
    code: "1E",
    type: "momentary",
    value: 1
  },

  H_POSITION: {
    page: "00",
    code: "20",
    type: "range",
    min: 0,
    max: 255
  }, 
  V_POSITION: {
    page: "00",
    code: "30",
    type: "range",
    min: 0,
    max: 255
  }, 
  CLOCK: {
    page: "00",
    code: "0E",
    type: "range",
    min: 0,
    max: 255
  }, 
  CLOCK_PHASE: {
    page: "00",
    code: "3E",
    type: "range",
    min: 0,
    max: 255
  },
  H_RESOLUTION: {
    page: "02",
    code: "50",
    type: "range",
    min: 0,
    max: 255
  },
  V_RESOLUTION: {
    page: "02",
    code: "51",
    type: "range",
    min: 0,
    max: 255
  },
  INPUT_RESOLUTION: {
    page: "02",
    code: "DA",
    type: "single",
    options: {
      1: "AUTO",
      2: "1024x768",
      3: "1280z768",
      4: "1360x768",
      5: "1366x768",
      6: "1400x1050",
      7: "1680x1050"
    }
  },

  ZOOM_MODE: {
    BASE_ZOOM: {
      page: "02",
      code: "CE",
      type: "single",
      options: {
        3: "16_9",
        4: "14_9",
        5: "DYNAMIC",
        1: "OFF",
        2: "CUSTOM"
      }
    },
    ZOOM: {
      page: "02",
      code: "6F",
      type: "range",
      min: 1,
      max: 201
    },
    H_EXPANSION: {
      page: "02",
      code: "6C",
      type: "range",
      min: 1,
      max: 201
    },
    V_EXPANSION: {
      page: "02",
      code: "6D",
      type: "range",
      min: 1,
      max: 201
    },
    H_POSITION: {
      page: "02",
      code: "CC",
      type: "range",
      min: 0,
      max: 255
    },
    V_POSITION: {
      page: "02",
      code: "CD",
      type: "range",
      min: 0,
      max: 255
    },
  },

  ASPECT: {
    page: "02",
    code: "70",
    type: "single",
    options: {
      1: "NORMAL",
      2: "FULL",
      3: "WIDE",
      4: "ZOOM",
      5: "TRIM"
    }
  },

  ADJUST_RESET: {
    page: "02",
    code: "CB",
    type: "momentary",
    value: 3
  }
};