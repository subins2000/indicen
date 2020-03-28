import Transliterator from 'libindic-transliteration';

const t = new Transliterator();
console.log(t.transliterate_ml_en('അ'));

var replaceTextInNode = function(parentNode){
  for(var i = parentNode.childNodes.length-1; i >= 0; i--){
    var node = parentNode.childNodes[i];

    //  Make sure this is a text node

    if(node.nodeType == Element.TEXT_NODE){
      //console.log(node.textContent);
    } else if(node.nodeType == Element.ELEMENT_NODE){
      //  Check this node's child nodes for text nodes to act on
      replaceTextInNode(node);
    }
  }
};

replaceTextInNode(document.body);

browser.runtime.onMessage.addListener(function() {
  console.log('a')
});