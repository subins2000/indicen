/*
 * Indic-En : WebExtension to transliterate webpages
 * https://subinsb.com/indicen
 *
 * This work is licensed under GNU General Public License version 3.
 * 
 * Copyright 2020 Subin Siby <mail@subinsb.com>
*/

import browser from 'webextension-polyfill';

import '../styles/popup.scss';

document.addEventListener('DOMContentLoaded', async () => {
  const lang_elem = document.getElementById('lang');
  var lang = 'ml';

  // Restore options
  browser.storage.sync.get({
    auto: false,
    overlay: true,
    lang: lang
  }).then((result) => {
    document.getElementById('auto_transliterate').checked = result.auto;
    document.getElementById('overlay').checked = result.overlay;

    if (result.lang.length === 2) {
      lang = result.lang;
      lang_elem.selectedIndex = document.querySelector(`[value=${lang}]`).index;
    }
  }, (err) => {
    console.log(err);
  });

  // There will be only one active tab
  let tab = await browser.tabs.query({
    active: true
  });
  tab = tab[0]

  document.getElementById('transliterate').addEventListener('click', async () => {
    browser.tabs.sendMessage(
      tab.id,
      {
        lang: lang
      }
    ).catch(error => {
      console.log(error);
    });
    document.getElementById('transliterate').style.display = 'none'
    document.getElementById('untransliterate').style.display = 'inline'
  });

  document.getElementById('untransliterate').addEventListener('click', async () => {
    browser.tabs.sendMessage(
      tab.id,
      {
        untransliterate: true
      }
    );
    document.getElementById('transliterate').style.display = 'inline'
    document.getElementById('untransliterate').style.display = 'none'
  });

  // Check if page transliterated (auto mode on)
  browser.tabs.sendMessage(
    tab.id,
    {
      transliterated_webpage: '?'
    }
  ).then(transliterated_webpage => {
    if (transliterated_webpage) {
      document.getElementById('transliterate').style.display = 'none'
      document.getElementById('untransliterate').style.display = 'inline'
    }
  });

  var save_settings = () => {
    browser.storage.sync.set({
      auto: document.getElementById('auto_transliterate').checked,
      overlay: document.getElementById('overlay').checked,
      lang: lang
    });
  }

  lang_elem.addEventListener('change', () => {
    lang = lang_elem.value;
    save_settings();
  });

  document.getElementById('auto_transliterate').addEventListener('change', () => {
    save_settings();
  });
  document.getElementById('overlay').addEventListener('change', () => {
    save_settings();
  });
});
