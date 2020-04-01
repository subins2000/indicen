/*
 * Indic-En : WebExtension to transliterate webpages
 * https://subinsb.com/indicen
 *
 * This work is licensed under GNU General Public License version 3.
 * 
 * Copyright 2020 Subin Siby <mail@subinsb.com>
*/

import browser from 'webextension-polyfill';
import Transliterator from 'libindic-transliteration';


/**
 * Check if input has characters from a particular language
 * @param str input Input string
 * @param str lang Language to check against
 */
function has_lang(input, lang) {
  let charCode = 0,
      langCodes = {
        'ml': [3328, 3455], // 0x0D00 to 0x0D7F
        'hi': [2304, 2431], // 0x0900 to 0x097F
        'kn': [3200, 3327] // 0x0C80 to 0x0CFF
      },
      start = langCodes[lang][0],
      end = langCodes[lang][1];

  for (let i = 0; i < input.length; i++) {
    charCode = input.charAt(i).charCodeAt();
    if (charCode >= start && charCode <= end) {
      return true;
    }
  }
  return false;
}

function transliterate_elem_content(elem, lang) {
  const t = new Transliterator();

  var transliterate = (input) => {
    if (lang === 'ml') {
      return t.transliterate_ml_en(input);
    } else if (lang === 'hi') {
      return t.transliterate_hi_en(input);
    } else {
      return t.transliterate_kn_en(input);
    }
  }

  var replace_text_in_node = (parent_node) => {
    for (let i = parent_node.childNodes.length - 1; i >= 0; i--){
      let node = parent_node.childNodes[i];

      //  Make sure this is a text node
      if (node.nodeType === Element.TEXT_NODE || node.nodeType === Element.DOCUMENT_NODE){
        /**
         * Only does transliteration if it has characters from the lang
         * Checking for best performance
         */
        if (has_lang(node.textContent, lang)) {
          node.textContent = transliterate(node.textContent);
        }
      } else if (node.nodeType === Element.ELEMENT_NODE){
        //  Check this node's child nodes for text nodes to act on
        replace_text_in_node(node);
      }
    }
  };

  replace_text_in_node(elem);
}

// On popup button click
browser.runtime.onMessage.addListener(request => {
  transliterate_elem_content(document.body, request.lang);
  return Promise.resolve();
});

// Auto transliterate
browser.storage.sync.get('auto').then((result) => {
  if (result.auto) {
    let lang = 'ml';
    browser.storage.sync.get('lang').then((result) => {
      lang = result.lang;
      transliterate_elem_content(document.body, result.lang);
    });

    // Create an observer instance linked to the callback function
    let observer = new MutationObserver(mutationsList => {
      for (let mutation of mutationsList) {
        if (mutation.type == 'childList') {
          for (let elem of mutation.addedNodes) {
            transliterate_elem_content(elem, lang);
          }
        }
      }
    });

    // Start observing the target node for configured mutations
    observer.observe(
      document.body,
      {
        characterData: false,
        attributes: false,
        childList: true,
        subtree: false
      }
    );
  }
}, (err) => {
  console.log(err);
});