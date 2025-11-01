import { ref } from 'vue'

export const useAudioEditor = () => {
  const audioContext = ref(null)
  const audioBuffer = ref(null)
  const sourceNode = ref(null)

  const initAudioContext = () => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContext.value
  }

  const loadAudioFile = async (file) => {
    const context = initAudioContext()
    const arrayBuffer = await file.arrayBuffer()
    audioBuffer.value = await context.decodeAudioData(arrayBuffer)
    return audioBuffer.value
  }
  const cutAudio = async (startTime, endTime) => {
    if (!audioBuffer.value) throw new Error('No audio loaded')

    const context = initAudioContext()
    const sampleRate = audioBuffer.value.sampleRate

    const startOffset = Math.floor(startTime * sampleRate)
    const endOffset = Math.floor(endTime * sampleRate)

    if (startOffset < 0 || endOffset > audioBuffer.value.length || startOffset >= endOffset) {
      throw new Error('Invalid cut range')
    }

    const beforeLength = startOffset
    const afterLength = audioBuffer.value.length - endOffset
    const totalLength = beforeLength + afterLength

    if (totalLength <= 0) {
      throw new Error('Cannot cut entire audio')
    }

    const cutBuffer = context.createBuffer(
      audioBuffer.value.numberOfChannels,
      totalLength,
      sampleRate,
    )

    for (let channel = 0; channel < audioBuffer.value.numberOfChannels; channel++) {
      const sourceData = audioBuffer.value.getChannelData(channel)
      const targetData = cutBuffer.getChannelData(channel)

      for (let i = 0; i < beforeLength; i++) {
        targetData[i] = sourceData[i]
      }

      for (let i = 0; i < afterLength; i++) {
        targetData[beforeLength + i] = sourceData[endOffset + i]
      }
    }

    audioBuffer.value = cutBuffer
    return cutBuffer
  }

  const trimAudio = async (startTime, endTime) => {
    if (!audioBuffer.value) throw new Error('No audio loaded')

    const context = initAudioContext()
    const sampleRate = audioBuffer.value.sampleRate

    const startOffset = Math.floor(startTime * sampleRate)
    const endOffset = Math.floor(endTime * sampleRate)
    const frameCount = endOffset - startOffset

    if (frameCount <= 0) {
      throw new Error('Invalid trim range')
    }

    if (startOffset < 0 || endOffset > audioBuffer.value.length) {
      throw new Error('Trim range out of bounds')
    }

    const trimmedBuffer = context.createBuffer(
      audioBuffer.value.numberOfChannels,
      frameCount,
      sampleRate,
    )

    for (let channel = 0; channel < audioBuffer.value.numberOfChannels; channel++) {
      const sourceData = audioBuffer.value.getChannelData(channel)
      const targetData = trimmedBuffer.getChannelData(channel)

      for (let i = 0; i < frameCount; i++) {
        targetData[i] = sourceData[startOffset + i]
      }
    }

    audioBuffer.value = trimmedBuffer
    return trimmedBuffer
  }

  const mergeAudioBuffers = async (buffers) => {
    if (!buffers.length) throw new Error('No buffers to merge')

    const context = initAudioContext()
    const sampleRate = buffers[0].sampleRate
    const numberOfChannels = buffers[0].numberOfChannels

    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0)
    const mergedBuffer = context.createBuffer(numberOfChannels, totalLength, sampleRate)

    let offset = 0
    for (const buffer of buffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sourceData = buffer.getChannelData(channel)
        const targetData = mergedBuffer.getChannelData(channel)
        targetData.set(sourceData, offset)
      }
      offset += buffer.length
    }

    audioBuffer.value = mergedBuffer
    return mergedBuffer
  }

  const applyFadeIn = (buffer, duration) => {
    const sampleRate = buffer.sampleRate
    const fadeSamples = Math.floor(duration * sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < fadeSamples && i < data.length; i++) {
        data[i] *= i / fadeSamples
      }
    }
    return buffer
  }

  const applyFadeOut = (buffer, duration) => {
    const sampleRate = buffer.sampleRate
    const fadeSamples = Math.floor(duration * sampleRate)
    const startSample = Math.max(0, buffer.length - fadeSamples)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < fadeSamples && startSample + i < data.length; i++) {
        data[startSample + i] *= 1 - i / fadeSamples
      }
    }
    return buffer
  }

  const normalizeAudio = (buffer) => {
    let max = 0

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i])
        if (abs > max) max = abs
      }
    }

    if (max > 0 && max !== 1) {
      const multiplier = 0.95 / max

      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel)
        for (let i = 0; i < data.length; i++) {
          data[i] *= multiplier
        }
      }
    }

    return buffer
  }

  const exportToWav = (buffer) => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numberOfChannels * bytesPerSample

    const data = []
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i]
        const int16 = Math.max(-1, Math.min(1, sample))
        data.push(int16 < 0 ? int16 * 0x8000 : int16 * 0x7fff)
      }
    }

    const dataLength = data.length * bytesPerSample
    const buffer_size = 44 + dataLength

    const arrayBuffer = new ArrayBuffer(buffer_size)
    const view = new DataView(arrayBuffer)

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(view, 8, 'WAVE')

    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)

    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)

    let offset = 44
    for (let i = 0; i < data.length; i++) {
      view.setInt16(offset, data[i], true)
      offset += 2
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const playAudio = async (buffer, startTime = 0) => {
    const context = initAudioContext()

    if (sourceNode.value) {
      sourceNode.value.stop()
    }

    sourceNode.value = context.createBufferSource()
    sourceNode.value.buffer = buffer || audioBuffer.value
    sourceNode.value.connect(context.destination)
    sourceNode.value.start(0, startTime)

    return sourceNode.value
  }

  const stopAudio = () => {
    if (sourceNode.value) {
      try {
        sourceNode.value.stop()
      } catch (e) {
      }
      sourceNode.value = null
    }
  }

  const cleanup = () => {
    stopAudio()
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    audioBuffer.value = null
  }

  return {
    audioContext,
    audioBuffer,
    initAudioContext,
    loadAudioFile,
    trimAudio,
    cutAudio,
    mergeAudioBuffers,
    applyFadeIn,
    applyFadeOut,
    normalizeAudio,
    exportToWav,
    playAudio,
    stopAudio,
    cleanup,
  }
}
