import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectsApi } from '@/api/handlers/projects'

// Mock the API client
vi.mock('@/api/handlers/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from '@/api/handlers/client'

describe('Projects API Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll()', () => {
    it('returns array of projects with {id, name, description} structure', async () => {
      // Arrange
      const mockProjects = [
        { id: '1', name: 'Project 1', description: 'First project' },
        { id: '2', name: 'Project 2', description: 'Second project' },
        { id: '3', name: 'Project 3', description: 'Third project' },
      ]
      apiClient.get.mockResolvedValue({ data: mockProjects })

      // Act
      const result = await projectsApi.getAll()

      // Assert
      expect(result).toEqual(mockProjects)
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('description')
    })

    it('makes GET request to /project/all endpoint', async () => {
      // Arrange
      apiClient.get.mockResolvedValue({ data: [] })

      // Act
      await projectsApi.getAll()

      // Assert
      expect(apiClient.get).toHaveBeenCalledOnce()
      expect(apiClient.get).toHaveBeenCalledWith('/project/all')
    })

    it('handles network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network error')
      apiClient.get.mockRejectedValue(networkError)

      // Act & Assert
      await expect(projectsApi.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('create(data)', () => {
    it('creates project with valid {name, description}', async () => {
      // Arrange
      const projectData = {
        name: 'New Project',
        description: 'Project description',
      }
      const createdProject = {
        id: 'generated-id-123',
        ...projectData,
      }
      apiClient.post.mockResolvedValue({ data: createdProject })

      // Act
      const result = await projectsApi.create(projectData)

      // Assert
      expect(result).toEqual(createdProject)
      expect(result.id).toBeDefined()
      expect(result.name).toBe(projectData.name)
      expect(result.description).toBe(projectData.description)
    })

    it('returns created project with generated id', async () => {
      // Arrange
      const projectData = { name: 'Test', description: 'Test desc' }
      const createdProject = { id: 'auto-generated-uuid', ...projectData }
      apiClient.post.mockResolvedValue({ data: createdProject })

      // Act
      const result = await projectsApi.create(projectData)

      // Assert
      expect(result.id).toBeTruthy()
      expect(typeof result.id).toBe('string')
    })

    it('makes POST request to /project with correct payload', async () => {
      // Arrange
      const projectData = {
        name: 'API Test Project',
        description: 'Testing API',
      }
      apiClient.post.mockResolvedValue({ data: { id: '1', ...projectData } })

      // Act
      await projectsApi.create(projectData)

      // Assert
      expect(apiClient.post).toHaveBeenCalledOnce()
      expect(apiClient.post).toHaveBeenCalledWith('/project', projectData)
    })

    it('rejects creation when name field is missing', async () => {
      // Arrange
      const invalidData = { description: 'No name provided' }
      apiClient.post.mockRejectedValue(new Error('Name is required'))

      // Act & Assert
      await expect(projectsApi.create(invalidData)).rejects.toThrow('Name is required')
    })
  })

  describe('select(projectId)', () => {
    it('selects project by ID via POST to /project/select', async () => {
      // Arrange
      const projectId = 'project-123'
      const response = { success: true, selectedProject: { id: projectId } }
      apiClient.post.mockResolvedValue({ data: response })

      // Act
      const result = await projectsApi.select(projectId)

      // Assert
      expect(apiClient.post).toHaveBeenCalledOnce()
      expect(apiClient.post).toHaveBeenCalledWith('/project/select', {
        id: projectId,
      })
    })

    it('returns success response', async () => {
      // Arrange
      const projectId = 'test-id'
      const successResponse = { success: true, message: 'Project selected' }
      apiClient.post.mockResolvedValue({ data: successResponse })

      // Act
      const result = await projectsApi.select(projectId)

      // Assert
      expect(result).toEqual(successResponse)
      expect(result.success).toBe(true)
    })

    it('throws error for non-existent project ID', async () => {
      // Arrange
      const invalidId = 'non-existent-id'
      apiClient.post.mockRejectedValue(new Error('Project not found'))

      // Act & Assert
      await expect(projectsApi.select(invalidId)).rejects.toThrow('Project not found')
    })
  })

  describe('getCurrent()', () => {
    it('returns currently selected project object', async () => {
      // Arrange
      const currentProject = {
        id: 'current-123',
        name: 'Active Project',
        description: 'Currently selected',
      }
      apiClient.get.mockResolvedValue({ data: currentProject })

      // Act
      const result = await projectsApi.getCurrent()

      // Assert
      expect(result).toEqual(currentProject)
      expect(result.id).toBe('current-123')
    })

    it('returns null when no project is selected', async () => {
      // Arrange
      apiClient.get.mockResolvedValue({ data: null })

      // Act
      const result = await projectsApi.getCurrent()

      // Assert
      expect(result).toBeNull()
    })

    it('makes GET request to /project', async () => {
      // Arrange
      apiClient.get.mockResolvedValue({ data: null })

      // Act
      await projectsApi.getCurrent()

      // Assert
      expect(apiClient.get).toHaveBeenCalledOnce()
      expect(apiClient.get).toHaveBeenCalledWith('/project')
    })
  })

  describe('update(data)', () => {
    it('updates project name and description', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
      }
      const updatedProject = {
        id: 'project-123',
        ...updateData,
      }
      apiClient.patch.mockResolvedValue({ data: updatedProject })

      // Act
      const result = await projectsApi.update(updateData)

      // Assert
      expect(result.name).toBe(updateData.name)
      expect(result.description).toBe(updateData.description)
    })

    it('makes PATCH request to /project', async () => {
      // Arrange
      const updateData = { name: 'New Name' }
      apiClient.patch.mockResolvedValue({ data: { id: '1', ...updateData } })

      // Act
      await projectsApi.update(updateData)

      // Assert
      expect(apiClient.patch).toHaveBeenCalledOnce()
      expect(apiClient.patch).toHaveBeenCalledWith('/project', updateData)
    })

    it('returns updated project object', async () => {
      // Arrange
      const updateData = { name: 'Modified', description: 'Modified desc' }
      const updatedProject = { id: 'abc', ...updateData, updatedAt: '2025-01-01' }
      apiClient.patch.mockResolvedValue({ data: updatedProject })

      // Act
      const result = await projectsApi.update(updateData)

      // Assert
      expect(result).toEqual(updatedProject)
      expect(result.id).toBeDefined()
    })
  })

  describe('delete()', () => {
    it('deletes project', async () => {
      // Arrange
      const deleteResponse = { success: true, message: 'Project deleted' }
      apiClient.delete.mockResolvedValue({ data: deleteResponse })

      // Act
      const result = await projectsApi.delete()

      // Assert
      expect(result).toEqual(deleteResponse)
      expect(result.success).toBe(true)
    })

    it('makes DELETE request to /project', async () => {
      // Arrange
      apiClient.delete.mockResolvedValue({ data: { success: true } })

      // Act
      await projectsApi.delete()

      // Assert
      expect(apiClient.delete).toHaveBeenCalledOnce()
      expect(apiClient.delete).toHaveBeenCalledWith('/project')
    })

    it('handles error when deleting non-existent project', async () => {
      // Arrange
      apiClient.delete.mockRejectedValue(new Error('No project selected'))

      // Act & Assert
      await expect(projectsApi.delete()).rejects.toThrow('No project selected')
    })
  })

  describe('undo()', () => {
    it('calls undo endpoint', async () => {
      // Arrange
      const undoResponse = { success: true, action: 'undone' }
      apiClient.post.mockResolvedValue({ data: undoResponse })

      // Act
      const result = await projectsApi.undo()

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/project/undo')
      expect(result).toEqual(undoResponse)
    })
  })

  describe('redo()', () => {
    it('calls redo endpoint', async () => {
      // Arrange
      const redoResponse = { success: true, action: 'redone' }
      apiClient.post.mockResolvedValue({ data: redoResponse })

      // Act
      const result = await projectsApi.redo()

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/project/redo')
      expect(result).toEqual(redoResponse)
    })
  })
})
