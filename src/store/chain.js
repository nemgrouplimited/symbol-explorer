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
import sdkDiagnostic from '../infrastructure/getDiagnostic'
import apiMarketData from '../infrastructure/getMarketData'

const LOCK = Lock.create()

export default {
    namespaced: true,
    state: {
        // If the state has been initialized.
        initialized: false,
        // The current block height.
        blockHeight: 0,
        // The latest transaction hash.
        transactionHash: '',
        // The chain info.
        chainInfo: {
            // The total transactions.
            numTransactions: 0,
            // The total Accounts.
            numAccounts: 0
        },
        // The Market Data.
        marketData: {
            marketCap: 0,
            price: 0,
            historicalHourlyGraph: {}
        }
    },
    getters: {
        getInitialized: state => state.initialized,
        getBlockHeight: state => state.blockHeight,
        getTransactionHash: state => state.transactionHash,
        getChainInfo: state => state.chainInfo,
        getMarketData: state => state.marketData
    },
    mutations: {
        setInitialized: (state, initialized) => {
            state.initialized = initialized
        },
        setBlockHeight: (state, blockHeight) => {
            state.blockHeight = blockHeight
        },
        setTransactionHash: (state, transactionHash) => {
            state.transactionHash = transactionHash
        },
        setChainInfo: (state, chainInfo) => {
            state.chainInfo.numTransactions = chainInfo.numTransactions
            state.chainInfo.numAccounts = chainInfo.numAccounts
        },
        setMarketData: (state, { marketData, graphData }) => {
            state.marketData.price = marketData.XEM.USD.PRICE
            state.marketData.marketCap = marketData.XEM.USD.MKTCAP
            state.marketData.historicalHourlyGraph = graphData
        }
    },
    actions: {
        // Initialize the chain model.
        async initialize({ commit, dispatch, getters }) {
            const callback = async () => {
                await dispatch('initializePage')
            }
            await LOCK.initialize(callback, commit, dispatch, getters)
        },

        // Uninitialize the chain model.
        async uninitialize({ commit, dispatch, getters }) {
            const callback = async () => {}
            await LOCK.uninitialize(callback, commit, dispatch, getters)
        },

        // Fetch data from the SDK / API and initialize the page.
        async initializePage({ commit }) {
            let chainInfo = await sdkDiagnostic.getChainInfo()
            commit('setChainInfo', chainInfo)

            let marketData = await apiMarketData.getXemPriceData()
            let xemGraph = await apiMarketData.getXemHistoricalHourlyGraph()

            let graphData = []
            if (xemGraph) {
                xemGraph.Data.map((item, index) => {
                    let graphDataItem = {}
                    graphDataItem.y = []
                    graphDataItem.x = new Date(item['time'] * 1000)
                    graphDataItem.y[0] = item['open'] // parseFloat(item['open']).toFixed(4)
                    graphDataItem.y[1] = item['high'] // parseFloat(item['high']).toFixed(4)
                    graphDataItem.y[2] = item['low'] // parseFloat(item['low']).toFixed(4)
                    graphDataItem.y[3] = item['close'] // parseFloat(item['close']).toFixed(4)
                    graphData.push(graphDataItem)
                })
            }
            commit('setMarketData', { marketData, graphData })
        }
    }
}
