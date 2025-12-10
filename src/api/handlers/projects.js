import apiClient from './client'

export const projectsApi = {
  /**
   * Отримати список всіх проектів
   * GET /project/all
   */
  async getAll() {
    const response = await apiClient.get('/project/all')
    return response.data
  },

  /**
   * Отримати поточний проект
   * GET /project
   */
  async getCurrent() {
    const response = await apiClient.get('/project')
    return response.data
  },

  /**
   * Вибрати проект (встановлює cookie)
   * POST /project/select
   * @param {string} projectId - ID проекту
   */
  async select(projectId) {
    const response = await apiClient.post('/project/select', {
      id: projectId,
    })
    return response.data
  },

  /**
   * Створити новий проект
   * POST /project
   * @param {Object} data - Дані проекту
   * @param {string} data.name - Назва проекту
   * @param {string} data.description - Опис проекту
   */
  async create(data) {
    const response = await apiClient.post('/project', data)
    return response.data
  },

  /**
   * Оновити проект
   * PATCH /project
   * @param {Object} data - Дані для оновлення
   */
  async update(data) {
    const response = await apiClient.patch('/project', data)
    return response.data
  },

  /**
   * Видалити проект
   * DELETE /project
   */
  async delete() {
    const response = await apiClient.delete('/project')
    return response.data
  },

  /**
   * Скасувати останню дію
   * POST /project/undo
   */
  async undo() {
    const response = await apiClient.post('/project/undo')
    return response.data
  },

  /**
   * Повторити останню скасовану дію
   * POST /project/redo
   */
  async redo() {
    const response = await apiClient.post('/project/redo')
    return response.data
  },
}

export default projectsApi
