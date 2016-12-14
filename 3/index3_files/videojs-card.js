/**
 * Video.js Card
 *
 * This plugin for Video.js adds a card on player
 */

(function(window, videojs) {
    'use strict';

    /**
     * Parse M:SS format
     */
    function parseTimeStr(str) {
        var ms;

        if (typeof str !== 'string') {
            return str;
        }

        if (ms = str.match(/^([012]):(\d\d)$/)) {
            return ms[1] * 1 * 60 + ms[2] * 1;
        }

        return str;
    }

    /**
     * Normal Card Component
     */
    function createNormalCard(player, cardOptions) {
        var cardClassNames
          , customStyles = ''
          , cardEl
          , card;

        function _createLinkElement(options) {
            var a = document.createElement('a');

            a.href = options.url;
            a.target = '_blank';

            a.appendChild(document.createTextNode(options.text));

            return a;
        }

        function _createTextElement(options) {
            var span = document.createElement('span');

            span.appendChild(document.createTextNode(options.text));

            return span;
        }

        function _createKeybindElement(options) {
            var span
              , winSpan
              , macSpan
              , winIcon
              , macIcon
              , divider;

            span = document.createElement('span');

            winIcon = document.createElement('i');
            winIcon.className = 'fa fa-windows';

            winSpan = document.createElement('span');
            winSpan.className = 'vjs-card-keybind';

            macIcon = document.createElement('i');
            macIcon.className = 'fa fa-apple';

            macSpan = document.createElement('span');
            macSpan.className = 'vjs-card-keybind';

            divider = document.createElement('span');
            divider.className = 'vjs-card-divider';
            divider.appendChild(document.createTextNode('/'));

            if (typeof options.win !== 'undefined') {
                span.appendChild(winIcon);
                winSpan.appendChild(document.createTextNode(options.win));
                span.appendChild(winSpan);
            }

            if (typeof options.win !== 'undefined' && typeof options.mac !== 'undefined') {
                span.appendChild(divider);
            }

            if (typeof options.mac !== 'undefined') {
                span.appendChild(macIcon);
                macSpan.appendChild(document.createTextNode(options.mac));
                span.appendChild(macSpan);
            }

            return span;
        }

        cardClassNames = [
            'vjs-card',
            'vjs-normal-card'
        ];

        // position
        if (cardOptions.hasOwnProperty('position')) {
            $.each(cardOptions.position.split(' '), function(i, pos) {
                switch (pos) {
                case 'top':
                case 'bottom':
                case 'left':
                case 'right':
                    cardClassNames.push('vjs-card-' + pos);
                    break;
                }
            });
        } else {
            cardClassNames.push('vjs-card-top');
            cardClassNames.push('vjs-card-right');
        }

        if (cardOptions.hasOwnProperty('theme')) {
            cardClassNames.push('vjs-card-theme-light');
        }

        if (cardOptions.hasOwnProperty('custom-styles')) {
            customStyles = cardOptions['custom-styles'];
        }

        cardEl = videojs.Component.prototype.createEl(null, {
            className: cardClassNames.join(' '),
            style: customStyles
        });

        switch (cardOptions.type) {
        case 'link':
            cardEl.appendChild(_createLinkElement(cardOptions));
            break;
        case 'text':
            cardEl.appendChild(_createTextElement(cardOptions));
            break;
        case 'keybind':
            cardEl.appendChild(_createKeybindElement(cardOptions));
            break;
        }

        card = new videojs.Card(player, {
            el: cardEl,
            type: 'normal',
            start: parseTimeStr(cardOptions.start),
            end: parseTimeStr(cardOptions.end)
        });

        return card;
    }

    /**
     * create card for comment
     */
    function createCommentCard(player, commentCount) {
        var cardEl
          , closeBtn
          , card;

        cardEl = videojs.Component.prototype.createEl(null, {
            className: 'vjs-card vjs-comment-card vjs-card-top vjs-card-left vjs-card-show'
        });

        /*closeBtn = document.createElement('a');
        closeBtn.innerHTML = 'x';
        closeBtn.className = 'vjs-card-close';
        closeBtn.onclick = function() {
            player.Card.comment.closed = true;
            $(this).parent().fadeOut();
        };

        cardEl.appendChild(closeBtn)*/

        cardEl.appendChild(document.createTextNode(
            'この動画には ' + commentCount + ' 件の補足情報があります。'
        ));

        card = new videojs.Card(player, {
            el: cardEl,
            type: 'comment',
            comment_count: commentCount,
            start: 0,
            end: 2,
            closed: false
        });

        return card;
    }

    function createSummaryCard(player) {
        var cardEl
          , card
          , title
          , summary;

        cardEl = videojs.Component.prototype.createEl(null, {
            className: 'vjs-card vjs-summary-card vjs-hidden'
        });

        title = document.createElement('h4');
        title.className = 'title';
        title.appendChild(document.createTextNode('今回のまとめ'));

        summary = document.getElementById('lesson_summary');

        cardEl.appendChild(title);
        cardEl.appendChild(document.createElement('ul'));

        for (var i = 0; i < summary.children.length; i++) {
            var li = document.createElement('li');
            li.innerHTML = summary.children[i].innerHTML;
            cardEl.lastChild.appendChild(li);
        }

        card = new videojs.Card(player, {
            el: cardEl,
            type: 'summary'
        });

        return card;
    }

    function createCenterCard(player, html, trackingLabel) {
        var cardEl
          , card;

        cardEl = videojs.Component.prototype.createEl(null, {
            className: 'vjs-card vjs-center-card vjs-card-hidden'
        });

        var div = document.createElement('div');
        div.className = 'vjs-center-card-contents';
        div.innerHTML = html;

        cardEl.appendChild(div);

        card = new videojs.Card(player, {
            el: cardEl,
            type: 'center',
            tracking_label: trackingLabel
        });

        return card;
    }

    function showCard(vjs) {
        vjs.addClass('vjs-card-show');
        vjs.removeClass('vjs-card-hidden');
    }

    function hideCard(vjs) {
        vjs.removeClass('vjs-card-show');
        vjs.addClass('vjs-card-hidden');
    }

    function layoutCenterCard(player) {
        var $centerCard = $('.vjs-center-card');

        if (player.isFullscreen()) {
            $centerCard.css('marginTop', ($(window).height() - $centerCard.height()) / 2);
        } else {
            $centerCard.css('marginTop', (player.height() - $centerCard.height()) / 2);
        }
    }

    /**
     * Card constructor
     */
    videojs.Card = videojs.Component.extend({
        /** @constructor */
        init: function(player, options) {
            // Call the parent constructor
            videojs.Component.call(this, player, options);

            if (options.type === 'normal' || options.type === 'comment' || options.type === 'keybind') {
                // for normal card
                player.on('timeupdate', videojs.bind(this, function() {
                    if (player.currentTime() >= this.options().start && player.currentTime() < this.options().end) {
                        showCard(this);
                    } else {
                        hideCard(this);
                    }
                }));
            }

            if (options.type === 'comment' || options.type === 'center') {
                player.on('ended', videojs.bind(this, function() {
                    layoutCenterCard(player);
                    showCard(this);

                    if (options.type === 'center' && !$('.vjs-center-card').hasClass('vjs-card-hidden-strongly')) {
                        Dotinstall.ga.tracking('Card', 'View', options.tracking_label)
                    }
                }));
            }

            if (options.type === 'center') {
                player.on('timeupdate', videojs.bind(this, function() {
                    if (player.currentTime() < player.duration()) {
                        hideCard(this);
                    }
                }));
            }
        }
    });

    /**
     * CardMarker
     */
    videojs.CardMarker = videojs.Component.extend({
        init: function(player, options) {
            videojs.Component.call(this, player, options);
        }
    });

    /***********************************************************************************
     * Register the plugin with videojs, main plugin function
     ***********************************************************************************/
    videojs.plugin('Card', function(options) {
        var player = this
          , normalCard
          , commentCard
          , id
          , lessonId = $('#lesson_id').val();

        function _addCardMarker(player, card) {
            var marker;

            player.on('loadedmetadata', function() {
                var start = parseTimeStr(card.start);

                // card.start + (seek handle width)
                var left = Math.round((start + 1) * 1000 / player.duration()) / 10;

                marker = new videojs.CardMarker(player, {
                    el: videojs.Component.prototype.createEl(null, {
                        className: 'vjs-card-marker'
                    })
                });

                marker.el().style.left = left + '%';

                player.controlBar.progressControl.seekBar.addChild(marker);
            });
        }

        function _addNormalCard(player, card) {
            var i;

            if (card instanceof Array) {
                for (i = 0; i < card.length; i++) {
                    _addNormalCard(player, card[i]);
                }
            } else {
                player.Card.normal[id] = player.addChild(
                    createNormalCard(player, card)
                );

                _addCardMarker(player, card);
            }
        }

        player.Card = {
            normal: []
        };

        if (typeof Dotinstall !== 'undefined' && Dotinstall.video && Dotinstall.video.cards && lessonId > 0) {
            for (id in Dotinstall.video.cards) {
                if (Dotinstall.video.cards.hasOwnProperty(id) && id === lessonId) {
                    _addNormalCard(player, Dotinstall.video.cards[id]);
                }
            }
        }

        if (options.comment_count > 0) {
            commentCard = createCommentCard(player, options.comment_count);
            player.Card.comment = player.addChild(commentCard);
        }

        if ($('#vjs_center_card_template').length > 0) {
            player.Card.center = player.addChild(
                createCenterCard(
                    player,
                    $('#vjs_center_card_template').html().replace(/^\s*<!--/, '').replace(/-->\s*$/, ''),
                    $('#vjs_center_card_template').data('tracking-label')
                )
            );
        }
    });

})(window, window.videojs);
