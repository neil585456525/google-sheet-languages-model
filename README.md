# i18n-google-sheet-example

## Description

This repo show that how to manage i18n with google sheet to get collaboration more smooth.

## Setup

### Installation

```bash
yarn add -D google-sheet-languages-model googleapis
```

### Google Sheet API Authorization

Recommend to use [Service Account](https://developers.google.com/workspace/guides/create-credentials#service-account) auth option to interact with google sheet api.

1. Enable the [Google Sheet API Permission](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
1. Copy `credentials.json` which generated from Service Account into `example`
1. Add Service Account user to the sheet your are going to use
1. Set `Google Sheet ID` in `.env`
1. Set the `Sheet Title` when you using the library

## Basic Usage

- Pull i18n from google sheet to local folder. ([link](https://github.com/neil585456525/i18n-google-sheet-example/blob/main/example/pull.ts))
- Push i18n from local folder to google sheet. ([link](https://github.com/neil585456525/i18n-google-sheet-example/blob/main/example/push.ts))
