import { BotKind, BrowserEngineKind, BrowserKind, ComponentDict, DetectorResponse, State } from '../types'

export function detectPluginsLengthInconsistency({
  pluginsLength,
  android,
  browserKind,
  browserEngineKind,
}: ComponentDict): DetectorResponse {
  if (
    pluginsLength.state !== State.Success ||
    android.state !== State.Success ||
    browserKind.state !== State.Success ||
    browserEngineKind.state !== State.Success
  )
    return
  if (
    browserKind.value !== BrowserKind.Chrome ||
    android.value ||
    browserEngineKind.value !== BrowserEngineKind.Chromium
  )
    return
}
