import { detectors } from './detectors'
import { sources } from './sources'

export type BotDetectionResult =
  | {
      bot: true
      botKind: BotKind
    }
  | {
      bot: false
    }

/**
 * Enum for the source state.
 *
 * @readonly
 * @enum {number}
 */
export const enum State {
  Success = 0,
  Undefined = -1,
  NotFunction = -2,
  UnexpectedBehaviour = -3,
  Null = -4,
}

/**
 * Enum for types of bots.
 * Specific types of bots come first, followed by automation technologies.
 *
 * @readonly
 * @enum {string}
 */
export const BotKind = {
  // Object is used instead of Typescript enum to avoid emitting IIFE which might be affected by further tree-shaking.
  // See example of compiled enums https://stackoverflow.com/q/47363996)
  Awesomium: 'awesomium',
  Cef: 'cef',
  CefSharp: 'cefsharp',
  CoachJS: 'coachjs',
  Electron: 'electron',
  FMiner: 'fminer',
  Geb: 'geb',
  NightmareJS: 'nightmarejs',
  Phantomas: 'phantomas',
  PhantomJS: 'phantomjs',
  Rhino: 'rhino',
  Selenium: 'selenium',
  Sequentum: 'sequentum',
  SlimerJS: 'slimerjs',
  WebDriverIO: 'webdriverio',

  WebDriver: 'webdriver',
  HeadlessChrome: 'headless_chrome',
  Unknown: 'unknown',
} as const

export type BotKind = typeof BotKind[keyof typeof BotKind]

export type DetectorResponse = boolean | BotKind | undefined

/**
 * Represents a component with state and value.
 */
export type Component<T> =
  | {
      state: State.Success
      value: T
    }
  | {
      state: Exclude<State, State.Success>
      error: string
    }

/**
 * Dictionary of default sources and their respective return types.
 */
export type DefaultSourceDict = typeof sources

/**
 * Dictionary of default detectors and their respective types.
 */
export type DefaultDetectorDict = typeof detectors

/**
 * Represents a single source response type.
 */
export type SourceResponse<T> = T extends (...args: any[]) => any ? Awaited<ReturnType<T>> : T

export type AbstractDetector<T> = (components: T) => DetectorResponse

export type AbstractSourceDict = Record<string, SourceResponse<any>>

export type AbstractDetectorDict<T> = Record<string, AbstractDetector<T>>

export type AbstractComponentDict = Record<string, Component<any>>

export type AbstractDetectionsDict = Record<string, BotDetectionResult>

/**
 * Represents a dictionary of detectors detection.
 */
export type DetectionDict<T extends AbstractDetectorDict<any> = DefaultDetectorDict> = Record<
  keyof T,
  BotDetectionResult
>

/**
 * Dictionary of components.
 */
export type ComponentDict<T extends AbstractSourceDict = DefaultSourceDict> = {
  [K in keyof T]: Component<SourceResponse<T[K]>>
}

/**
 * Interface for classes that represent a bot detector.
 *
 * @interface BotDetectorInterface
 */
export interface BotDetectorInterface {
  /**
   * Performs bot detection. Should be called after `collect()`.
   */
  detect(): BotDetectionResult
  /**
   * Collects data from sources. You can retrieve the data using `getComponents()`.
   */
  collect(): Promise<AbstractComponentDict>
  /**
   * Returns the collected data. Should be called after `collect()`.
   */
  getComponents(): AbstractComponentDict | undefined
  /**
   * Returns detection result for each detector. Should be called after `detect()`.
   */
  getDetections(): AbstractDetectionsDict | undefined
}

/**
 * Bot detection error.
 */
export class BotdError extends Error {
  state: Exclude<State, State.Success>

  /**
   * Creates a new BotdError.
   *
   * @class
   */
  constructor(state: Exclude<State, State.Success>, message: string) {
    super(message)
    this.state = state
    this.name = 'BotdError'
    Object.setPrototypeOf(this, BotdError.prototype)
  }
}

export const enum BrowserEngineKind {
  Unknown = 'unknown',
  Chromium = 'chromium',
  Gecko = 'gecko',
  Webkit = 'webkit',
}

export const enum BrowserKind {
  Unknown = 'unknown',
  Chrome = 'chrome',
  Firefox = 'firefox',
  Opera = 'opera',
  Safari = 'safari',
  IE = 'internet_explorer',
  Edge = 'edge',
  WeChat = 'wechat',
}
