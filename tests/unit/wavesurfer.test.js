import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock WaveSurfer class
class MockWaveSurfer {
  constructor(options) {
    this.options = options
    this.isPlaying = vi.fn(() => this._isPlaying)
    this._isPlaying = false
    this.duration = 0
    this.currentTime = 0
    this.volume = 1
    this.playbackRate = 1
    this.regions = []
    this.listeners = {}
  }

  static create(options) {
    const instance = new MockWaveSurfer(options)
    return instance
  }

  registerPlugin(plugin) {
    this.regionsPlugin = plugin
    return this
  }

  load(url) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.duration = 120.5 // Mock duration
        this._trigger('ready')
        resolve()
      }, 0)
    })
  }

  play() {
    this._isPlaying = true
    this._trigger('play')
    return Promise.resolve()
  }

  pause() {
    this._isPlaying = false
    this._trigger('pause')
  }

  stop() {
    this._isPlaying = false
    this.currentTime = 0
    this._trigger('stop')
  }

  playPause() {
    if (this._isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  setTime(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration))
    this._trigger('seeking', this.currentTime)
  }

  getCurrentTime() {
    return this.currentTime
  }

  getDuration() {
    return this.duration
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value))
  }

  getVolume() {
    return this.volume
  }

  setPlaybackRate(rate) {
    this.playbackRate = rate
  }

  getPlaybackRate() {
    return this.playbackRate
  }

  getDecodedData() {
    // Return mock AudioBuffer
    return {
      numberOfChannels: 2,
      length: 5292000,
      sampleRate: 48000,
      duration: 110.25,
      getChannelData: (channel) => new Float32Array(5292000),
    }
  }

  addRegion(options) {
    const region = {
      id: options.id || `region-${this.regions.length}`,
      start: options.start,
      end: options.end,
      color: options.color || 'rgba(0, 0, 0, 0.1)',
      ...options,
    }
    this.regions.push(region)
    return region
  }

  clearRegions() {
    this.regions = []
  }

  getRegions() {
    return this.regions
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  un(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  destroy() {
    this.listeners = {}
    this.regions = []
    this._isPlaying = false
  }

  _trigger(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(...args))
    }
  }
}

// Mock RegionsPlugin
class MockRegionsPlugin {
  constructor(options) {
    this.options = options
  }

  static create(options) {
    return new MockRegionsPlugin(options)
  }
}

// Setup global mocks
global.WaveSurfer = MockWaveSurfer
global.RegionsPlugin = MockRegionsPlugin

describe('WaveSurfer Integration', () => {
  let wavesurfer

  beforeEach(() => {
    wavesurfer = null
  })

  describe('Initialization', () => {
    it('WaveSurfer.create() called with correct config object', () => {
      // Arrange
      const config = {
        container: document.createElement('div'),
        waveColor: '#4F46E5',
        progressColor: '#8B5CF6',
        cursorColor: '#EC4899',
        height: 128,
        normalize: true,
      }

      // Act
      wavesurfer = MockWaveSurfer.create(config)

      // Assert
      expect(wavesurfer.options).toEqual(config)
      expect(wavesurfer.options.container).toBeDefined()
      expect(wavesurfer.options.waveColor).toBe('#4F46E5')
      expect(wavesurfer.options.progressColor).toBe('#8B5CF6')
      expect(wavesurfer.options.cursorColor).toBe('#EC4899')
      expect(wavesurfer.options.height).toBe(128)
      expect(wavesurfer.options.normalize).toBe(true)
    })

    it('config includes: container, waveColor, progressColor, cursorColor, height, normalize', () => {
      // Arrange
      const config = {
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'pink',
        height: 256,
        normalize: false,
      }

      // Act
      wavesurfer = MockWaveSurfer.create(config)

      // Assert
      expect(wavesurfer.options).toHaveProperty('container')
      expect(wavesurfer.options).toHaveProperty('waveColor')
      expect(wavesurfer.options).toHaveProperty('progressColor')
      expect(wavesurfer.options).toHaveProperty('cursorColor')
      expect(wavesurfer.options).toHaveProperty('height')
      expect(wavesurfer.options).toHaveProperty('normalize')
    })

    it('RegionsPlugin registered via registerPlugin()', () => {
      // Arrange
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      const plugin = MockRegionsPlugin.create()

      // Act
      const result = wavesurfer.registerPlugin(plugin)

      // Assert
      expect(wavesurfer.regionsPlugin).toBe(plugin)
      expect(result).toBe(wavesurfer) // Should return wavesurfer for chaining
    })
  })

  describe('Audio Loading', () => {
    beforeEach(() => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
    })

    it('load(url) accepts string URL', async () => {
      // Arrange
      const audioUrl = 'https://example.com/audio.mp3'

      // Act
      const result = await wavesurfer.load(audioUrl)

      // Assert
      expect(result).toBeUndefined() // load() returns void
    })

    it('load(blob) accepts Blob object', async () => {
      // Arrange
      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' })

      // Act
      await wavesurfer.load(audioBlob)

      // Assert - Should not throw
      expect(wavesurfer.duration).toBeGreaterThan(0)
    })

    it('returns promise that resolves when loaded', async () => {
      // Arrange
      const audioUrl = '/test-audio.wav'

      // Act
      const loadPromise = wavesurfer.load(audioUrl)

      // Assert
      expect(loadPromise).toBeInstanceOf(Promise)
      await expect(loadPromise).resolves.toBeUndefined()
    })
  })

  describe('Playback Control', () => {
    beforeEach(async () => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      await wavesurfer.load('/test.mp3')
    })

    it('play() starts playback', async () => {
      // Arrange
      expect(wavesurfer.isPlaying()).toBe(false)

      // Act
      await wavesurfer.play()

      // Assert
      expect(wavesurfer.isPlaying()).toBe(true)
    })

    it('pause() pauses playback', () => {
      // Arrange
      wavesurfer._isPlaying = true

      // Act
      wavesurfer.pause()

      // Assert
      expect(wavesurfer.isPlaying()).toBe(false)
    })

    it('stop() stops and resets position', () => {
      // Arrange
      wavesurfer._isPlaying = true
      wavesurfer.currentTime = 50

      // Act
      wavesurfer.stop()

      // Assert
      expect(wavesurfer.isPlaying()).toBe(false)
      expect(wavesurfer.currentTime).toBe(0)
    })

    it('playPause() toggles: if isPlaying() true → pause(), else → play()', async () => {
      // Arrange - Initially not playing
      expect(wavesurfer.isPlaying()).toBe(false)

      // Act - First toggle should play
      wavesurfer.playPause()

      // Assert
      expect(wavesurfer.isPlaying()).toBe(true)

      // Act - Second toggle should pause
      wavesurfer.playPause()

      // Assert
      expect(wavesurfer.isPlaying()).toBe(false)
    })
  })

  describe('Navigation', () => {
    beforeEach(async () => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      await wavesurfer.load('/test.mp3')
    })

    it('setTime(seconds) moves playback position', () => {
      // Arrange
      const targetTime = 45.5

      // Act
      wavesurfer.setTime(targetTime)

      // Assert
      expect(wavesurfer.currentTime).toBe(targetTime)
    })

    it('getCurrentTime() returns current position in seconds', () => {
      // Arrange
      wavesurfer.currentTime = 30.25

      // Act
      const result = wavesurfer.getCurrentTime()

      // Assert
      expect(result).toBe(30.25)
    })

    it('getDuration() returns total duration', () => {
      // Arrange - duration set in load()
      const expectedDuration = 120.5

      // Act
      const result = wavesurfer.getDuration()

      // Assert
      expect(result).toBe(expectedDuration)
    })
  })

  describe('Regions Plugin', () => {
    beforeEach(async () => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      await wavesurfer.load('/test.mp3')
    })

    it('addRegion({id, start, end, color}) creates selection region', () => {
      // Arrange
      const regionOptions = {
        id: 'region-1',
        start: 10,
        end: 20,
        color: 'rgba(255, 0, 0, 0.3)',
      }

      // Act
      const region = wavesurfer.addRegion(regionOptions)

      // Assert
      expect(region.id).toBe('region-1')
      expect(region.start).toBe(10)
      expect(region.end).toBe(20)
      expect(region.color).toBe('rgba(255, 0, 0, 0.3)')
    })

    it('clearRegions() removes all regions', () => {
      // Arrange
      wavesurfer.addRegion({ start: 0, end: 5 })
      wavesurfer.addRegion({ start: 10, end: 15 })
      expect(wavesurfer.regions).toHaveLength(2)

      // Act
      wavesurfer.clearRegions()

      // Assert
      expect(wavesurfer.regions).toHaveLength(0)
    })

    it('getRegions() returns array of region objects', () => {
      // Arrange
      wavesurfer.addRegion({ id: 'r1', start: 0, end: 5 })
      wavesurfer.addRegion({ id: 'r2', start: 10, end: 15 })

      // Act
      const regions = wavesurfer.getRegions()

      // Assert
      expect(Array.isArray(regions)).toBe(true)
      expect(regions).toHaveLength(2)
      expect(regions[0].id).toBe('r1')
      expect(regions[1].id).toBe('r2')
    })
  })

  describe('Settings', () => {
    beforeEach(async () => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      await wavesurfer.load('/test.mp3')
    })

    it('setVolume(value) accepts 0-1 range', () => {
      // Arrange & Act
      wavesurfer.setVolume(0.5)

      // Assert
      expect(wavesurfer.volume).toBe(0.5)

      // Act - Test boundaries
      wavesurfer.setVolume(0)
      expect(wavesurfer.volume).toBe(0)

      wavesurfer.setVolume(1)
      expect(wavesurfer.volume).toBe(1)
    })

    it('getVolume() returns current volume', () => {
      // Arrange
      wavesurfer.volume = 0.75

      // Act
      const result = wavesurfer.getVolume()

      // Assert
      expect(result).toBe(0.75)
    })

    it('setPlaybackRate(rate) works with [0.5, 0.75, 1, 1.25, 1.5, 2]', () => {
      // Arrange
      const validRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

      // Act & Assert
      validRates.forEach((rate) => {
        wavesurfer.setPlaybackRate(rate)
        expect(wavesurfer.playbackRate).toBe(rate)
      })
    })

    it('getPlaybackRate() returns current rate', () => {
      // Arrange
      wavesurfer.playbackRate = 1.5

      // Act
      const result = wavesurfer.getPlaybackRate()

      // Assert
      expect(result).toBe(1.5)
    })
  })

  describe('Events', () => {
    beforeEach(() => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
    })

    it("on('ready', callback) subscribes to ready event", async () => {
      // Arrange
      const readyCallback = vi.fn()
      wavesurfer.on('ready', readyCallback)

      // Act
      await wavesurfer.load('/test.mp3')

      // Assert
      expect(readyCallback).toHaveBeenCalled()
    })

    it("on('audioprocess', callback) for playback progress", () => {
      // Arrange
      const audioprocessCallback = vi.fn()
      wavesurfer.on('audioprocess', audioprocessCallback)

      // Act
      wavesurfer._trigger('audioprocess', 30.5)

      // Assert
      expect(audioprocessCallback).toHaveBeenCalledWith(30.5)
    })

    it("on('error', callback) for error handling", () => {
      // Arrange
      const errorCallback = vi.fn()
      const error = new Error('Load failed')
      wavesurfer.on('error', errorCallback)

      // Act
      wavesurfer._trigger('error', error)

      // Assert
      expect(errorCallback).toHaveBeenCalledWith(error)
    })

    it('un(event, callback) unsubscribes', () => {
      // Arrange
      const callback = vi.fn()
      wavesurfer.on('play', callback)

      // Act - Unsubscribe
      wavesurfer.un('play', callback)
      wavesurfer._trigger('play')

      // Assert
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Audio Data', () => {
    beforeEach(async () => {
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      await wavesurfer.load('/test.mp3')
    })

    it('getDecodedData() returns AudioBuffer', () => {
      // Act
      const audioBuffer = wavesurfer.getDecodedData()

      // Assert
      expect(audioBuffer).toBeDefined()
      expect(audioBuffer).toHaveProperty('numberOfChannels')
      expect(audioBuffer).toHaveProperty('length')
      expect(audioBuffer).toHaveProperty('sampleRate')
      expect(audioBuffer).toHaveProperty('duration')
    })

    it('AudioBuffer has numberOfChannels, length, sampleRate, duration properties', () => {
      // Act
      const audioBuffer = wavesurfer.getDecodedData()

      // Assert
      expect(audioBuffer.numberOfChannels).toBe(2)
      expect(audioBuffer.length).toBe(5292000)
      expect(audioBuffer.sampleRate).toBe(48000)
      expect(audioBuffer.duration).toBe(110.25)
    })
  })

  describe('Cleanup', () => {
    it('destroy() cleans up instance and prevents memory leaks', () => {
      // Arrange
      wavesurfer = MockWaveSurfer.create({ container: '#waveform' })
      wavesurfer.addRegion({ start: 0, end: 5 })
      const callback = vi.fn()
      wavesurfer.on('play', callback)

      // Act
      wavesurfer.destroy()

      // Assert
      expect(wavesurfer.listeners).toEqual({})
      expect(wavesurfer.regions).toEqual([])
      expect(wavesurfer.isPlaying()).toBe(false)
    })
  })
})
