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

import { flags } from './flags';

import { root } from './root';
import { diff, diffWikiRevId } from './diff';
import { avatar } from './avatar';
import { getInteraction, listInteractions, updateInteraction } from './interaction';
import { listRecentChanges } from './recentchanges';
const { ores, oresWikiRevId } = require('./ores');
const { revision, revisionWikiRevId } = require('./revision');
const { listLabels } = require('./label');
const { markedRevsCsv, markedCsv, markedRevs, marked } = require('./marked');
const leaderboard = require('./leaderboard');
const { basic, labelsTimeSeries, champion } = require('./stats');
const { latest, latestRevs } = require('./latest');

const mediawiki = require('./mediawiki');
const version = require('./version');

export default {
    basic, labelsTimeSeries, champion,
    root,
    diff,
    diffWikiRevId,
    listRecentChanges,
    ores,
    oresWikiRevId,
    revision,
    revisionWikiRevId,
    getInteraction,
    listInteractions,
    updateInteraction,

    listLabels,
    markedRevsCsv,
    markedCsv,
    markedRevs,
    marked,
    leaderboard,
    avatar,
    latest,
    latestRevs,
    flags,
    mediawiki,
    version,
};
