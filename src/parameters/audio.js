export default {
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