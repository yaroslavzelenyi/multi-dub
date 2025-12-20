import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subtitlesApi } from '@/api/handlers/subtitles'

describe('Subtitles API Handler', () => {
  let mockHttpClient
  let api

  beforeEach(() => {
    // Create mock HTTP client
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }

    // Initialize API with mock client
    api = subtitlesApi(mockHttpClient)
  })

  describe('getAll()', () => {
    it('returns array with {id, text, startTime, endTime, language, forAudio} fields', async () => {
      // Arrange
      const mockSubtitles = [
        {
          id: 1,
          text: 'Hello world',
          startTime: 0.0,
          endTime: 2.5,
          language: 'en',
          forAudio: 'audio-123',
        },
        {
          id: 2,
          text: 'Second subtitle',
          startTime: 2.5,
          endTime: 5.0,
          language: 'en',
          forAudio: 'audio-123',
        },
      ]
      mockHttpClient.get.mockResolvedValue({ data: mockSubtitles })

      // Act
      const result = await api.getAll()

      // Assert
      expect(result).toEqual(mockSubtitles)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('text')
      expect(result[0]).toHaveProperty('startTime')
      expect(result[0]).toHaveProperty('endTime')
      expect(result[0]).toHaveProperty('language')
      expect(result[0]).toHaveProperty('forAudio')
    })

    it('makes GET request to /subtitles', async () => {
      // Arrange
      mockHttpClient.get.mockResolvedValue({ data: [] })

      // Act
      await api.getAll()

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledOnce()
      expect(mockHttpClient.get).toHaveBeenCalledWith('/subtitles', { params: {} })
    })

    it('filters by forAudio parameter', async () => {
      // Arrange
      const audioId = 'audio-456'
      mockHttpClient.get.mockResolvedValue({ data: [] })

      // Act
      await api.getAll(audioId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith('/subtitles', {
        params: { forAudio: audioId },
      })
    })

    it('filters by language parameter', async () => {
      // Arrange
      mockHttpClient.get.mockResolvedValue({ data: [] })

      // Act
      await api.getAll(undefined, 'uk')

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith('/subtitles', {
        params: { language: 'uk' },
      })
    })
  })

  describe('getAllForFile(audioId)', () => {
    it('returns subtitles filtered by forAudio field', async () => {
      // Arrange
      const audioId = 'audio-789'
      const mockSubtitles = [
        { id: 1, text: 'Test', startTime: 0, endTime: 1, forAudio: audioId },
      ]
      mockHttpClient.get.mockResolvedValue({ data: mockSubtitles })

      // Act
      const result = await api.getAllForFile(audioId)

      // Assert
      expect(result).toEqual(mockSubtitles)
    })

    it('makes GET request to /subtitles/:audioId', async () => {
      // Arrange
      const audioId = 'test-audio'
      mockHttpClient.get.mockResolvedValue({ data: [] })

      // Act
      await api.getAllForFile(audioId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/subtitles/${audioId}`)
    })
  })

  describe('create(data)', () => {
    it('creates subtitle with all required fields', async () => {
      // Arrange
      const subtitleData = {
        text: 'New subtitle',
        startTime: 10.5,
        endTime: 15.0,
        language: 'en',
        forAudio: 'audio-123',
      }
      const createdSubtitle = { id: 100, ...subtitleData }
      mockHttpClient.post.mockResolvedValue({ data: createdSubtitle })

      // Act
      const result = await api.create(subtitleData)

      // Assert
      expect(result).toEqual(createdSubtitle)
      expect(result.id).toBeDefined()
      expect(result.text).toBe(subtitleData.text)
      expect(result.startTime).toBe(subtitleData.startTime)
      expect(result.endTime).toBe(subtitleData.endTime)
    })

    it('returns created subtitle with id', async () => {
      // Arrange
      const subtitleData = {
        text: 'Test',
        startTime: 0,
        endTime: 1,
        forAudio: 'audio-1',
      }
      mockHttpClient.post.mockResolvedValue({
        data: { id: 'generated-uuid', ...subtitleData },
      })

      // Act
      const result = await api.create(subtitleData)

      // Assert
      expect(result.id).toBeTruthy()
      expect(typeof result.id).toBe('string')
    })

    it('makes POST request to /subtitles', async () => {
      // Arrange
      const subtitleData = { text: 'Test', startTime: 0, endTime: 1 }
      mockHttpClient.post.mockResolvedValue({ data: { id: 1, ...subtitleData } })

      // Act
      await api.create(subtitleData)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledOnce()
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles', subtitleData)
    })
  })

  describe('generate(audioIds)', () => {
    it('accepts array of audio IDs', async () => {
      // Arrange
      const audioIds = ['audio-1', 'audio-2', 'audio-3']
      mockHttpClient.post.mockResolvedValue({
        data: { count: 3, success: true },
      })

      // Act
      await api.generate(audioIds)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/generate', {
        forAudio: audioIds,
      })
    })

    it('accepts single audio ID and converts to array', async () => {
      // Arrange
      const audioId = 'audio-single'
      mockHttpClient.post.mockResolvedValue({
        data: { count: 1, success: true },
      })

      // Act
      await api.generate(audioId)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/generate', {
        forAudio: [audioId],
      })
    })

    it('makes POST to /subtitles/generate with {forAudio: audioIds}', async () => {
      // Arrange
      const audioIds = ['audio-1']
      mockHttpClient.post.mockResolvedValue({ data: { count: 1, success: true } })

      // Act
      await api.generate(audioIds)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledOnce()
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/generate', {
        forAudio: audioIds,
      })
    })

    it('returns {count: number, success: boolean}', async () => {
      // Arrange
      const response = { count: 5, success: true }
      mockHttpClient.post.mockResolvedValue({ data: response })

      // Act
      const result = await api.generate(['audio-1'])

      // Assert
      expect(result).toEqual(response)
      expect(result.count).toBe(5)
      expect(result.success).toBe(true)
    })

    it('handles error when audio file not found', async () => {
      // Arrange
      mockHttpClient.post.mockRejectedValue(new Error('Audio file not found'))

      // Act & Assert
      await expect(api.generate(['invalid-audio-id'])).rejects.toThrow(
        'Audio file not found'
      )
    })
  })

  describe('translate(targetLanguage, forAudio?, forSubtitle?)', () => {
    it('translates all subtitles for audio file using forAudio parameter', async () => {
      // Arrange
      const targetLanguage = 'uk'
      const forAudio = ['audio-123']
      const response = { count: 10, translatedLanguage: 'uk' }
      mockHttpClient.post.mockResolvedValue({ data: response })

      // Act
      const result = await api.translate(targetLanguage, forAudio)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/translate', {
        language: targetLanguage,
        forAudio: forAudio,
      })
      expect(result.count).toBe(10)
      expect(result.translatedLanguage).toBe('uk')
    })

    it('translates specific subtitles using forSubtitle array', async () => {
      // Arrange
      const targetLanguage = 'de'
      const forSubtitle = [1, 2, 3]
      const response = { count: 3, translatedLanguage: 'de' }
      mockHttpClient.post.mockResolvedValue({ data: response })

      // Act
      const result = await api.translate(targetLanguage, undefined, forSubtitle)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/translate', {
        language: targetLanguage,
        forSubtitle: forSubtitle,
      })
      expect(result.count).toBe(3)
    })

    it('converts single forAudio to array', async () => {
      // Arrange
      const targetLanguage = 'fr'
      const forAudio = 'audio-single'
      mockHttpClient.post.mockResolvedValue({
        data: { count: 5, translatedLanguage: 'fr' },
      })

      // Act
      await api.translate(targetLanguage, forAudio)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/translate', {
        language: targetLanguage,
        forAudio: ['audio-single'],
      })
    })

    it('makes POST to /subtitles/translate with correct payload', async () => {
      // Arrange
      const language = 'es'
      const forAudio = ['audio-1']
      const forSubtitle = [10, 20]
      mockHttpClient.post.mockResolvedValue({
        data: { count: 2, translatedLanguage: 'es' },
      })

      // Act
      await api.translate(language, forAudio, forSubtitle)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledOnce()
      expect(mockHttpClient.post).toHaveBeenCalledWith('/subtitles/translate', {
        language: language,
        forAudio: forAudio,
        forSubtitle: forSubtitle,
      })
    })

    it('returns {count: number, translatedLanguage: string}', async () => {
      // Arrange
      const response = { count: 15, translatedLanguage: 'uk' }
      mockHttpClient.post.mockResolvedValue({ data: response })

      // Act
      const result = await api.translate('uk', ['audio-1'])

      // Assert
      expect(result).toHaveProperty('count')
      expect(result).toHaveProperty('translatedLanguage')
      expect(typeof result.count).toBe('number')
      expect(typeof result.translatedLanguage).toBe('string')
    })
  })

  describe('update(id, data)', () => {
    it('updates text, startTime, endTime fields', async () => {
      // Arrange
      const subtitleId = 42
      const updates = {
        text: 'Updated text',
        startTime: 5.0,
        endTime: 10.0,
      }
      const updatedSubtitle = { id: subtitleId, ...updates }
      mockHttpClient.patch.mockResolvedValue({ data: updatedSubtitle })

      // Act
      const result = await api.update(subtitleId, updates)

      // Assert
      expect(result.text).toBe(updates.text)
      expect(result.startTime).toBe(updates.startTime)
      expect(result.endTime).toBe(updates.endTime)
    })

    it('makes PATCH request to /subtitles/:id', async () => {
      // Arrange
      const subtitleId = 99
      const updates = { text: 'New text' }
      mockHttpClient.patch.mockResolvedValue({
        data: { id: subtitleId, ...updates },
      })

      // Act
      await api.update(subtitleId, updates)

      // Assert
      expect(mockHttpClient.patch).toHaveBeenCalledOnce()
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `/subtitles/${subtitleId}`,
        updates
      )
    })

    it('allows partial updates', async () => {
      // Arrange
      const subtitleId = 50
      const updates = { text: 'Only text updated' }
      mockHttpClient.patch.mockResolvedValue({
        data: { id: subtitleId, text: updates.text, startTime: 0, endTime: 1 },
      })

      // Act
      const result = await api.update(subtitleId, updates)

      // Assert
      expect(result.text).toBe(updates.text)
      expect(result.startTime).toBeDefined()
      expect(result.endTime).toBeDefined()
    })
  })

  describe('delete(id)', () => {
    it('deletes subtitle by ID', async () => {
      // Arrange
      const subtitleId = 77
      const deleteResponse = { success: true, deletedId: subtitleId }
      mockHttpClient.delete.mockResolvedValue({ data: deleteResponse })

      // Act
      const result = await api.delete(subtitleId)

      // Assert
      expect(result).toEqual(deleteResponse)
      expect(result.success).toBe(true)
    })

    it('makes DELETE request to /subtitles/:id', async () => {
      // Arrange
      const subtitleId = 88
      mockHttpClient.delete.mockResolvedValue({ data: { success: true } })

      // Act
      await api.delete(subtitleId)

      // Assert
      expect(mockHttpClient.delete).toHaveBeenCalledOnce()
      expect(mockHttpClient.delete).toHaveBeenCalledWith(`/subtitles/${subtitleId}`)
    })

    it('handles error when deleting non-existent subtitle', async () => {
      // Arrange
      const invalidId = 999
      mockHttpClient.delete.mockRejectedValue(new Error('Subtitle not found'))

      // Act & Assert
      await expect(api.delete(invalidId)).rejects.toThrow('Subtitle not found')
    })
  })

  describe('getAllLanguages(forAudio)', () => {
    it('returns array of available languages', async () => {
      // Arrange
      const audioId = 'audio-123'
      const languages = ['en', 'uk', 'de', 'fr']
      mockHttpClient.get.mockResolvedValue({ data: languages })

      // Act
      const result = await api.getAllLanguages(audioId)

      // Assert
      expect(result).toEqual(languages)
      expect(Array.isArray(result)).toBe(true)
    })

    it('makes GET request to /subtitles/languages', async () => {
      // Arrange
      const audioId = 'audio-456'
      mockHttpClient.get.mockResolvedValue({ data: [] })

      // Act
      await api.getAllLanguages(audioId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledOnce()
      expect(mockHttpClient.get).toHaveBeenCalledWith('/subtitles/languages', {
        params: { 'For audio': audioId },
      })
    })
  })
})
