export default {
  BRIGHTNESS: {
    page: "00",
    code: "10",
    type: "range",
    min: 0,
    max: 100
  },
  CONTRAST: {
    page: "00",
    code: "12",
    type: "range",
    min: 0,
    max: 100
  },
  SHARPNESS: {
    page: "00",
    code: "8C",
    type: "range",
    min: 0,
    max: 82
  },
  BLACK_LEVEL: {
    page: "00",
    code: "92",
    type: "range",
    min: 0,
    max: 63
  },
  TINT: {
    page: "00",
    code: "90",
    type: "range",
    min: 0,
    max: 63
  },
  COLOR: {
    page: "02",
    code: "1F",
    type: "range",
    min: 0,
    max: 63
  },
  COLOR_TEMPERATURE: {
    page: "00",
    code: "54",
    type: "range",
    min: 0,
    max: 74
  },

  COLOR_CONTROL: {
      RED: {
      page: "00",
      code: "9B",
      type: "range",
      min: 0,
      max: 100
    },
    YELLOW: {
      page: "00",
      code: "9C",
      type: "range",
      min: 0,
      max: 100
    },
    GREEN: {
      page: "00",
      code: "9D",
      type: "range",
      min: 0,
      max: 100
    },
    CYAN: {
      page: "00",
      code: "9E",
      type: "range",
      min: 0,
      max: 100
    },
    BLUE: {
      page: "00",
      code: "9F",
      type: "range",
      min: 0,
      max: 100
    },
    MAGENTA: {
      page: "00",
      code: "A0",
      type: "range",
      min: 0,
      max: 100
    },
    SATURATION: {
      page: "00",
      code: "8A",
      type: "range",
      min: 0,
      max: 10
    }
  },

  GAMMA_SELECTION: {
    page: "02",
    code: "68",
    type: "single",
    options: {
      1: "NATIVE",
      4: "TWO_POINT_TWO",
      8: "TWO_POINT_FOUR",
      7: "S",
      5: "DICOM",
      6: "PROGRAMMABLE"
    }
  },

  MOVIE_SETTINGS: {
    ADAPTIVE_CONTRAST: {
      page: "02",
      code: "8D",
      type: "single",
      options: {
        0: "NONE",
        1: "OFF",
        2: "LOW",
        3: "MIDDLE",
        4: "HIGH"
      }
    },
    NOISE_REDUCTION: {
      page: "02",
      code: "20",
      type: "single",
      options: []
    },
    FILM_MODE: {
      page: "02",
      code: "23",
      type: "toggle"
    }
  },

  PICTURE_MODE: {
    page: "02",
    code: "1A",
    type: "single",
    options: {
      1: "SRGB",
      3: "HIBRIGHT",
      4: "STANDARD",
      5: "CINEMA",
      6: "ISF_DAY",
      7: "ISF_NIGHT",
      11: "AMBIENT1",
      12: "AMBIENT2"
    }
  },

  AMBIENT: {
    AMBIENT_BRIGHTNESS_LOW: {
      page: "10",
      code: "33",
      type: "range",
      min: 0,
      max: 100
    },
    AMBIENT_BRIGHTNESS_HIGH: {
      page: "10",
      code: "34",
      type: "range",
      min: 0,
      max: 100
    },
    CURRENT_ILLUMINANCE: {
      page: "02",
      code: "B4",
      readonly: true,
      type: "range",
      min: 0,
      max: 255
    },
    BRIGHT_SENSOR: {
      page: "02",
      code: "B5",
      readonly: true,
      type: "range",
      min: 0,
      max: 255
    }
  },

  PICTURE_RESET: {
    page: "02",
    code: "CB",
    type: "momentary",
    value: 2
  }
};