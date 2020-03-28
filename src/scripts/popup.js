import browser from 'webextension-polyfill';

document.getElementById('transliterate').innerHTML = 'a';
document.addEventListener('DOMContentLoaded', async () => {
  const lang_elem = document.getElementById('lang');

  // Restore options
  browser.storage.sync.get('lang').then((result) => {
    lang_elem.selectedIndex = document.querySelector(`[value=${result.lang}]`).index;
  });

  document.getElementById('transliterate').innerHTML = 'a';

  const tabs = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  const url = tabs.length && tabs[0].url;

  document.getElementById('transliterate').addEventListener('click', async () => {
    const response = await browser.runtime.sendMessage({
      msg: 'hello',
      url,
    });
  });

  lang_elem.addEventListener('change', () => {
    browser.storage.sync.set({
      lang: lang_elem.value
    });
  });
});
