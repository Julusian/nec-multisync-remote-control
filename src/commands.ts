import { literal } from './util'

export interface CommandSpecBase {
  page: number
  code: number
  type: CommandSpecType
  readonly?: boolean
}

export type SomeCommandSpec = RangeCommandSpec | OptionCommandSpec | MomentaryCommandSpec

export enum CommandSpecType {
  Range = 'range',
  Option = 'option',
  Momentary = 'momentary'
}

export interface RangeCommandSpec extends CommandSpecBase {
  type: CommandSpecType.Range
  min: number
  max: number
}

export interface MomentaryCommandSpec extends CommandSpecBase {
  type: CommandSpecType.Momentary
  value: number
}

export interface OptionCommandSpec extends CommandSpecBase {
  type: CommandSpecType.Option
  options: { [key: string]: number | undefined }
}

export interface CommandSpecs {
  [key: string]: SomeCommandSpec | CommandSpecs | undefined
}

export const COMMANDS = literal<CommandSpecs>({
  // PICTURE
  PICTURE: {
    BRIGHTNESS: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x10,
      type: CommandSpecType.Range,
      min: 0,
      max: 100
    }),
    CONTRAST: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x12,
      type: CommandSpecType.Range,
      min: 0,
      max: 100
    }),
    SHARPNESS: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x8c,
      type: CommandSpecType.Range,
      min: 0,
      max: 82
    }),
    BLACK_LEVEL: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x92,
      type: CommandSpecType.Range,
      min: 0,
      max: 63
    }),
    TINT: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x90,
      type: CommandSpecType.Range,
      min: 0,
      max: 63
    }),
    COLOR: literal<RangeCommandSpec>({
      page: 0x02,
      code: 0x1f,
      type: CommandSpecType.Range,
      min: 0,
      max: 63
    }),
    COLOR_TEMPERATURE: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x54,
      type: CommandSpecType.Range,
      min: 0,
      max: 74
    }),

    COLOR_CONTROL: {
      RED: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0x9b,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      YELLOW: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0x9c,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      GREEN: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0x9d,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      CYAN: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0x9e,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      BLUE: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0x9f,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      MAGENTA: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0xa0,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      SATURATION: literal<RangeCommandSpec>({
        page: 0x00,
        code: 0x8a,
        type: CommandSpecType.Range,
        min: 0,
        max: 10
      })
    },

    GAMMA_SELECTION: literal<OptionCommandSpec>({
      page: 0x02,
      code: 0x68,
      type: CommandSpecType.Option,
      options: {
        NATIVE: 1,
        TWO_POINT_TWO: 4,
        TWO_POINT_FOUR: 8,
        S: 7,
        DICOM: 5,
        PROGRAMMABLE: 6
      }
    }),

    MOVIE_SETTINGS: {
      ADAPTIVE_CONTRAST: literal<OptionCommandSpec>({
        page: 0x02,
        code: 0x8d,
        type: CommandSpecType.Option,
        options: {
          None: 0,
          Off: 1,
          Low: 2,
          Middle: 3,
          High: 4
        }
      }),
      NOISE_REDUCTION: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0x20,
        type: CommandSpecType.Range,
        min: 0,
        max: 16
      }),
      FILM_MODE: literal<OptionCommandSpec>({
        page: 0x02,
        code: 0x23,
        type: CommandSpecType.Option,
        options: {
          OFF: 1,
          AUTO: 2
        }
      })
    },

    PICTURE_MODE: literal<OptionCommandSpec>({
      page: 0x02,
      code: 0x1a,
      type: CommandSpecType.Option,
      options: {
        SRGB: 1,
        HIBRIGHT: 3,
        STANDARD: 4,
        CINEMA: 5,
        ISF_DAY: 6,
        ISF_NIGHT: 7,
        AMBIENT1: 11,
        AMBIENT2: 12
      }
    }),

    AMBIENT: {
      AMBIENT_BRIGHTNESS_LOW: literal<RangeCommandSpec>({
        page: 0x10,
        code: 0x33,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      AMBIENT_BRIGHTNESS_HIGH: literal<RangeCommandSpec>({
        page: 0x10,
        code: 0x34,
        type: CommandSpecType.Range,
        min: 0,
        max: 100
      }),
      CURRENT_ILLUMINANCE: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0xb4,
        readonly: true,
        type: CommandSpecType.Range,
        min: 0,
        max: 255
      }),
      BRIGHT_SENSOR: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0xb5,
        readonly: true,
        type: CommandSpecType.Range,
        min: 0,
        max: 255
      })
    },

    PICTURE_RESET: literal<MomentaryCommandSpec>({
      page: 0x02,
      code: 0xcb,
      type: CommandSpecType.Momentary,
      value: 2
    })
  },

  // ADJUST
  ADJUST: {
    AUTO_SETUP: literal<MomentaryCommandSpec>({
      page: 0x00,
      code: 0x1e,
      type: CommandSpecType.Momentary,
      value: 1
    }),
    H_POSITION: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x20,
      type: CommandSpecType.Range,
      min: 0,
      max: 255
    }),
    V_POSITION: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x30,
      type: CommandSpecType.Range,
      min: 0,
      max: 255
    }),
    CLOCK: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x0e,
      type: CommandSpecType.Range,
      min: 0,
      max: 255
    }),
    CLOCK_PHASE: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x3e,
      type: CommandSpecType.Range,
      min: 0,
      max: 255
    }),
    H_RESOLUTION: literal<RangeCommandSpec>({
      page: 0x02,
      code: 0x50,
      type: CommandSpecType.Range,
      min: 0,
      max: 255
    }),
    V_RESOLUTION: literal<RangeCommandSpec>({
      page: 0x02,
      code: 0x51,
      type: CommandSpecType.Range,
      min: 0,
      max: 255
    }),
    INPUT_RESOLUTION: literal<OptionCommandSpec>({
      page: 0x02,
      code: 0xda,
      type: CommandSpecType.Option,
      options: {
        AUTO: 1,
        '1024x768': 2,
        '1280x768': 3,
        '1360x768': 4,
        '1366x768': 5,
        '1400x1050': 6,
        '1680x1050': 7
      }
    }),
    ZOOM_MODE: {
      BASE_ZOOM: literal<OptionCommandSpec>({
        page: 0x02,
        code: 0xce,
        type: CommandSpecType.Option,
        options: {
          '16_9': 3,
          '14_9': 4,
          DYNAMIC: 5,
          OFF: 1,
          CUSTOM: 2
        }
      }),
      ZOOM: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0x6f,
        type: CommandSpecType.Range,
        min: 1,
        max: 201
      }),
      H_EXPANSION: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0x6c,
        type: CommandSpecType.Range,
        min: 1,
        max: 201
      }),
      V_EXPANSION: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0x6d,
        type: CommandSpecType.Range,
        min: 1,
        max: 201
      }),
      H_POSITION: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0xcc,
        type: CommandSpecType.Range,
        min: 0,
        max: 255
      }),
      V_POSITION: literal<RangeCommandSpec>({
        page: 0x02,
        code: 0xcd,
        type: CommandSpecType.Range,
        min: 0,
        max: 255
      })
    },
    ASPECT: literal<OptionCommandSpec>({
      page: 0x02,
      code: 0x70,
      type: CommandSpecType.Option,
      options: {
        NORMAL: 1,
        FULL: 2,
        WIDE: 3,
        ZOOM: 4,
        TRIM: 5
      }
    }),
    ADJUST_RESET: literal<MomentaryCommandSpec>({
      page: 0x02,
      code: 0xcb,
      type: CommandSpecType.Momentary,
      value: 3
    })
  },

  AUDIO: {
    BALANCE: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x93,
      type: CommandSpecType.Range,
      min: 0,
      max: 100
    }),
    TREBLE: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x8f,
      type: CommandSpecType.Range,
      min: 0,
      max: 100
    }),
    BASS: literal<RangeCommandSpec>({
      page: 0x00,
      code: 0x91,
      type: CommandSpecType.Range,
      min: 0,
      max: 100
    }),

    SURROUND: literal<OptionCommandSpec>({
      page: 0x02,
      code: 0x34,
      type: CommandSpecType.Option,
      options: {
        OFF: 1,
        LOW: 2,
        HIGH: 3
      }
    }),
    AUDIO_INPUT: literal<OptionCommandSpec>({
      page: 0x02,
      code: 0x2e,
      type: CommandSpecType.Option,
      options: {
        AUDIO1: 1,
        AUDIO2: 2,
        AUDIO3: 3,
        HDMI: 4,
        OPTION: 6,
        DISPLAYPORT: 7
      }
    }),

    AUDIO_RESET: literal<MomentaryCommandSpec>({
      page: 0x02,
      code: 0xcb,
      type: CommandSpecType.Momentary,
      value: 4
    })
  }

  //   SCHEDULE: {
  //     OFF: {
  //       page: '02',
  //       code: '2B',
  //       type: 'single',
  //       options: []
  //     },
  //     ENABLE: {
  //       page: '02',
  //       code: 'E5',
  //       type: 'single',
  //       options: []
  //     },
  //     DISABLE: {
  //       page: '02',
  //       code: 'E6',
  //       type: 'single',
  //       options: []
  //     },

  //     SCHEDULE_RESET: {
  //       page: '02',
  //       code: 'CB',
  //       type: CommandSpecType.Momentary,
  //       value: 5
  //     }
  //   }
})
