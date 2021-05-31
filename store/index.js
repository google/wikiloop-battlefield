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

export const state = () => ({
    flags: {},
    version: null,
    metrics: null,
    sessionId: null,
    wiki: "enwiki", // default to English
});

export const mutations = {
    setFlags (state, flagObject) {
        state.flags = flagObject;
    },
    clearFlags (state, ) {
        state.flags = {}
    },
    setFlag (state, kv) {
        state.flags[kv.key] = kv.value;
    },
    setVersion(state, version) {
        state.version = version;
    },
    setMetrics(state, metrics) {
      state.metrics = metrics;
    },
    setSessionId (state, sessionId) {
        state.sessionId = sessionId;
    },
    setWiki(state, wiki) {
        state.wiki = wiki
    },
};

export const actions = {
    async nuxtServerInit({ commit, state, dispatch }, { req }) {
        console.log(`nuxtServerInit start`);
        const flags = await this.$axios.$get(`/api/flags`);
        commit('setFlags', flags);
        const version = await this.$axios.$get(`/api/version`);
        commit('setVersion', version);
        const metrics = await this.$axios.$get(`/api/metrics`);
        commit('setMetrics', metrics);

        if (req.session && req.session.id) {
            commit('setSessionId', req.session.id);
            console.log(`nuxtServerInit req.session.id`, req.session.id);
        }
        if (req.user) {
            commit('user/setProfile', req.user);
            const userPreferences = await this.$axios.$get(`/api/auth/user/preferences`);
            commit('user/setPreferences', userPreferences);
            if (userPreferences.wiki) {
              commit(`setWiki`, userPreferences.wiki);
            }
        } else {
            console.log(`nuxtServerInit store state clearProfile because req.user is not defined`);
            commit('user/clearProfile');
        }

        console.log(`nuxtServerInit done`);
    },
   /** An vuex action to change the current wiki, denoted by `wiki`.
   *
   * When switching a language, we store the `wiki` into the Vuex store.
   * this action also dispatches the command to load the revisions of the new
   * wiki
   * @param commit
   * @param state
   * @param dispatch
   * @param wiki
   * @return {Promise<void>}
   */
    async changeWiki({ commit, state, dispatch}, wiki) {
      document.dispatchEvent(new Event(`wiki-change-started`));
      commit(`setWiki`, wiki);
      commit(`revisions/initHeap`);
      try {
          await this.$axios.$post(`/api/auth/user/preferences`, {wiki: wiki}); 
      } catch(err) {
        console.warn(err);
      }
      await dispatch(`revisions/loadMoreWikiRevs`);
      document.dispatchEvent(new Event(`wiki-change-completed`));
    }
};
