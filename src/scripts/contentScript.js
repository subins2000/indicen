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


let t,
    debug = sessionStorage.getItem('indicen_debug') || false;

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

var transliterated_nodes = {},
    transliterated_nodes_index = 0;

function transliterate_elem_content(elem, lang) {
  if (debug) { var time = performance.now(); }
  
  var nodes = [],
    regex = new RegExp('[\u0D00-\u0D7F].*?[.!?;:]', 'g'), // \u0D00-\u0D7F
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
      spanNode.dataset.id = transliterated_nodes_index

      transliterated_nodes[transliterated_nodes_index] = node.textNode.textContent
      transliterated_nodes_index++
      
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

function transliterate_webpage(lang) {
  t = new Transliterator();
  transliterate_elem_content(document.body, lang);

  // This makes sure it's desktop
  document.body.addEventListener('mouseover', (e) => {
    
  });
}

// On popup button click
browser.runtime.onMessage.addListener(request => {
  transliterate_webpage(request.lang);
  return Promise.resolve();
});

// Auto transliterate
browser.storage.sync.get('auto').then((result) => {
  if (result.auto) {
    let lang = 'ml';
    browser.storage.sync.get('lang').then((result) => {
      lang = result.lang;
      transliterate_webpage(lang);

      // Create an observer instance linked to the callback function
      let observer = new MutationObserver(mutationsList => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
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
    });
  }
}, (err) => {
  console.log(err);
});