var _ = require('underscore');
var linq = require('linq');

module.exports.POWER_MODES = {
  'ON': '0001',
  'STANDBY': '0002',
  'SUSPEND': '0003',
  'OFF': '0004'
};

module.exports.COMMANDS = {
// PICTURE
  PICTURE: {
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
  },

// ADJUST
  ADJUST: {
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
  },
  
  AUDIO: {
    BALANCE: {
      page: "00",
      code: "93",
      type: "range",
      min: 0,
      max: 100
    },
    TREBLE: {
      page: "00",
      code: "8F",
      type: "range",
      min: 0,
      max: 100
    },
    BASS: {
      page: "00",
      code: "91",
      type: "range",
      min: 0,
      max: 100
    },

    SURROUND: {
      page: "02",
      code: "34",
      type: "single",
      options: {
        1: "OFF",
        2: "LOW",
        3: "HIGH"
      }
    },
    AUDIO_INPUT: {
      page: "02",
      code: "2E",
      type: "single",
      options: {
        1: "AUDIO1",
        2: "AUDIO2",
        3: "AUDIO3",
        4: "HDMI",
        6: "OPTION",
        7: "DISPLAYPORT"
      }
    },

    AUDIO_RESET: {
      page: "02",
      code: "CB",
      type: "momentary",
      value: 4
    }
  },

  SCHEDULE: {
    OFF: {
      page: "02",
      code: "2B",
      type: "single",
      options: []
    },
    ENABLE: {
      page: "02",
      code: "E5",
      type: "single",
      options: []
    },
    DISABLE: {
      page: "02",
      code: "E6",
      type: "single",
      options: []
    },

    SCHEDULE_RESET: {
      page: "02",
      code: "CB",
      type: "momentary",
      value: 5
    }
  },






};

function fromKeyHelper(tree, keyParts){
  var key = keyParts.shift();
  if(!key)
    return null;

  var node = tree[key];
  if(!node)
    return null;

  if(keyParts.length == 0)
    return node;

  return fromKeyHelper(node, keyParts);
}

module.exports.fromKey = function(key){
  key = key.toUpperCase();

  var keyParts = key.split(".");

  var command = fromKeyHelper(module.exports.COMMANDS, keyParts);
  if(command === undefined || command === null)
    return null;

  if(command.page === undefined || command.code === undefined){
    console.log("Command '" + key + "' is missing values")
    return null;
  }

  return command;
};

function fromCodesHelper(tree, key, page, code){
  if(tree.page || tree.code || tree.type){
    if(tree.page == page && tree.code == code)
      return { 
        key: key,
        value: tree
      };

    return null;
  }

  if(key.length > 0)
    key += ".";

  for (var i in tree){
    var node = fromCodesHelper(tree[i], key+i, page, code);
    if(node != null)
      return node;
  }

  return null;
}

module.exports.fromCodes = function(page, code){
  if(page === undefined || code === undefined)
    return null;

  return fromCodesHelper(module.exports.COMMANDS, "", page, code);
};
