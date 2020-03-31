import browser from 'webextension-polyfill';

document.addEventListener('DOMContentLoaded', async () => {
  const lang_elem = document.getElementById('lang');
  var lang = 'ml';

  // Restore options
  browser.storage.sync.get('lang').then((result) => {
    if (result.lang.length === 2) {
      lang = result.lang;
      lang_elem.selectedIndex = document.querySelector(`[value=${lang}]`).index;
    }
  }, (err) => {
    console.log(err);
  });

  browser.storage.sync.get('auto').then((result) => {
    document.getElementById('auto_transliterate').checked = result.auto;
  }, (err) => {
    console.log(err);
  });

  const tabs = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  document.getElementById('transliterate').addEventListener('click', async () => {
    for (let tab of tabs) {
      browser.tabs.sendMessage(
        tab.id,
        {
          lang: lang
        }
      ).catch(error => {
        console.log(error);
      });
    }
  });

  lang_elem.addEventListener('change', () => {
    lang = lang_elem.value;
    browser.storage.sync.set({
      lang: lang
    });
  });

  document.getElementById('auto_transliterate').addEventListener('change', () => {
    browser.storage.sync.set({
      auto: document.getElementById('auto_transliterate').checked
    });
  });
});
