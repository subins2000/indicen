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

let tooltip, elm_edges, tooltip_text;

var Tooltip = {
    init: function(data_attr_name) {
        let tooltip = document.createElement('div')
        tooltip.className = 'indicen-tooltip-container indicen-no-display'
        tooltip.innerHTML = '<div></div><div class="indicen-credit">Indic-En</div>'
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

        var last_target = null,
            timeout = null
        document.addEventListener('mouseover', (e) => {
            clearInterval(timeout)
            timeout = setTimeout(() => {
                if (e.target.dataset[data_attr_name] !== undefined) {
                    e.target.classList.add('indicen-highlight')

                    last_target = e.target

                    showTooltip(e)
                }
            }, 700);

            if (e.target !== tooltip) {
                if (last_target)
                    last_target.classList.remove('indicen-highlight')

                hideTooltip()
            }
        })
    },
    create: function(tooltip, elm, data_attr_name) {
        // elm_edges relative to the viewport.
        elm_edges = elm.getBoundingClientRect();
        console.log(tooltip)
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
        const elm_top = elm_edges.top + elm_edges.height;
        const viewport_edges = window.innerWidth - 100;

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
    }
};

module.exports = Tooltip