# Indic-En

A simple WebExtension to transliterate webpages from Indic script (Malayalam, Hindi, Kannada) to English/Latin/Roman script (Manglish, Hinglish, Kanglish).

Made with help of the awesome [web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter).

## Usage

Install the extension and you'll see Indic-En icon on your browser toolbar. Click on it and simply click "Transliterate".

### Features

* Supports Malayalam, Hindi & Kannada. See [indicjs](//gitlab.com/subins2000/indicjs)
* Auto transliterate page on load
* Offline [Requires no internet to transliterate]
* Options page has a transliterator tool for manual text

## Development Setup

* Clone
* `npm install`
* `npm run dev:firefox` to start the development server for firefox addon
* `npm run build:firefox` to build `.xpi`

My dev setup :

* OS : `Linux Mint 19 [Ubuntu 18.04 LTS]`
* node : `14.17.0`
* npm : `6.14.13`

But it'll work on majority others too.