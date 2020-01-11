// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Avatars = require('@dicebear/avatars').default;
const sprites = require('@dicebear/avatars-identicon-sprites').default;
const avatars = new Avatars(sprites, {});
const { logger } = require('../common');

module.exports = async (req, res) => {
    logger.debug(`avatar requested with seed`, req.params.seed);
    let svg = avatars.create(req.params.seed);
    res.send(svg);
    req.visitor
        .event({ ec: "api", ea: "/avatar/:seed" })
        .send();
}
