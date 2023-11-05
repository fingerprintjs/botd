import { BotdError, BrowserEngineKind, BrowserKind, State } from '../types'
import { countTruthy } from './misc'
import { strIncludes } from './ponyfills'

export function getBrowserEngineKind(): BrowserEngineKind {
  // Based on research in October 2020. Tested to detect Chromium 42-86.
  const w = window
  const n = navigator

  if (
    countTruthy([
      'webkitPersistentStorage' in n,
      'webkitTemporaryStorage' in n,
      n.vendor.indexOf('Google') === 0,
      'webkitResolveLocalFileSystemURL' in w,
      'BatteryManager' in w,
      'webkitMediaStream' in w,
      'webkitSpeechGrammar' in w,
    ]) >= 5
  ) {
    return BrowserEngineKind.Chromium
  }

  if (
    countTruthy([
      'ApplePayError' in w,
      'CSSPrimitiveValue' in w,
      'Counter' in w,
      n.vendor.indexOf('Apple') === 0,
      'getStorageUpdates' in n,
      'WebKitMediaKeys' in w,
    ]) >= 4
  ) {
    return BrowserEngineKind.Webkit
  }

  if (
    countTruthy([
      'buildID' in navigator,
      'MozAppearance' in (document.documentElement?.style ?? {}),
      'onmozfullscreenchange' in w,
      'mozInnerScreenX' in w,
      'CSSMozDocumentRule' in w,
      'CanvasCaptureMediaStream' in w,
    ]) >= 4
  ) {
    return BrowserEngineKind.Gecko
  }

  return BrowserEngineKind.Unknown
}

export function getBrowserKind(): BrowserKind {
  const userAgent = navigator.userAgent?.toLowerCase()
  if (strIncludes(userAgent, 'edg/')) {
    return BrowserKind.Edge
  } else if (strIncludes(userAgent, 'safari')) {
    return BrowserKind.Safari
  } else if (strIncludes(userAgent, 'trident') || strIncludes(userAgent, 'msie')) {
    return BrowserKind.IE
  } else if (strIncludes(userAgent, 'wechat')) {
    return BrowserKind.WeChat
  } else if (strIncludes(userAgent, 'firefox')) {
    return BrowserKind.Firefox
  } else if (strIncludes(userAgent, 'opera') || strIncludes(userAgent, 'opr')) {
    return BrowserKind.Opera
  } else if (strIncludes(userAgent, 'chrome')) {
    return BrowserKind.Chrome
  } else {
    return BrowserKind.Unknown
  }
}

// Source: https://github.com/fingerprintjs/fingerprintjs/blob/master/src/utils/browser.ts#L223
export function isAndroid(): boolean {
  const browserEngineKind = getBrowserEngineKind()
  const isItChromium = browserEngineKind === BrowserEngineKind.Chromium
  const isItGecko = browserEngineKind === BrowserEngineKind.Gecko

  // Only 2 browser engines are presented on Android.
  // Actually, there is also Android 4.1 browser, but it's not worth detecting it at the moment.
  if (!isItChromium && !isItGecko) return false

  const w = window

  // Chrome removes all words "Android" from `navigator` when desktop version is requested
  // Firefox keeps "Android" in `navigator.appVersion` when desktop version is requested
  return (
    countTruthy([
      'onorientationchange' in w,
      'orientation' in w,
      isItChromium && !('SharedWorker' in w),
      isItGecko && /android/i.test(navigator.appVersion),
    ]) >= 2
  )
}

// Source: https://github.com/fingerprintjs/fingerprintjs/blob/109f8ef802169df3fa1c5d1baa4b7bc0abbc1d91/src/utils/browser.ts#L102C1-L118C2
export function isDesktopWebKit(): boolean {
  // Checked in Safari and DuckDuckGo

  const w = window
  const { HTMLElement, Document } = w

  return (
    countTruthy([
      'safari' in w, // Always false in Karma and BrowserStack Automate
      !('ongestureend' in w),
      !('TouchEvent' in w),
      !('orientation' in w),
      HTMLElement && !('autocapitalize' in HTMLElement.prototype),
      Document && 'pointerLockElement' in Document.prototype,
    ]) >= 4
  )
}

export function getMozAppearanceSupport(): boolean {
  if (window.CSS === undefined) {
    throw new BotdError(State.Undefined, 'window.CSS is undefined')
  }
  return CSS.supports('-moz-appearance', 'auto')
}

export function getDocumentFocus(): boolean {
  if (document.hasFocus === undefined) {
    return false
  }
  return document.hasFocus()
}

export function isChromium86OrNewer(): boolean {
  // Checked in Chrome 85 vs Chrome 86 both on desktop and Android
  const w = window

  return (
    countTruthy([
      !('MediaSettingsRange' in w),
      'RTCEncodedAudioFrame' in w,
      '' + w.Intl === '[object Intl]',
      '' + w.Reflect === '[object Reflect]',
    ]) >= 3
  )
}

export function isIPad(): boolean {
  // Checked on:
  // Safari on iPadOS (both mobile and desktop modes): 8, 11, 12, 13, 14
  // Chrome on iPadOS (both mobile and desktop modes): 11, 12, 13, 14
  // Safari on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
  // Chrome on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14

  // Before iOS 13. Safari tampers the value in "request desktop site" mode since iOS 13.
  if (navigator.platform === 'iPad') {
    return true
  }

  const s = screen
  const screenRatio = s.width / s.height

  return (
    countTruthy([
      'MediaSource' in window, // Since iOS 13
      !!Element.prototype.webkitRequestFullscreen, // Since iOS 12
      // iPhone 4S that runs iOS 9 matches this. But it won't match the criteria above, so it won't be detected as iPad.
      screenRatio > 0.65 && screenRatio < 1.53,
    ]) >= 2
  )
}
