/*
 * speed
 * https://github.com/fkoji/videojs-speed
 *
 * Copyright (c) 2014 F.Ko-Ji
 * Licensed under the MIT license.
 */

(function(window, videojs) {
    'use strict';

    // define some reasonable defaults for this sweet plugin
    var defaults = {
        default_speed: 1
    };

    var Speed;

    // plugin initializer
    Speed = function(options) {
        var settings = videojs.util.mergeOptions(defaults, options)
          , player = this
          , SpeedButton
          , SpeedMenuItem
          , i;

        // Only enable the plugin on HTML5 videos
        if (!player.el().firstChild.canPlayType) { return; }

        SpeedButton = videojs.MenuButton.extend({
            init: function(player, options, ready) {
                videojs.MenuButton.call(this, player, options, ready);

                this.on('mouseover', function() {
                    $(this.el()).find('.vjs-menu').addClass('vjs-lock-showing');
                });
                this.on('mouseout', function() {
                    $(this.el()).find('.vjs-menu').removeClass('vjs-lock-showing');
                });
            }
        });

        SpeedButton.prototype.createItems = function() {
            var items = [];

            var navi = new SpeedMenuItem(this.player, {
                el: videojs.Component.prototype.createEl('li', {
                    className: 'vjs-speed-premium-navi',
                    innerHTML: 'プレミアム会員になると動画の速度を変更できます'
                })
            });

            items.push(navi);

            return items;
        };

        SpeedMenuItem = videojs.MenuItem.extend({
            init: function(player, options, ready) {
                videojs.MenuItem.call(this, player, options, ready);

                this.on(['click', 'tap'], function() {
                    if (location.host === 'dotinstall.com' && typeof ga !== 'undefined') {
                        ga('send', 'event', 'Player', 'Click', 'speed/premium');
                    }
                    window.open('/premium');
                });
            }
        });

        var speedButton = new SpeedButton(player, {
            'el': videojs.Component.prototype.createEl(null, {
                className: 'vjs-speed-control vjs-menu-button vjs-control',
                innerHTML: 'x1.0'
            })
        });

        player.controlBar.addChild(speedButton);

        // the plugin functionality
        player.Speed = {
            button: speedButton,

            getPlaybackRate: function() {
                return player.playbackRate();
            }
        };

        if (HMHM.navigator.isAndroidChrome) {
            player.Speed.button.hide();
        }
    };

    // register the plugin with video.js
    videojs.plugin('Speed', Speed);

})(window, window.videojs);
