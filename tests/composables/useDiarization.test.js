import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDiarization } from '@/composables/useDiarization'

// Mock the diarization API
vi.mock('@/api/handlers', () => ({
  diarizationApi: {
    getAll: vi.fn(),
    getAllForFile: vi.fn(),
    create: vi.fn(),
    apply: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteForFile: vi.fn(),
  },
}))

import { diarizationApi } from '@/api/handlers'

describe('useDiarization Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('State Management', () => {
    it('diarizations ref starts as empty array', () => {
      // Arrange & Act
      const { diarizations } = useDiarization()

      // Assert
      expect(diarizations.value).toEqual([])
      expect(Array.isArray(diarizations.value)).toBe(true)
    })

    it('loading ref starts as false', () => {
      // Arrange & Act
      const { loading } = useDiarization()

      // Assert
      expect(loading.value).toBe(false)
    })

    it('error ref starts as null', () => {
      // Arrange & Act
      const { error } = useDiarization()

      // Assert
      expect(error.value).toBeNull()
    })

    it('applying ref starts as false', () => {
      // Arrange & Act
      const { applying } = useDiarization()

      // Assert
      expect(applying.value).toBe(false)
    })
  })

  describe('Computed: speakers', () => {
    it('returns unique speaker list from diarizations', () => {
      // Arrange
      const { diarizations, speakers } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 2, speaker: 'SPEAKER_02', forAudio: 'audio-1' },
        { id: 3, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 4, speaker: 'SPEAKER_03', forAudio: 'audio-1' },
      ]

      // Act
      const result = speakers.value

      // Assert
      expect(result).toHaveLength(3)
      expect(result).toContain('SPEAKER_01')
      expect(result).toContain('SPEAKER_02')
      expect(result).toContain('SPEAKER_03')
    })

    it('speakers are sorted alphabetically', () => {
      // Arrange
      const { diarizations, speakers } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_03', forAudio: 'audio-1' },
        { id: 2, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 3, speaker: 'SPEAKER_02', forAudio: 'audio-1' },
      ]

      // Act
      const result = speakers.value

      // Assert
      expect(result).toEqual(['SPEAKER_01', 'SPEAKER_02', 'SPEAKER_03'])
    })

    it('removes duplicates', () => {
      // Arrange
      const { diarizations, speakers } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 2, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 3, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
      ]

      // Act
      const result = speakers.value

      // Assert
      expect(result).toHaveLength(1)
      expect(result).toEqual(['SPEAKER_01'])
    })
  })

  describe('loadAll()', () => {
    it('sets loading to true during execution', async () => {
      // Arrange
      const { loadAll, loading } = useDiarization()
      diarizationApi.getAll.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 10))
      )

      // Act
      expect(loading.value).toBe(false) // Before
      const promise = loadAll()
      expect(loading.value).toBe(true) // During
      await promise

      // Assert
      expect(loading.value).toBe(false) // After
    })

    it('calls diarizationApi.getAll()', async () => {
      // Arrange
      const { loadAll } = useDiarization()
      const mockData = [
        { id: 1, speaker: 'SPEAKER_01', startTime: 0, endTime: 5 },
      ]
      diarizationApi.getAll.mockResolvedValue(mockData)

      // Act
      await loadAll()

      // Assert
      expect(diarizationApi.getAll).toHaveBeenCalledOnce()
    })

    it('updates diarizations.value with results', async () => {
      // Arrange
      const { loadAll, diarizations } = useDiarization()
      const mockData = [
        { id: 1, speaker: 'SPEAKER_01', startTime: 0, endTime: 5 },
        { id: 2, speaker: 'SPEAKER_02', startTime: 5, endTime: 10 },
      ]
      diarizationApi.getAll.mockResolvedValue(mockData)

      // Act
      await loadAll()

      // Assert
      expect(diarizations.value).toEqual(mockData)
    })

    it('sets loading back to false after completion', async () => {
      // Arrange
      const { loadAll, loading } = useDiarization()
      diarizationApi.getAll.mockResolvedValue([])

      // Act
      await loadAll()

      // Assert
      expect(loading.value).toBe(false)
    })

    it('sets error.value on failure', async () => {
      // Arrange
      const { loadAll, error } = useDiarization()
      const errorMessage = 'Failed to load diarizations'
      diarizationApi.getAll.mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(loadAll()).rejects.toThrow(errorMessage)
      expect(error.value).toBe(errorMessage)
    })

    it('returns promise with diarization data', async () => {
      // Arrange
      const { loadAll } = useDiarization()
      const mockData = [{ id: 1, speaker: 'SPEAKER_01' }]
      diarizationApi.getAll.mockResolvedValue(mockData)

      // Act
      const result = await loadAll()

      // Assert
      expect(result).toEqual(mockData)
    })
  })

  describe('getDiarizationsForAudio(audioId)', () => {
    it('filters diarizations where forAudio === audioId', () => {
      // Arrange
      const { diarizations, getDiarizationsForAudio } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 2, speaker: 'SPEAKER_02', forAudio: 'audio-2' },
        { id: 3, speaker: 'SPEAKER_03', forAudio: 'audio-1' },
      ]

      // Act
      const result = getDiarizationsForAudio('audio-1')

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(3)
    })

    it('returns empty array when no matches', () => {
      // Arrange
      const { diarizations, getDiarizationsForAudio } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
      ]

      // Act
      const result = getDiarizationsForAudio('non-existent-audio')

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('getDiarizationsBySpeaker(speaker)', () => {
    it('filters diarizations by speaker field', () => {
      // Arrange
      const { diarizations, getDiarizationsBySpeaker } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
        { id: 2, speaker: 'SPEAKER_02', forAudio: 'audio-1' },
        { id: 3, speaker: 'SPEAKER_01', forAudio: 'audio-2' },
      ]

      // Act
      const result = getDiarizationsBySpeaker('SPEAKER_01')

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].speaker).toBe('SPEAKER_01')
      expect(result[1].speaker).toBe('SPEAKER_01')
    })
  })

  describe('getSpeakerSegments(audioId, speaker)', () => {
    it('filters by both audioId AND speaker', () => {
      // Arrange
      const { diarizations, getSpeakerSegments } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 0 },
        { id: 2, speaker: 'SPEAKER_02', forAudio: 'audio-1', startTime: 5 },
        { id: 3, speaker: 'SPEAKER_01', forAudio: 'audio-2', startTime: 10 },
        { id: 4, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 15 },
      ]

      // Act
      const result = getSpeakerSegments('audio-1', 'SPEAKER_01')

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(4)
    })

    it('sorts results by startTime (ascending)', () => {
      // Arrange
      const { diarizations, getSpeakerSegments } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 20 },
        { id: 2, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 5 },
        { id: 3, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 15 },
      ]

      // Act
      const result = getSpeakerSegments('audio-1', 'SPEAKER_01')

      // Assert
      expect(result[0].startTime).toBe(5)
      expect(result[1].startTime).toBe(15)
      expect(result[2].startTime).toBe(20)
    })

    it('returns chronologically ordered segments', () => {
      // Arrange
      const { diarizations, getSpeakerSegments } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 100 },
        { id: 2, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 10 },
        { id: 3, speaker: 'SPEAKER_01', forAudio: 'audio-1', startTime: 50 },
      ]

      // Act
      const result = getSpeakerSegments('audio-1', 'SPEAKER_01')

      // Assert
      expect(result.map((s) => s.startTime)).toEqual([10, 50, 100])
    })
  })

  describe('apply(audioIds)', () => {
    it('sets applying to true during execution', async () => {
      // Arrange
      const { apply, applying } = useDiarization()
      diarizationApi.apply.mockResolvedValue(5)
      diarizationApi.getAll.mockResolvedValue([])

      // Act
      expect(applying.value).toBe(false) // Before
      const promise = apply(['audio-1'])
      expect(applying.value).toBe(true) // During
      await promise

      // Assert
      expect(applying.value).toBe(false) // After
    })

    it('calls diarizationApi.apply with {forAudio: audioIds}', async () => {
      // Arrange
      const { apply } = useDiarization()
      const audioIds = ['audio-1', 'audio-2']
      diarizationApi.apply.mockResolvedValue(10)
      diarizationApi.getAll.mockResolvedValue([])

      // Act
      await apply(audioIds)

      // Assert
      expect(diarizationApi.apply).toHaveBeenCalledOnce()
      expect(diarizationApi.apply).toHaveBeenCalledWith({ forAudio: audioIds })
    })

    it('reloads all diarizations after apply', async () => {
      // Arrange
      const { apply } = useDiarization()
      const newDiarizations = [
        { id: 1, speaker: 'SPEAKER_01', forAudio: 'audio-1' },
      ]
      diarizationApi.apply.mockResolvedValue(1)
      diarizationApi.getAll.mockResolvedValue(newDiarizations)

      // Act
      await apply(['audio-1'])

      // Assert
      expect(diarizationApi.getAll).toHaveBeenCalledOnce()
    })

    it('returns count of applied diarizations', async () => {
      // Arrange
      const { apply } = useDiarization()
      const count = 7
      diarizationApi.apply.mockResolvedValue(count)
      diarizationApi.getAll.mockResolvedValue([])

      // Act
      const result = await apply(['audio-1'])

      // Assert
      expect(result).toBe(count)
    })

    it('handles errors and sets error.value', async () => {
      // Arrange
      const { apply, error } = useDiarization()
      const errorMessage = 'Apply failed'
      diarizationApi.apply.mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(apply(['audio-1'])).rejects.toThrow(errorMessage)
      expect(error.value).toBe(errorMessage)
    })
  })

  describe('create(data)', () => {
    it('creates new diarization via API', async () => {
      // Arrange
      const { create } = useDiarization()
      const diarizationData = {
        speaker: 'SPEAKER_01',
        startTime: 0,
        endTime: 5,
        forAudio: 'audio-1',
      }
      const createdDiarization = { id: 100, ...diarizationData }
      diarizationApi.create.mockResolvedValue(createdDiarization)

      // Act
      await create(diarizationData)

      // Assert
      expect(diarizationApi.create).toHaveBeenCalledOnce()
      expect(diarizationApi.create).toHaveBeenCalledWith(diarizationData)
    })

    it('adds created diarization to local state array', async () => {
      // Arrange
      const { create, diarizations } = useDiarization()
      const diarizationData = { speaker: 'SPEAKER_01', forAudio: 'audio-1' }
      const createdDiarization = { id: 50, ...diarizationData }
      diarizationApi.create.mockResolvedValue(createdDiarization)

      // Act
      await create(diarizationData)

      // Assert
      expect(diarizations.value).toHaveLength(1)
      expect(diarizations.value[0]).toEqual(createdDiarization)
    })

    it('returns created object with id', async () => {
      // Arrange
      const { create } = useDiarization()
      const diarizationData = { speaker: 'SPEAKER_01', forAudio: 'audio-1' }
      const createdDiarization = { id: 'generated-id', ...diarizationData }
      diarizationApi.create.mockResolvedValue(createdDiarization)

      // Act
      const result = await create(diarizationData)

      // Assert
      expect(result).toEqual(createdDiarization)
      expect(result.id).toBeDefined()
    })
  })

  describe('update(id, data)', () => {
    it('updates diarization in API', async () => {
      // Arrange
      const { diarizations, update } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', startTime: 0, endTime: 5 },
      ]
      const updateData = { startTime: 1, endTime: 6 }
      diarizationApi.update.mockResolvedValue({ id: 1, ...updateData })

      // Act
      await update(1, updateData)

      // Assert
      expect(diarizationApi.update).toHaveBeenCalledOnce()
      expect(diarizationApi.update).toHaveBeenCalledWith(1, updateData)
    })

    it('finds and updates diarization in local array', async () => {
      // Arrange
      const { diarizations, update } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', startTime: 0, endTime: 5 },
        { id: 2, speaker: 'SPEAKER_02', startTime: 5, endTime: 10 },
      ]
      const updateData = { startTime: 1 }
      diarizationApi.update.mockResolvedValue({ id: 1, ...updateData })

      // Act
      await update(1, updateData)

      // Assert
      expect(diarizations.value[0].startTime).toBe(1)
    })

    it('preserves other diarizations unchanged', async () => {
      // Arrange
      const { diarizations, update } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01', startTime: 0, endTime: 5 },
        { id: 2, speaker: 'SPEAKER_02', startTime: 5, endTime: 10 },
      ]
      const updateData = { startTime: 1 }
      diarizationApi.update.mockResolvedValue({ id: 1, ...updateData })

      // Act
      await update(1, updateData)

      // Assert
      expect(diarizations.value[1]).toEqual({
        id: 2,
        speaker: 'SPEAKER_02',
        startTime: 5,
        endTime: 10,
      })
    })
  })

  describe('remove(id)', () => {
    it('calls diarizationApi.delete(id)', async () => {
      // Arrange
      const { remove } = useDiarization()
      diarizationApi.delete.mockResolvedValue({ success: true })

      // Act
      await remove(1)

      // Assert
      expect(diarizationApi.delete).toHaveBeenCalledOnce()
      expect(diarizationApi.delete).toHaveBeenCalledWith(1)
    })

    it('removes diarization from local array', async () => {
      // Arrange
      const { diarizations, remove } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01' },
        { id: 2, speaker: 'SPEAKER_02' },
        { id: 3, speaker: 'SPEAKER_03' },
      ]
      diarizationApi.delete.mockResolvedValue({ success: true })

      // Act
      await remove(2)

      // Assert
      expect(diarizations.value).toHaveLength(2)
      expect(diarizations.value.find((d) => d.id === 2)).toBeUndefined()
    })

    it('other diarizations remain intact', async () => {
      // Arrange
      const { diarizations, remove } = useDiarization()
      diarizations.value = [
        { id: 1, speaker: 'SPEAKER_01' },
        { id: 2, speaker: 'SPEAKER_02' },
      ]
      diarizationApi.delete.mockResolvedValue({ success: true })

      // Act
      await remove(1)

      // Assert
      expect(diarizations.value).toHaveLength(1)
      expect(diarizations.value[0]).toEqual({ id: 2, speaker: 'SPEAKER_02' })
    })
  })
})
