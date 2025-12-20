import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null
  },
  setItem(key, value) {
    this.store[key] = String(value)
  },
  removeItem(key) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  },
}

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock MediaRecorder for audio recording functionality
class MockMediaRecorder {
  constructor(stream, options) {
    this.stream = stream
    this.options = options
    this.state = 'inactive'
    this.ondataavailable = null
    this.onstop = null
    this.onerror = null
    this.onstart = null
    this.onpause = null
    this.onresume = null
  }

  start(timeslice) {
    this.state = 'recording'
    if (this.onstart) this.onstart()
  }

  stop() {
    this.state = 'inactive'
    if (this.ondataavailable) {
      const blob = new Blob(['mock audio data'], { type: 'audio/webm' })
      this.ondataavailable({ data: blob })
    }
    if (this.onstop) this.onstop()
  }

  pause() {
    this.state = 'paused'
    if (this.onpause) this.onpause()
  }

  resume() {
    this.state = 'recording'
    if (this.onresume) this.onresume()
  }

  requestData() {
    if (this.ondataavailable) {
      const blob = new Blob(['mock audio data'], { type: 'audio/webm' })
      this.ondataavailable({ data: blob })
    }
  }

  static isTypeSupported(type) {
    return ['audio/webm', 'audio/ogg', 'audio/wav'].includes(type)
  }
}

global.MediaRecorder = MockMediaRecorder

// Mock navigator.mediaDevices.getUserMedia for microphone access
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [
        {
          kind: 'audio',
          stop: vi.fn(),
          enabled: true,
          id: 'mock-track-id',
          label: 'Mock Microphone',
          muted: false,
          readyState: 'live',
        },
      ],
      getAudioTracks: () => [
        {
          kind: 'audio',
          stop: vi.fn(),
          enabled: true,
          id: 'mock-track-id',
          label: 'Mock Microphone',
          muted: false,
          readyState: 'live',
        },
      ],
      getVideoTracks: () => [],
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: 'default',
        kind: 'audioinput',
        label: 'Default Microphone',
        groupId: 'default-group',
      },
    ]),
  },
})

// Mock URL.createObjectURL and URL.revokeObjectURL for blob handling
const blobUrls = new Map()
let urlCounter = 0

global.URL.createObjectURL = vi.fn((blob) => {
  const url = `blob:http://localhost/mock-blob-${urlCounter++}`
  blobUrls.set(url, blob)
  return url
})

global.URL.revokeObjectURL = vi.fn((url) => {
  blobUrls.delete(url)
})

// Mock FileReader with readAsArrayBuffer and readAsDataURL
class MockFileReader {
  constructor() {
    this.readyState = 0 // EMPTY
    this.result = null
    this.error = null
    this.onload = null
    this.onerror = null
    this.onprogress = null
    this.onloadstart = null
    this.onloadend = null
  }

  readAsArrayBuffer(blob) {
    this.readyState = 1 // LOADING
    if (this.onloadstart) this.onloadstart()

    setTimeout(() => {
      this.readyState = 2 // DONE
      // For Blobs, get the internal array buffer from the blob's data
      if (blob && blob[Symbol.for('nodejs.util.inspect.custom')]) {
        // In Node.js test environment, blobs have internal buffer
        try {
          // Try to get the blob's internal data
          const blobParts = blob[Symbol.for('blob.parts')] || []
          if (blobParts.length > 0 && blobParts[0] instanceof ArrayBuffer) {
            this.result = blobParts[0]
          } else {
            // Create properly sized ArrayBuffer
            this.result = new ArrayBuffer(blob.size || 8)
          }
        } catch {
          this.result = new ArrayBuffer(blob.size || 8)
        }
      } else {
        this.result = new ArrayBuffer(blob?.size || 8)
      }
      if (this.onload) this.onload({ target: this })
      if (this.onloadend) this.onloadend({ target: this })
    }, 0)
  }

  readAsDataURL(blob) {
    this.readyState = 1 // LOADING
    if (this.onloadstart) this.onloadstart()

    setTimeout(() => {
      this.readyState = 2 // DONE
      this.result = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA'
      if (this.onload) this.onload({ target: this })
      if (this.onloadend) this.onloadend({ target: this })
    }, 0)
  }

  readAsText(blob) {
    this.readyState = 1 // LOADING
    if (this.onloadstart) this.onloadstart()

    setTimeout(() => {
      this.readyState = 2 // DONE
      this.result = 'mock file content'
      if (this.onload) this.onload({ target: this })
      if (this.onloadend) this.onloadend({ target: this })
    }, 0)
  }

  abort() {
    this.readyState = 2 // DONE
    this.error = new Error('FileReader aborted')
    if (this.onerror) this.onerror({ target: this })
  }
}

global.FileReader = MockFileReader

// Configure Vue Test Utils
config.global.mocks = {
  $t: (key) => key, // Mock i18n translation function
}

// Set default locale
config.global.provide = {
  i18n: {
    locale: 'en',
  },
}

// Suppress console warnings in test output
global.console.warn = vi.fn()
global.console.error = vi.fn()

// Mock Blob.arrayBuffer() for Node.js environment
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = async function () {
    // In Node.js/test environment, use the native buffer approach
    if (this.stream && typeof this.stream === 'function') {
      // Node.js 16+ Blob has stream method
      const chunks = []
      const reader = this.stream().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }
      return result.buffer
    } else {
      // Fallback: create empty buffer of correct size
      return new ArrayBuffer(this.size || 0)
    }
  }
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  blobUrls.clear()
})
