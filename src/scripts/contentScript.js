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
import Tooltip from './tooltip.js';


var t,
    debug = sessionStorage.getItem('indicen_debug') || false,
    transliterated_webpage = false,
    observer = null,
    langCodes = {
      'ml': [3328, 3455, '0D00', '0D7F'], // 0x0D00 to 0x0D7F
      'hi': [2304, 2431, '0900', '097F'], // 0x0900 to 0x097F
      'kn': [3200, 3327, '0C80', '0CFF'] // 0x0C80 to 0x0CFF
    },
    overlay = false;

/**
 * Check if input has characters from a particular language
 * @param str input Input string
 * @param str lang Language to check against
 */
function has_lang(input, lang) {
  let charCode = 0,
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

function transliterate(input, lang) {
  if (lang === 'ml') {
    return t.transliterate_ml_en(input);
  } else if (lang === 'hi') {
    return t.transliterate_hi_en(input);
  } else {
    return t.transliterate_kn_en(input);
  }
}

if (debug) {
  sessionStorage.setItem('indicen_time_elapsed', 0);
}

function transliterate_elem_content(elem, lang) {
  if (debug) { var time = performance.now(); }

  /**
   * Thank you so much Lucas Trzesniewski !
   * https://stackoverflow.com/a/31369978/1372424
   */
  var nodes = [],
    regex = new RegExp('[\\u'+ langCodes[lang][2] +'-\\u'+ langCodes[lang][3] +'].*?[.!?,;:\n\'"]', 'g'), // \u0D00-\u0D7F
    text = "",
    node,
    nodeIterator = elem.ownerDocument.createNodeIterator(
      elem,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (node.parentNode && node.parentNode.nodeName !== 'SCRIPT') {
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      },
      false
    );
    
  while (node = nodeIterator.nextNode()) {
    if (!has_lang(node.nodeValue, lang)) { continue; }
    nodes.push({
      textNode: node,
      start: text.length
    });
    text += node.nodeValue
  }

  if (!nodes.length)
    return;

  var match;
  while (match = regex.exec(text)) {
    var matchLength = match[0].length;
    
    // Prevent empty matches causing infinite loops        
    if (!matchLength)
    {
      regex.lastIndex++;
      continue;
    }
    
    for (var i = 0; i < nodes.length; ++i) {
      node = nodes[i];
      var nodeLength = node.textNode.nodeValue.length;
      
      // Skip nodes before the match
      if (node.start + nodeLength <= match.index)
        continue;
    
      // Break after the match
      if (node.start >= match.index + matchLength)
        break;
      
      // Split the start node if required
      if (node.start < match.index) {
        nodes.splice(i + 1, 0, {
          textNode: node.textNode.splitText(match.index - node.start),
          start: match.index
        });
        continue;
      }
      
      // Split the end node if required
      if (node.start + nodeLength > match.index + matchLength) {
        nodes.splice(i + 1, 0, {
          textNode: node.textNode.splitText(match.index + matchLength - node.start),
          start: match.index + matchLength
        });
      }
      
      // Highlight the current node
      var spanNode = document.createElement("span");
      spanNode.className = "indicened";
      spanNode.dataset.indicenoriginal = node.textNode.textContent
      
      node.textNode.parentNode.replaceChild(spanNode, node.textNode);
      spanNode.appendChild(node.textNode);
    }
  }

  nodes = elem.getElementsByClassName('indicened')
  for (var i = 0; i < nodes.length; ++i) {
    node = nodes[i];
    node.textContent = transliterate(node.textContent, lang)
  }

  if (debug) {
    sessionStorage.setItem('indicen_time_elapsed', parseFloat(sessionStorage.getItem('indicen_time_elapsed')) + (performance.now() - time));
    console.log(sessionStorage.getItem('indicen_time_elapsed'))
  }
}

/**
 * Thanks Michael Zaporozhets
 * https://stackoverflow.com/a/11381730
 */
function detectMob() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

function transliterate_webpage(lang) {
  t = new Transliterator();
  transliterate_elem_content(document.body, lang);

  // This will only run in desktop
  if (overlay && !detectMob()) {
    let onMouseOver = async (e) => {
      Tooltip.init('indicenoriginal')
      document.removeEventListener('mouseover', onMouseOver)
    }
    document.addEventListener('mouseover', onMouseOver);
  }

  transliterated_webpage = true
}

function untransliterate_webpage() {
  Tooltip.destroy()

  if (observer)
    observer.disconnect()

  var nodes = document.getElementsByClassName('indicened'),
      node;

  for (let i = 0;i < nodes.length;i++) {
    node = nodes[i];
    node.innerText = node.dataset.indicenoriginal;
  }

  transliterated_webpage = false
}

function init() {
  // Auto transliterate
  browser.storage.sync.get({
    auto: false,
    overlay: true,
    lang: 'ml'
  }).then((result) => {
    var lang = result.lang;
    overlay = result.overlay;

    if (result.auto) {
      transliterate_webpage(lang);

      // Create an observer instance linked to the callback function
      observer = new MutationObserver(mutationsList => {
        for (let mutation of mutationsList) {
          if (
            mutation.type === 'childList' &&
            mutation.target.className !== 'indicened' &&
            mutation.target.parentNode &&
            mutation.target.parentNode.className.indexOf('indicen-tooltip-container') === -1
          ) {
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
          subtree: true
        }
      );
    }
  }, (err) => {
    console.log(err);
  });
}

// On popup button click
browser.runtime.onMessage.addListener(request => {
  if (request.lang) {
    init()
    transliterate_webpage(request.lang);
  } else if (request.untransliterate) {
    untransliterate_webpage();
  } else {
    return Promise.resolve(transliterated_webpage)
  }
});

init()