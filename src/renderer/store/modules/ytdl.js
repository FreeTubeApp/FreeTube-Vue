import ytdl from 'ytdl-core'
import ytsr from 'ytsr'
import ytpl from 'ytpl'

import IsEqual from 'lodash.isequal'
import fork from 'child_process'

const state = {
  main: 0,
  isYtSearchRunning: false,
  scrapeProcess: fork.fork('D:\\Workspace\\JavaScript\\FreeTube-Vue\\src\\processes\\index.js', ['args'], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
}

const getters = {
  getMain ({ state }) {
    return state.main
  },
  getScrapeProcess() {
    return state.scrapeProcess
  }
}

const actions = {
  ytSearch ({ commit, dispatch, rootState }, payload) {
    console.log('Performing search please wait...')
    return new Promise((resolve, reject) => {
      if (state.isYtSearchRunning) {
        console.log('search is running. please try again')
        resolve(false)
      }

      const defaultFilters = {
        sortBy: 'relevance',
        time: '',
        type: 'all',
        duration: ''
      }

      commit('toggleIsYtSearchRunning')

      if (!IsEqual(defaultFilters, rootState.utils.searchSettings)) {
        dispatch('ytSearchGetFilters', payload).then((filter) => {
          if (typeof (payload.options.nextpageRef) === 'undefined' && filter !== payload.query) {
            payload.options.nextpageRef = filter
          }

          ytsr(payload.query, payload.options).then((result) => {
            console.log(result)
            console.log('done')
            resolve(result)
          }).catch((err) => {
            console.log(err)
            reject(err)
          }).finally(() => {
            commit('toggleIsYtSearchRunning')
          })
        })
      } else {
        ytsr(payload.query, payload.options).then((result) => {
          console.log(result)
          console.log('done')
          resolve(result)
        }).catch((err) => {
          console.log(err)
          reject(err)
        }).finally(() => {
          commit('toggleIsYtSearchRunning')
        })
      }
    })
  },

  ytSearchGetFilters ({ rootState }, payload) {
    return new Promise((resolve) => {
      let filter = payload.query
      let searchSettings = payload.searchSettings

      if (typeof (searchSettings) === 'undefined') {
        searchSettings = rootState.utils.searchSettings
      }

      console.log(searchSettings)

      // This is extremely ugly, though this is the recommended way to accomplish this
      // in the GitHub documentation
      console.log(`Current ref: ${filter}`)
      ytsr.getFilters(filter).then((filters) => {
        if (searchSettings.type !== 'all') {
          filter = filters.get('Type').find(o => o.name.toLowerCase().includes(rootState.utils.searchSettings.type)).ref
        }

        console.log(`Current ref: ${filter}`)
        ytsr.getFilters(filter).then((filters) => {
          if (searchSettings.time !== '') {
            filter = filters.get('Upload date').find(o => o.name.toLowerCase().includes(rootState.utils.searchSettings.time)).ref
          }

          console.log(`Current ref: ${filter}`)
          ytsr.getFilters(filter).then((filters) => {
            if (searchSettings.duration !== '') {
              filter = filters.get('Duration').find(o => o.name.toLowerCase().includes(rootState.utils.searchSettings.duration)).ref
            }

            console.log(`Current ref: ${filter}`)
            ytsr.getFilters(filter).then((filters) => {
              if (searchSettings.sortBy !== 'relevance') {
                const sortBy = rootState.utils.searchSettings.sortBy.replace('_', ' ')
                filter = filters.get('Sort by').find(o => o.name.toLowerCase().includes(sortBy)).ref
              }

              console.log(`Final ref: ${filter}`)
              resolve(filter)
            })
          })
        })
      })
    })
  },

  ytGetPlaylistInfo (_, playlistId) {
    return new Promise((resolve, reject) => {
      console.log(playlistId)
      console.log('Getting playlist info please wait...')
      ytpl(playlistId, { limit: 0 }).then((result) => {
        resolve(result)
      }).catch((err) => {
        reject(err)
      })
    })
  },

  ytGetVideoInformation (_, videoId) {
    return new Promise((resolve, reject) => {
      console.log('Getting video info please wait...')
      ytdl.getInfo(videoId).then((result) => {
        resolve(result)
      }).catch((err) => {
        reject(err)
      })
    })
  }
}

const mutations = {
  toggleIsYtSearchRunning (state) {
    state.isYtSearchRunning = !state.isYtSearchRunning
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
