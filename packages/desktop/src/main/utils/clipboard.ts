import { fileURLToPath } from 'url'
import { clipboard, nativeImage } from 'electron'
import type { NativeImage } from 'electron'
import log from 'electron-log'

// Electron 44 replaced the synchronous clipboard accessors with the async W3C
// API, so the rest of the main process reads through these two helpers.

/** Electron maps this MIME type to the OS "copied files" format. */
const URI_LIST_MIME_TYPE = 'text/uri-list'

/** PNG first: a screenshot round trip is only lossless as PNG. */
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'] as const

export const readClipboardImage = async(): Promise<NativeImage | null> => {
  try {
    const items = await clipboard.read()
    for (const mimeType of IMAGE_MIME_TYPES) {
      const item = items.find(({ types }) => types.includes(mimeType))
      if (!item) continue
      const payload = await item.getType(mimeType)
      if (!(payload instanceof Blob)) continue
      const image = nativeImage.createFromBuffer(Buffer.from(await payload.arrayBuffer()))
      if (!image.isEmpty()) return image
    }
  } catch (err) {
    log.error('clipboard.read (image) failed:', err)
  }
  return null
}

/** `text/uri-list` covers the raw formats the pre-Electron-44 code read per platform. */
export const readClipboardFilePath = async(): Promise<string | null> => {
  try {
    const items = await clipboard.read()
    const item = items.find(({ types }) => types.includes(URI_LIST_MIME_TYPE))
    if (!item) return null
    const payload = await item.getType(URI_LIST_MIME_TYPE)
    if (!(payload instanceof Blob)) return null
    for (const line of (await payload.text()).split(/\r?\n/)) {
      const uri = line.trim()
      if (!uri.startsWith('file:')) continue
      try {
        return fileURLToPath(uri)
      } catch {
        // Malformed entry: keep looking.
      }
    }
  } catch (err) {
    log.error('clipboard.read (file path) failed:', err)
  }
  return null
}
