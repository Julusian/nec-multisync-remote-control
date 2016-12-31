import net from 'net-socket';
import { clearInterval, setInterval, setTimeout } from 'timers';

function FlattenParameters(key, tree, result) {
  if (tree.page || tree.code || tree.type) return result[key] = tree;

  if (key.length > 0) key += ".";

  for (var i in tree) {
    FlattenParameters(key + i, tree[i], result);
  }

  return result;
}

var adjust = {
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
    }
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

var audio = {
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
};

var picture = {
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

var schedule = {
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
};

var Parameters = {
  PICTURE: picture,
  ADJUST: adjust,
  AUDIO: audio,
  SCHEDULE: schedule

};

var ParametersFlat = FlattenParameters("", Parameters, {});



function ParameterFromKey(targetKey) {
  if (targetKey === undefined) return null;

  targetKey = targetKey.toUpperCase();

  for (var key in Object.keys(ParametersFlat)) {
    if (key != targetKey) continue;

    var node = ParametersFlat[key];
    return {
      key: key,
      value: node
    };
  }

  return null;
}

function padHex(hex) {
  return hex.length == 1 ? "0" + hex : hex;
}

function encodeHex(hex) {
  hex = padHex(hex);
  var encoded = "";

  for (var i = 0; i < hex.length; i++) {
    encoded += padHex(hex.charCodeAt(i).toString(16));
  }

  return encoded;
}

function decodeHex(encoded) {
  var hex = "";

  for (var i = 0; i < encoded.length; i += 2) {
    var b = encoded.substr(i, 2);
    var c = String.fromCharCode(parseInt(b, 16));

    hex += c;
  }

  return hex;
}

var MessageType = {
  COMMAND: "41",
  COMMAND_REPLY: "42",
  GET: "43",
  GET_REPLY: "44",
  SET: "45",
  SET_REPLY: "46"
};

var OperationType = {
  SET: "00",
  MOMENTARY: "01"
};

var PowerMode = {
  ON: '0001',
  STANDBY: '0002',
  SUSPEND: '0003',
  OFF: '0004'
};

// control codes
var TERMINATOR = "0D";
var SOH = "01";
var HEADER_RESERVED = "30";
var SENDER_ID = "30";
var STX = "02";
var ETX = "03";

function BuildGetParameter(id, command) {
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ 03
  var body = STX + encodeHex(command.page) + encodeHex(command.code) + ETX;
  var header = buildHeader(id, MessageType.GET, body.length / 2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

function BuildSetParameter(id, command, value) {
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ _V1_ _V2_ _V3_ _V4_ 03
  var body = STX + encodeHex(command.page) + encodeHex(command.code) + encodeHex(value) + ETX;
  var header = buildHeader(id, MessageType.SET, body.length / 2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

function BuildGetCommand(id, command) {
  var encodedCommand = void 0;
  switch (command) {
    case "SERIAL":
      encodedCommand = encodeHex("C216");
      break;
    case "MODEL":
      encodedCommand = encodeHex("C217");
      break;
    case "POWER":
      encodedCommand = encodeHex("01D6");
      break;
    default:
      return null;
  }

  var body = STX + encodedCommand + ETX;
  var header = buildHeader(id, MessageType.COMMAND, body.length / 2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

function BuildSetCommand(id, command, data) {
  var encodedCommand = void 0;
  switch (command) {
    case "POWER":
      encodedCommand = encodeHex("C203D6") + encodeHex(getPowerMode(data));
      break;
    // TODO - other types
    default:
      return null;
  }

  var body = STX + encodedCommand + ETX;
  var header = buildHeader(id, MessageType.COMMAND, body.length / 2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

function getPowerMode(key) {
  var powerMode = PowerMode[key];
  if (!powerMode) powerMode = PowerMode['OFF'];

  return powerMode;
}



function buildHeader(id, type, length) {
  // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
  var lengthString = encodeHex(length.toString(16));

  return HEADER_RESERVED + id + SENDER_ID + type + lengthString;
}

function CalculateCheckCode(message) {
  var code = parseInt(message[0] + message[1], 16);

  for (var i = 2; i < message.length; i += 2) {
    code ^= parseInt(message[i] + message[i + 1], 16);
  }

  return padHex(code.toString(16));
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var HEADER_LENGTH = 7 * 2;

var ParseMessage = function (message) {
  var parser = new Parser(message);

  if (!parser.checkChecksum()) return parser.result;

  if (!parser.parseHeader()) return parser.result;

  if (!parser.parseBody()) return parser.result;

  return parser.result;
};

var Parser = function () {
  function Parser(message) {
    classCallCheck(this, Parser);

    this.message = message;
    this.result = { err: null };
  }

  Parser.prototype.setError = function setError(err) {
    this.result.err = err;
    return false;
  };

  Parser.prototype.checkChecksum = function checkChecksum() {
    if (this.result.err != null) return false;

    var checksumByte = this.message.substr(this.message.length - 4, 2);
    var calculatedByte = CalculateCheckCode(this.message.substr(2, this.message.length - 6));
    if (checksumByte != calculatedByte) return this.setError("BAD_CHECKSUM");

    return true;
  };

  Parser.prototype.parseHeader = function parseHeader() {
    if (this.result.err != null) return false;

    // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
    var header = this.message.substr(0, HEADER_LENGTH);

    var rawTypeValue = header.substr(4 * 2, 2);
    for (var _iterator = Object.keys(MessageType), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var key = _ref;

      if (MessageType[key] == rawTypeValue) this.result.type = key;
    }

    if (this.result.type === undefined || this.result.type == null) return this.setError("BAD_TYPE");

    var rawLength = header.substr(5 * 2, 4);
    this.result.length = parseInt(decodeHex(rawLength), 16);

    return true;
  };

  Parser.prototype.parseBody = function parseBody() {
    if (this.result.err != null) return false;

    var body = this.message.substr(HEADER_LENGTH, this.message.length - 4 - HEADER_LENGTH);

    if (this.result.length != body.length / 2) return this.setError("BAD_LENGTH");

    switch (this.result.type) {
      case "GET_REPLY":
      case "SET_REPLY":
        this.parseParameterReply(body);
        break;
      case "COMMAND_REPLY":
        this.parseCommandReply(body);
        break;
      default:
        return this.setError("UNSUPPORTED_TYPE");
    }

    return true;
  };

  Parser.prototype.parseParameterReply = function parseParameterReply(body) {
    var rawResult = body.substr(1 * 2, 2 * 2); // chars 1+2
    var rawPage = body.substr(3 * 2, 2 * 2); // chars 3+4
    var rawCode = body.substr(5 * 2, 2 * 2); // chars 5+6
    var rawType = body.substr(7 * 2, 2 * 2); // chars 7+8
    var rawMaxValue = body.substr(9 * 2, 4 * 2); // chars 9-12
    var rawCurrentValue = body.substr(13 * 2, 4 * 2); // chars 13+14

    var commandResult = decodeHex(rawResult);
    var page = decodeHex(rawPage);
    var code = decodeHex(rawCode);
    var type = decodeHex(rawType);
    var maxValue = decodeHex(rawMaxValue);
    var currentValue = decodeHex(rawCurrentValue);

    //check result was good
    if (commandResult != "00") return this.setError("UNSUPPORTED_OPERATION");

    var commandType = Parameters.fromCodes(page, code);
    if (commandType === null) return this.setError("UNKNOWN_COMMAND");
    this.result.command = commandType.key;

    // parse the operation type
    for (var _iterator2 = Object.keys(OperationType), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var key = _ref2;

      if (OperationType[key] == type) this.result.operationType = key;
    }
    if (this.result.operationType === undefined || this.result.operationType == null) return this.setError("UNKNOWN_OPERATION_TYPE");

    this.result.maxValue = maxValue;
    this.result.value = currentValue;

    if (commandType.value.type == "range") this.result.value = parseInt(this.result.value, 16);

    return true;
  };

  Parser.prototype.parseCommandReply = function parseCommandReply(body) {
    var rawGroup = body.substr(1 * 2, 2 * 2); //chars 1+2
    var group = decodeHex(rawGroup);
    if (group == "02") body = body.substr(2 * 2); //trim first 2 chars

    rawGroup = body.substr(1 * 2, 2 * 2); //chars 1+2
    group = decodeHex(rawGroup);
    if (group == "01") return this.setState("UNSUPPORTED_OPERATION");
    if (group == "00") body = body.substr(2 * 2); //trim first 2 chars

    rawGroup = body.substr(1 * 2, 2 * 2); //chars 1+2
    group = decodeHex(rawGroup);

    var rawCommand = body.substr(3 * 2, 2 * 2); //chars 3+4
    var command = decodeHex(rawCommand);

    switch (group) {
      case "D6":
        //get power
        this.parseGetPower(body);
        break;
      case "A1":
        //self diag
        // TODO 
        // console.log("SELF DIAG");
        break;
      case "C0":
        switch (command) {
          // TODO 

          default:
            return this.setError("UNKNOWN_COMMAND");
        }
      case "C1":
        switch (command) {
          // TODO 

          default:
            return this.setError("UNKNOWN_COMMAND");
        }
      case "C2":
        switch (command) {
          case "03":
            this.parseSetPower(body);
            break;
          default:
            return this.setError("UNKNOWN_COMMAND");
        }
        break;
      case "C3":
        switch (command) {
          case "16":
            this.parseGetSerial(body);
            break;
          case "17":
            this.parseGetModel(body);
            break;

          default:
            return this.setError("UNKNOWN_COMMAND");
        }
        break;
      default:
        return this.setError("UNKNOWN_COMMAND");
    }
  };

  Parser.prototype.parseGetPower = function parseGetPower(body) {
    var rawState = body.substr(9 * 2, 4 * 2); //chars 15-18
    return this.parsePowerHelper(rawState);
  };

  Parser.prototype.parseSetPower = function parseSetPower(body) {
    var rawState = body.substr(7 * 2, 4 * 2); //chars 13-16
    return this.parsePowerHelper(rawState);
  };

  Parser.prototype.parsePowerHelper = function parsePowerHelper(rawState) {
    var state = decodeHex(rawState);

    this.result.command = "POWER";
    this.result.state = "UNKNOWN";
    for (var _iterator3 = Object.keys(PowerMode), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var key = _ref3;

      if (PowerMode[key] == state) {
        this.result.state = key;
        return;
      }
    }
  };

  Parser.prototype.parseGetSerial = function parseGetSerial(body) {
    var length = this.result.length * 2 - 6 * 2;
    var rawSerial = body.substr(5 * 2, length);
    var serial = decodeHex(rawSerial);

    this.result.command = "SERIAL";
    this.result.serial = decodeHex(serial).replace(/\0/g, '');
  };

  Parser.prototype.parseGetModel = function parseGetModel(body) {
    var length = this.result.length * 2 - 6 * 2;
    var rawModel = body.substr(5 * 2, length);
    var model = decodeHex(rawModel);

    this.result.command = "MODEL";
    this.result.model = decodeHex(model).replace(/\0/g, '');
  };

  return Parser;
}();

// convert from a friendly monitor id
function MonitorIdToHex(id) {
  if (id == "ALL") return "2A";

  if (id >= 1 && id <= 100) return (64 + id).toString(16);

  if (id >= 'A' && id <= 'J') return (id.charCodeAt(0) - 16).toString(16);

  return null;
}

// convert to a friendly monitor id

var TIMEOUT = 5000;

var MessageQueue = function () {
  function MessageQueue(client, debugLog) {
    classCallCheck(this, MessageQueue);

    this.client = client;
    this.debugLog = debugLog;
    this.queue = [];
  }

  MessageQueue.prototype.send = function send(message) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var promise = { resolve: resolve, reject: reject };

      _this.queue.push({
        message: message,
        promise: promise,
        sent: false,
        time: Date.now()
      });

      _this.debugLog("Queued message");
      _this.debugLog(_this.queue.length + " message in queue");

      _this._trySend();
    });
  };

  MessageQueue.prototype._trySend = function _trySend() {
    var _this2 = this;

    if (this.queue.length == 0) return false;

    var message = this.queue[0];
    if (message.sent) {
      this.debugLog("Message queued");
      return false;
    }

    message.sent = true;
    this.debugLog("Sending: " + message.message);
    this.client.write(message.message, "hex", function () {
      //erm.. anything needed here?
      _this2.debugLog("Message sent");
    });
    return true;
  };

  MessageQueue.prototype.received = function received() {
    if (this.queue.length == 0) return null;

    this.debugLog("Received message");
    var message = this.queue.shift();

    this._trySend();

    return message.promise;
  };

  MessageQueue.prototype.checkTimeout = function checkTimeout() {
    if (this.queue.length == 0) return false;

    var message = this.queue[0];
    if (message.sent) return false;

    if (message.time <= Date.now() - TIMEOUT) {
      this.queue.shift();

      this.debugLog("Timeout waiting for response");
      message.promise.reject('TIMEOUT');

      return this._trySend();
    }

    return true;
  };

  return MessageQueue;
}();

var DEFAULT_ID = "ALL";
var DEFAULT_PORT = 7142;
var TIMEOUT_INTERVAL = 100;
var RECEIVE_PART_TIMEOUT = 100;

function Create(ip, monitorId, debug) {
  if (monitorId === undefined) monitorId = DEFAULT_ID;

  monitorId = MonitorIdToHex(monitorId);
  if (monitorId == null) {
    // console.log("Bad monitor id: "+id)
    return 'BAD_MONITOR';
  }

  return new NecControl(ip, monitorId, debug);
}

var NecControl = function () {
  function NecControl(ip, monitorId, debug) {
    classCallCheck(this, NecControl);

    this.ip = ip;
    this.monitorId = monitorId;
    this.debug = debug;
    this.events = [];
    this.client = null;

    this.receiveTimeout = null;
    this.receiveBuffer = "";
  }

  NecControl.prototype._debugLog = function _debugLog(message) {
    if (this.debug) console.log(message);
  };

  NecControl.prototype.on = function on(event, callback) {
    this.events[event] = callback;

    if (this.client) this.client.on(event, callback);
  };

  NecControl.prototype.connect = function connect() {
    var _this = this;

    if (this.client != null) {
      this.client.end();
      this.client.unref();
      this.client.destroy();
      this.client = null;
    }

    if (this.timeoutInterval) clearInterval(this.timeoutInterval);

    this.client = net.connect(DEFAULT_PORT, this.ip);
    this.client.setEncoding('hex');

    this.messageQueue = new MessageQueue(this.client, function (msg) {
      return _this._debugLog(msg);
    });
    this.timeoutInterval = setInterval(function () {
      return _this.messageQueue.checkTimeout();
    }, TIMEOUT_INTERVAL);

    this.client.on('data', function (data) {
      return _this._receivedMessage(data);
    });
  };

  NecControl.prototype._receivedMessage = function _receivedMessage(message) {
    var _this2 = this;

    if (this.client == null) return;

    this._debugLog("Received message");

    if (this.receiveTimeout != null) {
      this.receiveBuffer += message;
      return;
    }

    this.receiveBuffer = message;

    this.receiveTimeout = setTimeout(function () {
      _this2._debugLog("Processing message: " + _this2.receiveBuffer);

      var parseResult = ParseMessage(_this2.receiveBuffer);
      _this2.receiveTimeout = null;
      _this2.receiveBuffer = "";

      var promise = _this2.messageQueue.received();
      if (promise === null || promise === undefined) return;

      if (parseResult.err) return promise.reject(parseResult.err);

      _this2._debugLog("Message parsed successfully");
      promise.resolve(parseResult);
    }, RECEIVE_PART_TIMEOUT);
  };

  NecControl.prototype.close = function close() {
    if (this.client == null) return;

    this._debugLog("Closing Connection");

    this.client.destroy();
  };

  NecControl.prototype.getParameter = function getParameter(key) {
    this._debugLog("Running get: " + key);

    var parameter = ParameterFromKey(key);
    if (parameter === null) {
      return Promise.reject('BAD_KEY');
    }

    var message = BuildGetParameter(this.monitorId, parameter);
    return this.messageQueue.send(message);
  };

  //TODO - wrap value up properly


  NecControl.prototype.setParameter = function setParameter(key, value) {
    if (this.client == null) return;

    this._debugLog("Running set: " + key);

    var parameter = ParameterFromKey(key);
    if (parameter === null) {
      return Promise.reject('BAD_KEY');
    }

    if (parameter.type == "range") value = encodeHex(value);

    var message = BuildSetParameter(this.monitorId, parameter, value);
    return this.messageQueue.send(message);
  };

  NecControl.prototype.getCommand = function getCommand(command) {
    if (this.client == null) return;

    this._debugLog("Running getCommand: " + command);

    var message = BuildGetCommand(this.monitorId, command);
    if (message === undefined || message === null) return Promise.reject('NO_MESSAGE');

    return this.messageQueue.send(message);
  };

  NecControl.prototype.setCommand = function setCommand(command, data) {
    if (this.client == null) return;

    this._debugLog("Running setCommand: " + command);

    var message = BuildSetCommand(this.monitorId, command, data);
    if (message === undefined || message === null) return Promise.reject('NO_MESSAGE');

    return this.messageQueue.send(message);
  };

  NecControl.prototype.sendRAW = function sendRAW(message) {
    if (this.client == null) return;

    if (message === undefined || message === null) return Promise.reject('NO_MESSAGE');

    this._debugLog("Sending raw");

    return this.messageQueue.send(message);
  };

  return NecControl;
}();

export { Create };
//# sourceMappingURL=index.es.js.map
