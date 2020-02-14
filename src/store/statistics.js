/*
 *
 * Copyright (c) 2019-present for NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import Lock from './lock'
import { getNetworkTransactionFees, getEffectiveRentalFees } from '../infrastructure/getStatistics'

const LOCK = Lock.create()

export default {
  namespaced: true,
  state: {
    // If the state has been initialized.
    initialized: false,
    loading: false,
    error: false,
    networkTransactionFees: [],
    networkRentalFees: []
  },
  getters: {
    getInitialized: state => state.initialized,
    getLoading: state => state.loading,
    getError: state => state.error,
    getNetworkTransactionFees: state => state.networkTransactionFees,
    getNetworkRentalFees: state => state.networkRentalFees
  },
  mutations: {
    setInitialized: (state, initialized) => { state.initialized = initialized },
    setLoading: (state, loading) => { state.loading = loading },
    setError: (state, error) => { state.error = error },
    setNetworkTransactionFees: (state, networkTransactionFees) => { state.networkTransactionFees = networkTransactionFees },
    setNetworkRentalFees: (state, networkRentalFees) => { state.networkRentalFees = networkRentalFees }
  },
  actions: {
    // Initialize the statistics model.
    async initialize({ commit, dispatch, getters }) {
      const callback = async () => {
        await dispatch('initializePage')
      }
      await LOCK.initialize(callback, commit, dispatch, getters)
    },

    // Uninitialize the statistics model.
    async uninitialize({ commit, dispatch, getters }) {
      const callback = async () => {}
      await LOCK.uninitialize(callback, commit, dispatch, getters)
    },

    // Fetch data from the SDK / API and initialize the page.
    async initializePage({ commit }) {
      commit('setLoading', true)
      commit('setError', false)
      try {
        let netoworkTransactionFees = await getNetworkTransactionFees()
        let effectiveRentalFees = await getEffectiveRentalFees()
        commit('setNetworkTransactionFees', netoworkTransactionFees)
        commit('setNetworkRentalFees', effectiveRentalFees)
      } catch (e) {
        console.error(e)
        commit('setError', true)
      }
      commit('setLoading', false)
    }
  }
}