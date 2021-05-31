<!--
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<template>
  <section>
    <div v-bind:class="{
        'border-danger': ores ? ores.goodfaith.false > 0.5 : false,
        'border-warning': ores ? ores.damaging.true > 0.5 : false,
        'bg-light': revision ? revision.pageLatestRevId > revision.revid : false
        }"
         class="card shadow h-100">
      <div v-if="revision" class="card-body d-flex flex-column small-screen-padding">
        <h5 class="card-title ">
          <div class="d-flex">
            <div class="flex-grow-1">
              [[<a :href="`${getUrlBaseByWiki(revision.wiki)}/wiki/${revision.title}`" target="_blank">{{ revision.title }}</a>]]
              <sup><a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/Special:Diff/${revision.wikiRevId.split(`:`)[1]}`" target="_blank">
                <small>rev.{{revision.wikiRevId.split(`:`)[1]}}</small>
              </a></sup>
            </div>
            <!-- TODO(xinbenlv) update the following text for for i18n -->
            <div v-if="revision ? revision.pageLatestRevId > revision.revid: false"> {{$t('Label-Overriden')}}</div>
            <div class="ml-2"> <a :href="`/revision/${revision.wiki}/${revision.wikiRevId.split(`:`)[1]}`"><i class="fas fa-link"></i></a></div>
          </div>
          <div class="my-2" v-if="feedNameProp"><small><span class="badge badge-success">{{feedNameProp}} feed</span></small></div>
        </h5>
        <div class="card-subtitle mb-2 text-muted">
          <div class="row p-2">
            <div class="col-lg-2">
              <i class="fas fa-pen"></i><timeago :datetime="getTimeString()" :auto-update="60" :locale="$i18n.locale"></timeago>
            </div>
            <div class="col-lg-2">
              <small><span>by <a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/User:${revision.user}`" target="_blank">{{ revision.user }}</a></span>
              </small>
            </div>
            <div v-if="ores" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top" title="Damaging Score by WMF ORES">
                <!-- TODO(xinbenlv) update the following text for for i18n -->
                <i v-bind:class="{ 'text-danger': ores ? ores.damaging.true > 0.5 : false }" class="fas fa-cloud-rain"></i> {{$t('Label-OresDamaging')}}: <a
                  :href="`https://ores.wikimedia.org/v3/scores/${revision.wikiRevId.split(`:`)[0]}/?revids=${revision.wikiRevId.split(`:`)[1]}`" target="_blank">{{ damagingPercent() }}</a>
              </span>
            </div>
            <div v-if="ores" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top"
                    title="Bad-faith Score by WMF ORES (here Bad-faith = 100% - Goodfaith)">
                <!-- TODO(xinbenlv) update the following text for for i18n -->
                <i v-bind:class="{ 'text-warning': ores ? ores.goodfaith.false > 0.5: false }" class="fas fa-theater-masks"></i> {{$t('Label-OresBadfaith')}}:  <a
                  :href="`https://ores.wikimedia.org/v3/scores/${revision.wikiRevId.split(`:`)[0]}/?revids=${revision.wikiRevId.split(`:`)[1]}`" target="_blank">{{ badfaithPercent() }}</a>
              </span>
            </div>
            <div v-if="stiki" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top"
                    title="Vandalism Score by STiki">
                <i v-bind:class="{ 'text-warning': stiki && stiki > 0.5 ? true : false }" class="fas fa-theater-masks"></i> STiki:  <a
                  :href="`/extra/stiki/${wikiRevId}`" target="_blank">{{ stikiPercent() }}</a>
              </span>
            </div>
            <div v-if="cbng" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top"
                    title="Vandalism Score by ClueBotNG">
                <i v-bind:class="{ 'text-warning': cbng && cbng > 0.5 ? true : false }" class="fas fa-theater-masks"></i> ClueBotNG:  <a
                  :href="`/extra/cbng/${wikiRevId}`" target="_blank">{{ cbngPercent() }}</a>
              </span>
            </div>
          </div>
        </div>
        <div v-if="revision" class="card-subtitle mb-2 text-muted">
          <div class="row p-2">
            <div class="col-12"><b>{{$t('Label-EditSummary')}}:</b>
              <span>{{revision.comment || "(empty)"}}</span>
            </div>
          </div>
        </div>
        <div class="card-text w-100 pl-sm-0">
          <diff-box v-if="diff && diff.compare && diff.compare['*']" v-bind:diffContent="diff.compare['*']"/>
          <!-- TODO(xinbenlv) update the following text for for i18n -->
          <h5 v-else>{{$t(`Message-DiffNotAvailable`)}}
            <div v-on:click="loadDiff()" class="btn btn-outline-primary btn-small"><i class="fas fa-redo"></i></div>
            <!--TODO(zzn): v-if="revision.revision" might not be available, handle those cases better. -->
            <a v-if="revision.revision" class="btn btn-outline-primary" :href="`${getUrlBaseByWiki(revision.wiki)}/w/index.php?title=${revision.title}&diff=${revision.revision.new}&oldid=${revision.revision.old}&diffmode=source`" target="_blank"><i class="fas fa-external-link-alt"></i></a>
          </h5>
        </div>

        <div class="mt-4 d-flex justify-content-center">
          <div v-if="interaction" class="btn-group mx-1">
            <button
              v-on:click="interactionBtn(`LooksGood`)"
              class="btn btn-sm"
              v-bind:class="{ 'btn-success':getMyJudgement() ===`LooksGood`, 'btn-outline-success': getMyJudgement() !==`LooksGood` }"
            >{{$t(`Label-LooksGood`)}} (g)
            </button>
            <button
              v-on:click="interactionBtn(`NotSure`)"
              v-bind:class="{ 'btn-secondary':getMyJudgement() ===`NotSure`, 'btn-outline-secondary':getMyJudgement() !==`NotSure` }"
              class="btn btn-sm"
            >{{$t(`Label-NotSure`)}} (p)

            </button>
            <button
              v-on:click="interactionBtn(`ShouldRevert`)"
              v-bind:class="{ 'btn-danger':getMyJudgement() ===`ShouldRevert`, 'btn-outline-danger':getMyJudgement() !== `ShouldRevert` }"
              class="btn btn-sm" target="_blank"
            >{{$t(`Label-ShouldRevert`)}} (v)
            </button>
            <transition name="fade">
                <button v-if="action === null && enableRevertRedirect()" v-on:click="performRevert()"
                        class="btn btn-outline-primary">
                  <i class="fas fa-broom"></i> {{$t(`Button-RevertNow`)}} (r)
                </button>
              <button disabled v-if="action !== null" class="btn"
                v-bind:class="{
                  'btn-success': action === `DirectReverted` || action === `OpenedUrlToRevert`,
                  'btn-primary': action === `DirectRevertFailed`,
                  'btn-outline-primary': action === null
                }">
                <i class="fas fa-broom"></i>
                <template v-if="action===`DirectReverted`">{{$t(`Label-DirectReverted`)}}</template>
                <template v-else-if="action===`DirectRevertFailed`">{{$t(`Label-DirectRevertFailed`)}}</template>
                <template v-else-if="action===`OpenedUrlToRevert`">{{$t(`Button-OpenedUrlToRevert`)}}</template>
              </button>
            </transition>
          </div>
          <div v-if="myJudgement" class="btn-group mx-1">
            <button
              v-on:click="$emit(`next-card`)"
              v-if="myJudgement"
              class="btn btn-outline-primary"
            ><i class="fas fa-arrow-right"></i> {{$t(`Button-Next`)}}(→)
            </button>
          </div>
        </div>
        <div v-if="interaction && interaction.judgements.length > 0" class="col-lg-12">
          <table class="b-table table mt-2 w-100">
            <tbody>
            <tr class="row">
              <td class="col-4">{{$t('Label-User')}}</td>
              <td class="col-4">{{$t('Label-Judgement')}}</td>
              <td class="col-4">{{$t('Label-Time')}}</td>
            </tr>
            <tr class="row" v-for="judgement of interaction.judgements">
              <td class="col-4">
                <router-link v-if="judgement.wikiUserName" :to="`/history?wikiUserName=${judgement.wikiUserName}`" replace>
                  <object class="avatar-object" v-bind:data="`/api/avatar/${judgement.wikiUserName}`" ></object>
                  <span v-if="isMine(judgement)">{{$t("Label-Me")}} ({{judgement.wikiUserName}})</span>
                  <span v-else>{{judgement.wikiUserName || $t("Label-Anonymous")}}</span>
                </router-link>
                <router-link v-else :to="`/history?userGaId=${judgement.userGaId}`" replace>
                  <object class="avatar-object" v-bind:data="`/api/avatar/${judgement.userGaId}`" ></object>
                  <span v-if="$cookiez.get('_ga') === judgement.userGaId ">{{$t("Label-Me")}}</span>
                  <span v-else>{{$t("Label-Someone")}}</span>
                </router-link>
              </td>
              <td class="col-4">{{$t(`Label-${judgement.judgement}`)}}</td>
              <td class="col-4">{{new Date(judgement.timestamp * 1000).toISOString()}} <br/> (<timeago :locale="$i18n.locale" :datetime="new Date(interaction.lastTimestamp * 1000).toString()" :auto-update="60"></timeago>)</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="card-body d-flex flex-column small-screen-padding">
        <div class="spinner-border" role="status">
          <span class="sr-only">{{$t(`Label-Loading`)}}...</span>
        </div>
      </div>
      <div v-if="enableCesp">
        <div v-if="displayChoiceAuthor && (choiceInfoAuthor.type == 'warning')" v-bind:style="{color: 'red', 'margin-left': '50px', 'margin-right': '50px'}">
          WikiLoop-DoubleCheck has detected suspicious behavior by the author of this revision. Recent revisions by this author have an average ORES damaging score of {{choiceInfoAuthor.percentage}}%. Should a warning be sent on your behalf to the author? <br>
          Previous revisions by this author:
        </div>
        <div v-if="displayChoiceAuthor && (choiceInfoAuthor.type == 'block')" v-bind:style="{color: 'red', 'margin-left': '50px', 'margin-right': '50px'}">
          WikiLoop-DoubleCheck has detected suspicious behavior by the author of this revision. Recent revisions by this author have an average ORES damaging score of {{choiceInfoAuthor.percentage}}%. This author has been warned {{warningThresholdAuthor}} times in the past {{warningTimeframeAuthor}} days. Should a block request be sent on your behalf to the community administrators? <br>
          Previous revisions by this author:
        </div>
        <li v-if= "displayHistoryAuthor" v-for="item in previousRevisionInfosAuthor":key="item.timestamp" v-bind:style="{'margin-left': '65px', 'margin-right': '50px'}">
          <a v-bind:href= "'https://en.wikipedia.org/w/index.php?title='+ item.title + '&diff=prev&oldid=' + item.parentid"> Revision on article {{item.title}}, at {{item.timestamp}}, ORES damaging score: {{item.score}}% </a>
        </li>
        <div class="mt-4 d-flex justify-content-center" v-bind:style = "{'margin-bottom': '30px'}">
          <div v-if="displayChoiceAuthor" class="btn-group mx-1">
            <button
              v-on:click="executeAuthor()"
              class="btn btn-sm"
              v-bind:class="{ 'btn-success': false, 'btn-outline-success': true}"
            >Yes, I agree to send the {{choiceInfoAuthor.type}} message.
            </button>
            <button
              v-on:click="turnOffChoiceAuthor()"
              class="btn btn-sm"
              v-bind:class="{ 'btn-danger': false, 'btn-outline-danger': true}"
            >Skip it for now.
            </button>
          </div>
        </div>
        <div v-if="displayChoiceArticle && (choiceInfoArticle.type == 'articleLogEvent')" v-bind:style="{color: 'red', 'margin-left': '50px', 'margin-right': '50px'}">
          WikiLoop-DoubleCheck has detected suspicious behavior on this article. Recent revisions on this article have an average ORES damaging score of {{choiceInfoArticle.percentage}}%. <br>
          Previous revisions on this article:
        </div>
        <div v-if="displayChoiceArticle && (choiceInfoArticle.type == 'protect')" v-bind:style="{color: 'red', 'margin-left': '50px', 'margin-right': '50px'}">
          WikiLoop-DoubleCheck has detected suspicious behavior on this article. Recent revisions on this article have an average ORES damaging score of {{choiceInfoArticle.percentage}}%. Suspicious behavior has occured {{warningThresholdArticle}} times in the past {{warningTimeframeArticle}} days. Should a page-protect request be sent on your behalf to the community administrators? <br>
          Previous revisions on this article:
        </div>
        <li v-if= "displayHistoryArticle" v-for="item in previousRevisionInfosArticle":key="item.timestamp" v-bind:style="{'margin-left': '65px', 'margin-right': '50px'}">
          <a v-bind:href= "'https://en.wikipedia.org/w/index.php?title='+ item.title + '&diff=prev&oldid=' + item.parentid"> Revision by {{item.author}}, at {{item.timestamp}}, ORES damaging score: {{item.score}}%</a>
        </li>
        <div class="mt-4 d-flex justify-content-center" v-bind:style = "{'margin-bottom': '30px'}">
          <div v-if="displayChoiceArticle && (choiceInfoArticle.type == 'protect')" class="btn-group mx-1">
            <button
              v-on:click="executeArticle()"
              class="btn btn-sm"
              v-bind:class="{ 'btn-success': false, 'btn-outline-success': true}"
            >Yes, I agree to send the page-protect request.
            </button>
            <button
              v-on:click="turnOffChoiceArticle()"
              class="btn btn-sm"
              v-bind:class="{ 'btn-danger': false, 'btn-outline-danger': true}"
            >Skip it for now.
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

</template>
<script lang="ts">
  import {  fetchDiffWithWikiRevId, supportedWikis, getUrlBaseByWiki } from '@/shared/utility-shared';
  import DiffBox from '@/components/DiffBox.vue';
  import socket from '@/plugins/socket.io.js';
  import {CrossEditSuspiciousPatternsInfo} from "@/cross-edits-detection/interface";
  import {CrossEditSuspiciousPatterns} from "@/cross-edits-detection/cross-edit-suspicious-patterns";
  export default {
    components: {
      DiffBox
    },
    props: {
      wikiRevId: {
        type: String,
        required: true
      },
      feedNameProp: {
        type: String,
        default: null
      },
      oresProp: {
        type: Object,
        default: null
      },

      revisionProp: {
        type: Object,
        default: null
      },
      interactionProp: {
        type: Object,
        default: null
      },
      stikiProp: {
        type: Number,
        default: null
      },
      cbngProp: {
        type: Number,
        default: null
      },
      diffProp: {
        type: Object,
        default: null
      },
    },
    data() {
      return {
        ores: null,
        diff: null,
        interaction: null,
        revision: null,
        myJudgement: null,
        stikiRetryRemains: 3,
        stiki: null,
        cbng: null,
        action: null,

        // Flag to toggle the cesp features
        enableCesp: false,

        // author-based CrossEditSuspiciousPatterns analysis
        warningTimeframeAuthor: 3,
        warningThresholdAuthor: 3,
        CrossEditSuspiciousPatternsInstanceAuthor: null,
        displayChoiceAuthor: false,
        displayHistoryAuthor: false,
        choiceInfoAuthor: null,
        previousRevisionInfosAuthor: null,

        // article-based CrossEditSuspiciousPatterns analysis
        warningTimeframeArticle: 3,
        warningThresholdArticle: 3,
        CrossEditSuspiciousPatternsInstanceArticle: null,
        displayChoiceArticle: false,
        displayHistoryArticle: false,
        choiceInfoArticle: null,
        previousRevisionInfosArticle: null,
      }
    },
    methods: {
      loadDiff: async function () {
        this.diff = await this.fetchDiffWithWikiRevId(this.wikiRevId);
      },
      isMine: function(judgement) {
        if (judgement.wikiUserName && this.$store.state.user && this.$store.state.user.profile) {
          return judgement.wikiUserName === this.$store.state.user.profile.displayName;
        } else {
          return this.$cookiez.get('_ga') === judgement.userGaId;
        }
      },

      loadStiki: async function() {
        console.info(`Load Stiki`);
        let stikiRemote = [];
        if (this.stikiProp) {
          stikiRemote = this.stikiProp;
        } else {
          try {
            stikiRemote = await this.$axios.$get(`/extra/stiki/${this.wikiRevId}`);
          } catch(err) {
            // ignoring
            stikiRemote = [];
          }
        }
        if (stikiRemote.length) {
          this.stiki = parseFloat(stikiRemote[0].SCORE);
        } else {
          if (this.stikiRetryRemains) setTimeout(this.loadStiki, 5000);
        }
        this.stikiRetryRemains --;
      },
      loadCbng: async function() {
        let cbngRemote = [];
        if (this.cbngProp) {
          cbngRemote = this.cbngProp;
        } else {
          try {
            cbngRemote = await this.$axios.$get(`/extra/cbng/${this.wikiRevId}`);
          } catch(err) {
            // ignoring
            cbngRemote = [];
          }
        }
        if (cbngRemote.length) {
          this.cbng = parseFloat(cbngRemote[0].SCORE);
        } else {
          if (this.cbngRetryRemains) setTimeout(this.loadCbng, 5000);
        }
        this.cbngRetryRemains --;
      },
      getTimeString: function () {
        const timestamp = isNaN(this.revision.timestamp) ? this.revision.timestamp : this.revision.timestamp * 1000
        return new Date(timestamp).toString();
      },
      getJudgementCount: function (judge) {
        return this.interaction.counts[judge];
      },
      isOverriden: function () {
        return false;
        // return this.revision.pageLatestRevId > this.revision.revid;
      },
      getMyJudgement: function() {
        if (this.interaction) {
          let myGaId = this.$cookiez.get("_ga");
          let myWikiUserName = null;
          if (this.$store.state.user && this.$store.state.user.profile) {
            myWikiUserName = this.$store.state.user.profile.displayName;
          }
          let result = this.interaction.judgements.filter(j => {
            if (myWikiUserName && myWikiUserName === j.wikiUserName) return true;
            else return j.userGaId === myGaId;
          });
          if (result.length === 1) {
            return result[0].judgement;
          } else return null;
        } else {
          return null;
        }
      },
      enableRevertRedirect: function() {
        this.$ga.event({
          eventCategory: 'wp-edit',
          eventAction: 'go-revert',
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
        // TODO(xinbenlv): use realtime overridden information.
        return this.myJudgement === `ShouldRevert` && !this.isOverriden();
      },

      performRevert: async function() {
        if (this.enableRevertRedirect()/*TODO sanity check for reversion*/) {
          if (this.$store.state.flags.useDirectRevert && this.$store.state.user && this.$store.state.user.profile) {
            await this.directRevert();
          } else {
            await this.redirectToRevert();
          }
        }
      },

      directRevert: async function() {
      try {
        this.$ga.event({
          eventCategory: 'interaction',
          eventAction: 'direct-revert-initiate',
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
        let ret = await this.$axios.$get(`/api/auth/revert/${this.wikiRevId}`);
        if (ret && ret.edit && ret.edit.result ===`Success`) {
          this.$bvToast.toast(
                  this.$t('Message-CongratsSuccessfullyReverted', [this.wikiRevId]),
                  {
                    title: this.$t('Label-RevertSucceeded'),
                    autoHideDelay: 3000,
                    appendToast: true
                  });
          this.$ga.event({
            eventCategory: 'interaction',
            eventAction: 'direct-revert-success',
            eventValue: {
              wikiRevId: this.wikiRevId
            }
          });
          this.action = `DirectReverted`;
        } else {
          console.warn(`Direct revert result unknown`, ret);
          this.$ga.event({
            eventCategory: 'interaction',
            eventAction: 'direct-revert-unknown',
            eventValue: {
              wikiRevId: this.wikiRevId
            }
          });
          this.action = `DirectRevertFailed`;
        }

      } catch(e) {
        // TODO show failure message.
        this.$ga.event({
          eventCategory: 'interaction',
          eventAction: 'direct-revert-failure',
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
      }
      },
      redirectToRevert: async function() {
        if (this.myJudgement === `ShouldRevert` && !this.isOverriden()) {
          const version = await this.$axios.$get(`/api/version`);
          let revertEditSummary = this.$t(
              `Message-RevertEditSummary`,
              [
                `[[:m:WikiLoop DoubleCheck]]`,
                `${version}`,
                `http://${process.env.PUBLIC_HOST || "doublecheck.wikiloop.org"}/revision/${this.wikiRevId.split(':')[0]}/${this.wikiRevId.split(':')[1]}`
              ]);
          let revertUrl = `${this.getUrlBaseByWiki(this.revision.wiki)}/w/index.php?title=${this.revision.title}&action=edit&undoafter=${this.revision.revision?.old || 'prev'}&undo=${/*TODO(xinbenlv): this is a hack, until we standardize the revision interface */this.revision.revision?.new || this.wikiRevId.split(':')[1]}&summary=${revertEditSummary}`;
          let historyUrl = `${this.getUrlBaseByWiki(this.revision.wiki)}/w/index.php?title=${this.revision.title}&action=history`;
          let result = await this.$axios.$get(`/api/mediawiki`, {params: {
            wiki: this.revision.wiki,
            apiQuery: {
              action: "query",
              format: "json",
              prop: "revisions",
              titles: this.revision.title,
              rvlimit: 10,
            }
          }});
          let revisions = Object.values(result.query.pages)[0]['revisions'];
          if (revisions[1].user === revisions[0].user) {
            window.open(historyUrl, '_blank');
            this.$ga.event({
              eventCategory: 'interaction',
              eventAction: 'go-to-history',
              eventValue: {
                wikiRevId: this.wikiRevId
              }
            });
          } else {
            window.open(revertUrl, '_blank');
            this.$ga.event({
              eventCategory: 'interaction',
              eventAction: 'go-to-revert',
              eventValue: {
                wikiRevId: this.wikiRevId
              }
            });
          }
          this.action = `OpenedUrlToRevert`;
        }
      },
      interactionBtn: async function (myJudgement) {
        this.myJudgement = myJudgement;
        let revision = this.revision;
        let gaId = this.$cookiez.get("_ga");
        let postBody:any = {
          userGaId: gaId,
          judgement: myJudgement,
          timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
          wikiRevId: revision.wikiRevId,
          recentChange: {
            title: revision.title,
            namespace: revision.namespace,
            revision: revision.revision,
            ores: this.ores,
            user: revision.user,
            wiki: revision.wiki,
            timestamp: new Date(revision.timestamp).getTime()/1000
          },
          feed: this.feedNameProp,
          wiki: this.revision.wiki,
          title: revision.title,
        };
        if (this.$store.state.user && this.$store.state.user.profile) {
          let wikiUserName = this.$store.state.user.profile.displayName;
          postBody.wikiUserName = wikiUserName;
        }

        await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
        document.dispatchEvent(new Event("stats-update"));
        document.dispatchEvent(new Event("judgement-event"));
        this.$emit('judgement-event', postBody);
        this.$ga.event({
          eventCategory: 'interaction',
          eventAction: 'judgement',
          eventLabel: myJudgement,
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
      },
      damagingPercent: function () {
        return `${this.ores !== null ? Math.floor(parseFloat(this.ores.damaging.true) * 100) : "??"}%`;
      },
      badfaithPercent: function () {
        return `${this.ores !== null ? Math.floor(parseFloat(this.ores.goodfaith.false) * 100) : "??"}%`;
      },
      stikiPercent: function() {
        return `${this.stiki !== null ? Math.floor(parseFloat(this.stiki) * 100) : "??"}%`;
      },
      cbngPercent: function() {
        return `${this.cbng !== null ? Math.floor(parseFloat(this.cbng) * 100) : "??"}%`;
      },
      turnOffChoiceAuthor: function() {
        this.displayChoiceAuthor = false;
        this.displayHistoryAuthor = false;
      },
      executeAuthor: function() {
        this.CrossEditSuspiciousPatternsInstanceAuthor.executeDecision();
        this.turnOffChoiceAuthor();
      },
      turnOffChoiceArticle: function() {
        this.displayChoiceArticle = false;
        this.displayHistoryArticle = false;
      },
      executeArticle: function() {
        this.CrossEditSuspiciousPatternsInstanceArticle.executeDecision();
        this.turnOffChoiceArticle();
      },
    },
    async created() {
    },
    async beforeMount() {
      this.interaction = this.interactionProp || await this.$axios.$get(`/api/interaction/${this.wikiRevId}`);
      this.revision = this.revisionProp || await this.$axios.$get(`/api/revision/${this.wikiRevId}`);
      this.ores = this.oresProp ||  await this.$axios.$get(`/api/ores/${this.wikiRevId}`);
      this.diff = this.diffProp || await this.$axios.$get(`/api/diff/${this.wikiRevId}`);
      if (this.stikiProp) {
        this.stiki = this.stikiProp;
      } else if (this.$store.state.flags.useStiki) {
        await this.loadStiki();
      }
      if (this.cbngProp) {
        this.cbng = this.cbngProp;
      } else if (this.$store.state.flags.useStiki/*Cbng shares the same flag with STiki*/) {
        await this.loadCbng();
      } // TODO(xinbenlv) merge duplicated logic

      // TODO(xinbenlv): after marking "shouldRevert" query to see if this revesion is top and can be reverted.
      socket.on('interaction-item', async (interaction) => {
        this.interaction = await this.$axios.$get(`/api/interaction/${this.wikiRevId}`);
      });
    },
    async mounted() {
      if (this.$env.CROSS_EDIT_CHECK === '1' || this.$route.query.cesp === '1') {
        this.enableCesp = true;
        console.log(`Cross-edit features is eanbled!`);
      } else {
        console.log(`Cross-edit features is not eanbled (default).`);
      }

      this.$ga.event({
        eventCategory: 'display',
        eventAction: 'NewRevisionCard',
        eventValue: {
          wikiRevId: this.wikiRevId
        }
      });
      if (this.enableCesp) {
        // Author-based analysis
        var curRevisionInfoAuthor: CrossEditSuspiciousPatternsInfo = {
          mode: "author",
          url: "https://en.wikipedia.org/w/api.php?origin=*",
          windowSize: 10,
          baseline: 0.0,
          percentage: 0.0,
          margin: 0.1,
          warningTimeframe: this.warningTimeframeAuthor,
          warningThreshold: this.warningThresholdAuthor,
          revID: this.wikiRevId,
          axiosClient: this.$axios,
        }
        this.CrossEditSuspiciousPatternsInstanceAuthor = new CrossEditSuspiciousPatterns(curRevisionInfoAuthor);
        var decisionInfoAuthor = await this.CrossEditSuspiciousPatternsInstanceAuthor.analyze();
        if (decisionInfoAuthor.type != "") {
          this.displayChoiceAuthor = true;
          this.displayHistoryAuthor = true;
          this.choiceInfoAuthor = decisionInfoAuthor;
          this.previousRevisionInfosAuthor = decisionInfoAuthor.previousRevisionInfos;
        }
        console.log(this.previousRevisionInfosAuthor);

        // Article-based analysis
        var curRevisionInfoArticle: CrossEditSuspiciousPatternsInfo = {
          mode: "article",
          url: "https://en.wikipedia.org/w/api.php?origin=*",
          windowSize: 10,
          baseline: 0.0,
          percentage: 0.0,
          margin: 0.1,
          warningTimeframe: this.warningTimeframeArticle,
          warningThreshold: this.warningThresholdArticle,
          revID: this.wikiRevId,
          axiosClient: this.$axios,
        }
        this.CrossEditSuspiciousPatternsInstanceArticle = new CrossEditSuspiciousPatterns(curRevisionInfoArticle);
        var decisionInfoArticle = await this.CrossEditSuspiciousPatternsInstanceArticle.analyze();
        if (decisionInfoArticle.type != "") {
          this.displayChoiceArticle = true;
          this.displayHistoryArticle = true;
          this.choiceInfoArticle = decisionInfoArticle;
          this.previousRevisionInfosArticle = decisionInfoArticle.previousRevisionInfos;
        }
        console.log(this.previousRevisionInfosArticle);
      }
    },
    beforeCreate() {
      this.getUrlBaseByWiki = getUrlBaseByWiki.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
      this.fetchDiffWithWikiRevId = fetchDiffWithWikiRevId.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
    },
  }

</script>

<style>
  .diff-context {
    word-break: break-all;
    width: 50%;
  }

  .diff-deletedline, .diff-addedline {
    word-break: break-all;
    width: 50%
  }

  .blue-link {
    color: blue
  }
  .bg-darker-light {
    background-color: #F5F5F5;
  }

  #metainfo {
    font-size:12px;
  }

  .avatar-object {
    width: 48px;
    height: 48px;
    margin-top: -18px;
    margin-bottom: -18px;
  }
</style>

