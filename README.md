# WikiLoop Battlefield: Fight vandalism on Wikipedia together

[![WikiLoop Logo](static/wikiloop-battlefield-logo.svg)](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[![CircleCI](https://circleci.com/gh/google/wikiloop-battlefield/tree/master.svg?style=svg)](https://circleci.com/gh/google/wikiloop-battlefield/tree/master) 
[![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Watch&style=social)](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Watch&style=social)
![GitHub forkers](https://img.shields.io/github/forks/google/wikiloop-battlefield.svg?label=Fork&style=social)
![GitHub stargazers](https://img.shields.io/github/stars/google/wikiloop-battlefield.svg?label=Star&style=social)
![GitHub followers](https://img.shields.io/github/followers/xinbenlv.svg?label=Follow&style=social)

This is a web app project built to allow people to fight vandalism on Wikipedia collaboratively. See [[[m:WikiProject_WikiLoop]]](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop) for more introduction. The documentation in this repository focuses on development of the software itself.

[![Vandalism Example](./assets/demo-1.2.0-beta.gif)](http://battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_img)

## Website Status

[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m783127048-3a1e3c13cdc8e36abba87357.svg?label=prod)](http://battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_badge)
[![Prod Site Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783127048-3a1e3c13cdc8e36abba87357.svg?label=prod%20uptime)](http://battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_ratio_badge)
[![Dev Uptime Robot status](https://img.shields.io/uptimerobot/status/m783127051-01afa8e12cb12e059a95f54c.svg?label=dev)](http://dev.battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_badge)
[![Dev Site Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783127051-01afa8e12cb12e059a95f54c.svg?label=dev%20uptime)](http://dev.battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_ratio_badge)

## Quick Start
![GitHub](https://img.shields.io/github/license/google/wikiloop-battlefield.svg)
![GitHub contributors](https://img.shields.io/github/contributors/google/wikiloop-battlefield.svg)
![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/google/wikiloop-battlefield.svg)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/google/wikiloop-battlefield/master.svg) 
[![Tech Stack](https://img.shields.io/badge/tech-stack-blue.svg)](https://stackshare.io/project-wikiloop/battlefield)

We welcome contributions! See [our contribution policy](CONTRIBUTING.md). Please check out [our stack diagram](https://stackshare.io/project-wikiloop/battlefield) to get familiar with the technologies we depend on.
### Deploy a Dev Instance on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

![Demo: Deploy to Heroku](./assets/demo-deploy-to-heroku-btn.gif)
 
### Install

Prerequisite: [git](https://git-scm.com), [nodejs](https://nodejs.org), [npm](https://npmjs.com)  

```bash
git clone git@github.com:google/wikiloop-battlefield.git
cd wikiloop-battlefield
npm install 
```

### Setup

You should create a `.env` file containing environment variables needed by this project used by [`dotenv`](https://www.npmjs.com/package/dotenv). A template has been provided in the `template.env`. Once set, you should do `cp template.env .env` to create such file in the exact name. 

### Run

Prerequisite: [NuxtJS](https://nuxtjs.org) with [VueJS](https://vuejs.org) and [ExpressJS](https://expressjs.com).

To run a local dev instance, which gives you hot reload and a devtool ([Vue DevTool](https://github.com/vuejs/vue-devtools)) friendly instance:

```bash
npm run dev
``` 

To build and run a local instance with like a prod:

```bash
npm run build
npm start
```

### Test

Prerequisite: [Docker](https://www.docker.com/), [Jest](http://jestjs.io)

```bash
npm test
```

### Continuous Integration

Prerequisite: [CircleCI](https://circleci.com)

We run our continuous integration with CircleCI. To run continuous integration locally:

```bash
circleci local execute build
```

## Credit
- Primary Project Lead: Zainan Zhou <zzn@google.com> @xinbenlv
- Contributors:
  - **Ashwin Ramaswami** (@epicfaace), for massive refactoring API structure
  - **Hamdanil Rasyid** (@hrasyid), for adding Indonsian(`idwiki`) language support
  - **Ali Goren** (@aligoren), for fixing timestamp bug and adding Turkish (`trwiki`) language support.

- We appreciate the courtesy of [Dr. Andrew G. West](http://www.andrew-g-west.com/) for providing us with read access to [STiki](https://en.wikipedia.org/wiki/Wikipedia:STiki) vandalism detection scores.

- We welcome new contributors too!
