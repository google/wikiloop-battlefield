const MongoClient = require('mongodb').MongoClient;
let db;
(async () => {
    db = (await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }))
    .db(process.env.MONGODB_DB);
})();

const logger = new (require('heroku-logger').Logger)({
    level: process.env.LOG_LEVEL || 'debug',
    delimiter: " | ",
    prefix: 'index'
});

const apiLogger = new (require('heroku-logger').Logger)({
    level: process.env.LOG_LEVEL || 'debug',
    delimiter: " | ",
    prefix: 'api'
});

// TODO: merged with shared/utility
function getUrlBaseByWiki(wiki) {
    let wikiToLang = {
        'enwiki': 'en',
        'frwiki': 'fr',
        'ruwiki': 'ru'
    };
    return `https://${wikiToLang[wiki]}.wikipedia.org`; // Require HTTPS to conduct the write edits
}

function computeOresField(oresJson, wiki, revId) {
    let damagingScore = oresJson.damagingScore || (oresJson[wiki].scores[revId].damaging.score && oresJson[wiki].scores[revId].damaging.score.probability.true);
    let badfaithScore = oresJson.badfaithScore || (oresJson[wiki].scores[revId].goodfaith.score && oresJson[wiki].scores[revId].goodfaith.score.probability.false);
    let damaging = oresJson.damaging || (oresJson[wiki].scores[revId].damaging.score && oresJson[wiki].scores[revId].damaging.score.prediction);
    let badfaith = oresJson.badfaith || (oresJson[wiki].scores[revId].goodfaith.score && !oresJson[wiki].scores[revId].goodfaith.score.prediction);
    return {
        wikiRevId: `${wiki}:${revId}`,
        damagingScore: damagingScore,
        damaging: damaging,
        badfaithScore: badfaithScore,
        badfaith: badfaith
    }
}

async function fetchRevisions(wiki, revIds = []) {
    if (revIds.length > 0) {
        const fetchUrl = new URL(`${getUrlBaseByWiki(wiki)}/w/api.php`);
        let params = {
            "action": "query",
            "format": "json",
            "prop": "revisions|info",
            "indexpageids": 1,
            "revids": revIds.join('|'),
            "rvprop": "ids|timestamp|flags|user|tags|size|comment",
            "rvslots": "main"
        };
        Object.keys(params).forEach(key => {
            fetchUrl.searchParams.set(key, params[key]);
        });
        let retJson = await rp.get(fetchUrl, { json: true });
        if (retJson.query.badrevids) {
            return []; // does not find
        }
        else {
            /** Example
            {
                "batchcomplete": "",
                "query": {
                    "pageids": [
                        "16377",
                        "103072"
                    ],
                    "pages": {
                        "16377": {
                            "pageid": 16377,
                            "ns": 104,
                            "title": "API:Query",
                            "revisions": [
                                {
                                    "revid": 3319487,
                                    "parentid": 3319442,
                                    "minor": "",
                                    "user": "Shirayuki",
                                    "timestamp": "2019-07-16T22:08:58Z",
                                    "size": 15845,
                                    "comment": "",
                                    "tags": []
                                }
                            ],
                            "contentmodel": "wikitext",
                            "pagelanguage": "en",
                            "pagelanguagehtmlcode": "en",
                            "pagelanguagedir": "ltr",
                            "touched": "2019-07-17T03:10:17Z",
                            "lastrevid": 3319487,
                            "length": 15845
                        },
                        "103072": {
                            "pageid": 103072,
                            "ns": 104,
                            "title": "API:Lists/All",
                            "revisions": [
                                {
                                    "revid": 2287599,
                                    "parentid": 2287488,
                                    "user": "Wargo",
                                    "timestamp": "2016-11-17T16:49:59Z",
                                    "size": 924,
                                    "comment": "Undo revision 2287488 by [[Special:Contributions/Jkmartindale|Jkmartindale]] ([[User talk:Jkmartindale|talk]])",
                                    "tags": []
                                }
                            ],
                            "contentmodel": "wikitext",
                            "pagelanguage": "en",
                            "pagelanguagehtmlcode": "en",
                            "pagelanguagedir": "ltr",
                            "touched": "2019-07-18T04:14:03Z",
                            "lastrevid": 2287599,
                            "length": 924
                        }
                    }
                }
            }
             */
            let revIdToRevision = {};
            for (let pageId of retJson.query.pageids) {
                for (let revision of retJson.query.pages[pageId].revisions) {
                    revIdToRevision[revision.revid] = revision;
                    revIdToRevision[revision.revid].title = retJson.query.pages[pageId].title;
                    revIdToRevision[revision.revid].wiki = wiki;
                    revIdToRevision[revision.revid].wikiRevId = `${wiki}:${revision.revid}`;
                    revIdToRevision[revision.revid].pageLatestRevId = retJson.query.pages[pageId].lastrevid;
                    revIdToRevision[revision.revid].namespace = revision.ns;
                }
            }
            return revIds.map(revId => revIdToRevision[revId]);
        }
    }
}

async function getNewJudgementCounts(db, matcher = {}, offset = 0, limit = 10) {
    return await db.collection(`Interaction`).aggregate([
        {
            $match: matcher
        },
        {
            "$group": {
                "_id": {
                    "wikiRevId": "$wikiRevId"
                },
                "wikiRevId": {
                    "$first": "$wikiRevId"
                },
                "judgements": {
                    "$push": {
                        "judgement": "$judgement",
                        "userGaId": "$userGaId",
                        "timestamp": "$timestamp"
                    }
                },
                "totalCounts": {
                    "$sum": 1
                },
                "shouldRevertCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "ShouldRevert"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "notSureCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "NotSure"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "looksGoodCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "LooksGood"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "lastTimestamp": {
                    "$max": "$timestamp"
                },
                "recentChange": {
                    "$first": "$recentChange"
                }
            }
        },
        {
            "$project": {
                "wikiRevId": "$_id.wikiRevId",
                "judgements": "$judgements",
                "recentChange": 1,
                "lastTimestamp": 1,
                "counts.Total": "$totalCounts",
                "counts.ShouldRevert": "$shouldRevertCounts",
                "counts.NotSure": "$notSureCounts",
                "counts.LooksGood": "$looksGoodCounts"
            }
        },
        {
            "$match": {
                "recentChange.ores": {
                    "$exists": true,
                    "$ne": null
                },
                "recentChange.wiki": {
                    "$exists": true,
                    "$ne": null
                },
                "lastTimestamp": {
                    "$exists": true,
                    "$ne": null
                }
            }
        },
        {
            "$sort": {
                "lastTimestamp": -1
            }
        },
    ],
        {
            "allowDiskUse": true
        })
        .skip(offset)
        .limit(limit)
        .toArray();

    /**
     * Example of output schema:
     {
        "_id":{
          "wikiRevId":"enwiki:905704873"
        },
  
        "lastTimestamp":"1562791937",
        "recentChange":{
          "_id":"enwiki-1169325920",
          "id":"1169325920",
          "title":"Financial endowment",
          "namespace":"0",
          "revision":{
            "new":"905704873",
            "old":"900747399"
          },
          "ores":{
            "damagingScore":"0.8937388482947232",
            "damaging":"true",
            "badfaithScore":"0.8787846798198944",
            "badfaith":"true"
          },
          "user":"<userId or IP>>",
          "wiki":"enwiki",
          "timestamp":"1562791912"
        },
        "wikiRevId":"enwiki:905704873",
        "judgements":[
          {
            "judgement":"ShouldRevert",
            "userGaId":"<userGaId>",
            "timestamp":"1562791937"
          }
        ],
        "counts":{
          "Total":1,
          "ShouldRevert":1,
          "NotSure":0,
          "LooksGood":0
        }
     }
     */
}

function isEmpty(value) {
    return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}

const useOauth = !isEmpty(process.env.MEDIAWIKI_CONSUMER_SECRET) && !isEmpty(process.env.MEDIAWIKI_CONSUMER_KEY);

module.exports = {
    db,
    logger,
    apiLogger,
    getUrlBaseByWiki,
    computeOresField,
    fetchRevisions,
    getNewJudgementCounts,
    useOauth,
    isEmpty
};