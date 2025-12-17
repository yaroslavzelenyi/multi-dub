import projectsApi from './projects'
import audiofilesApi from './audiofiles'
import subtitlesApiOriginal from './subtitles'
import diarizationApi from './diarization'
import mappingsApi from './mappings'
import modelsApi from './models'
import voicingApi from './voicing'
import apiClient from './client'

// Ініціалізуємо API, які є функціями
const initializedAudiofilesApi = audiofilesApi(apiClient)
const initializedSubtitlesApi = subtitlesApiOriginal(apiClient)

// Експортуємо audioApi як initializedAudiofilesApi для сумісності
export const audioApi = initializedAudiofilesApi
export const subtitlesApi = initializedSubtitlesApi

export {
  projectsApi,
  initializedAudiofilesApi as audioApiFiles,
  diarizationApi,
  mappingsApi,
  modelsApi,
  voicingApi,
  apiClient,
}

// Експортуємо для default export
export default {
  projectsApi,
  audioApi: initializedAudiofilesApi, // Замінюємо на audiofilesApi
  subtitlesApi: initializedSubtitlesApi, // Ініціалізований subtitlesApi
  diarizationApi,
  mappingsApi,
  modelsApi,
  voicingApi,
  apiClient,
}
