import browser from 'webextension-polyfill';
import Transliterator from 'libindic-transliteration';

function transliterate_webpage(lang) {
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

  replace_text_in_node(document.body);
}

browser.runtime.onMessage.addListener(request => {
  transliterate_webpage(request.lang);
});