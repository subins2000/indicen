import browser from 'webextension-polyfill';
import Transliterator from 'libindic-transliteration';

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
        node.textContent = transliterate(node.textContent);
      } else if (node.nodeType === Element.ELEMENT_NODE){
        //  Check this node's child nodes for text nodes to act on
        replace_text_in_node(node);
      }
    }
  };

  replace_text_in_node(elem);
}

browser.runtime.onMessage.addListener(request => {
  transliterate_elem_content(document.body, result.lang);
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
      console.log(mutationsList)
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