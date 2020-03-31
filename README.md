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
* `yarn install`
* `yarn run dev:firefox` to start the development server for firefox addon

My dev setup :

* OS : `Linux Mint 19 [Ubuntu 18.04 LTS]`
* node : `10.19.0`
* npm : `6.13.4`

But it'll work on majority others too.