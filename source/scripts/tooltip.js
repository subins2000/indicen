/*
 * JS CSS Tooltip v1.2.3
 * https://github.com/mirelvt/js-css-tooltip
 *
 * Released under the MIT license
 *
 * Date: 2017-05-31
 * ----------------
 * Modified by Subin Siby, 2020
 * 
 * Released under the MIT license
 */

var tooltip = null, elm_edges, tooltip_text, event_listener = null;

var Tooltip = {
    init: function(data_attr_name) {
        tooltip = document.createElement('div')
        tooltip.className = 'indicen-tooltip-container indicen-no-display'
        tooltip.innerHTML = '<div class="indicen-text"></div><a class="indicen-credit" href="https://subinsb.com/indicen/" target="_blank">Indic-En</a>'
        document.body.appendChild(tooltip)

        function showTooltip(evt) {
            const item = Object.create(Tooltip);
            item.create(tooltip, evt.target, data_attr_name);
            item.position(tooltip, evt.target);
        }

        function hideTooltip() {
            tooltip.className = 'indicen-tooltip-container indicen-no-display';
            tooltip.removeAttribute('style');
        }

        var timeout = null
            hide_timeout = null,
            cur_highlighted = null

        event_listener = (e) => {
            clearInterval(timeout)
            clearInterval(hide_timeout)

            timeout = setTimeout(() => {
                if (e.target.dataset[data_attr_name] !== undefined) {
                    cur_highlighted = document.getElementById('indicen-highlight')
                    if (cur_highlighted)
                        cur_highlighted.id = ''

                    e.target.id = 'indicen-highlight'
                    showTooltip(e)
                }
            }, 700);

            hide_timeout = setTimeout(() => {
                if (e.target.className.indexOf('indicen') === -1) {
                    cur_highlighted = document.getElementById('indicen-highlight')
                    if (cur_highlighted)
                        cur_highlighted.id = ''

                    hideTooltip()
                }
            }, 200);
        };

        document.addEventListener('mouseover', event_listener);
    },
    create: function(tooltip, elm, data_attr_name) {
        // elm_edges relative to the viewport.
        elm_edges = elm.getBoundingClientRect();
        tooltip.firstChild.innerText = elm.dataset[data_attr_name];

        // Remove no-display + set the correct classname based on the position
        // of the elm.
        if (elm_edges.left > window.innerWidth - 100) {
            tooltip.className = 'indicen-tooltip-container indicen-tooltip-left';
        } else if ((elm_edges.left + (elm_edges.width / 2)) < 100) {
            tooltip.className = 'indicen-tooltip-container indicen-tooltip-right';
        } else {
            tooltip.className = 'indicen-tooltip-container indicen-tooltip-center';
        }
    },
    position: function(tooltip, elm) {
        // 10 = arrow height
        const elm_top = elm_edges.top + window.scrollY + elm_edges.height;
        const viewport_edges = window.innerWidth;

        // Position tooltip on the left side of the elm if the elm touches
        // the viewports right edge and elm width is < 50px.
        if (elm_edges.left > viewport_edges && elm_edges.width < 50) {
            tooltip.style.left = (elm_edges.left - (tooltip.offsetWidth + elm_edges.width)) + 'px';
            tooltip.style.top = elm.offsetTop + 'px';
        // Position tooltip on the left side of the elm if the elm touches
        // the viewports right edge and elm width is > 50px.
        } else if (elm_edges.left > viewport_edges && elm_edges.width > 50) {
            tooltip.style.left = (elm_edges.left - tooltip.offsetWidth - 20) + 'px';
            tooltip.style.top = elm.offsetTop + 'px';
        } else if ((elm_edges.left + (elm_edges.width / 2)) < 100) {
            // position tooltip on the right side of the elm.
            tooltip.style.left = (elm_edges.left + elm_edges.width + 20) + 'px';
            tooltip.style.top = elm.offsetTop + 'px';
        } else {
            // Position the toolbox in the center of the elm.
            const centered = (elm_edges.left + (elm_edges.width / 2)) - (tooltip.offsetWidth / 2);
            tooltip.style.left = centered + 'px';
            tooltip.style.top = elm_top + 'px';
        }

        if (parseInt(tooltip.style.left) < 0)
            tooltip.style.left = '10px';
    },
    destroy: function() {
        if (tooltip) {
            tooltip.remove();
            document.removeEventListener('mouseover', event_listener);

            let cur_highlighted = document.getElementById('indicen-highlight')
            if (cur_highlighted)
                cur_highlighted.id = ''
        }
    }
};

module.exports = Tooltip