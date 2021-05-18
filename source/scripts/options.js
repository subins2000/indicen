/*
 * Indic-En : WebExtension to transliterate webpages
 * https://subinsb.com/indicen
 *
 * This work is licensed under GNU General Public License version 3.
 * 
 * Copyright 2020 Subin Siby <mail@subinsb.com>
*/

import Transliterator from 'libindic-transliteration';

import '../styles/options.scss';

var form = document.getElementById('transliterate-form');
form.onsubmit = function(e) {
    e.preventDefault();

    var l = document.getElementById('lang').value,
        input = document.getElementById('input').value,
        output = '',
        t = new Transliterator();

    if (l === 'ml') {
        output = t.transliterate_ml_en(input);
    } else if (l === 'hi') {
        output = t.transliterate_hi_en(input);
    } else {
        output = t.transliterate_kn_en(input);
    }

    document.getElementById('output').value = output;

    return false;
};
