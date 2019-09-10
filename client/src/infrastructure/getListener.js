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

import { Listener } from 'nem2-sdk';
import store from "../store"
import format from "../format"

const nodeEndPoint = '52.194.207.217:3000';
const wsEndpoint = 'ws://' + nodeEndPoint;

class sdkListener {
    static getNewBlock() {
        const listener = new Listener(wsEndpoint, WebSocket)
        listener.open().then(() => {
            listener
                .newBlock()
                .subscribe(
                    (block) => {
                        store.dispatch(
                            'ADD_BLOCK',
                            format.formatBlock(block),
                            { root: true },
                        );
                        store.dispatch(
                            'SET_LATEST_CHAIN_STATUS',
                            format.formatBlock(block),
                            { root: true },
                        );
                    },
                    err => console.log(err),
                );
        });
    }
}

export default sdkListener;
