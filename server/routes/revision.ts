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

const { fetchRevisions } = require('../common');

export const revision = async (req, res) => {
    let wikiRevIds = req.query.wikiRevIds;
    let wikiToRevisionList = await fetchRevisions(wikiRevIds);
    res.send(wikiToRevisionList);

    req.visitor
        .event({ ec: "api", ea: "/revision/:wikiRevId" })
        .send();
};
export const revisionWikiRevId = async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let wiki = wikiRevId.split(':')[0];
    let wikiToRevisionList = await fetchRevisions( [wikiRevId]);
    let revisions = wikiToRevisionList[wiki];
    if (revisions.length === 1) {
        res.send(revisions[0]);
    } else if (revisions.length === 0) {
        res.status(404);
        res.send(`Can't find revisions`); // TODO(xinbenlv) Handle this case
    } else {
        res.status(500);
        res.send(`Something is wrong`);
    }

    req.visitor
        .event({ ec: "api", ea: "/revision/:wikiRevId" })
        .send();
};
