/**
 * Video.js Voice Selector
 *
 * This plugin for Video.js adds a voice selector option
 * to the toolbar. Usage:
 *
 * <video>
 *     <source data-voice="m" src="..." />
 *     <source data-voice="w" src="..." />
 * </video>
 */

(function(window, videojs) {
    'use strict';

    var createVoiceLabel = function(voice) {
        if (voice === 'm') {
            return '男性ボイス';
        } else if (voice === 'w') {
            return '女性ボイス';
        }
    };

    /***********************************************************************************
     * Setup our voice menu title item
     ***********************************************************************************/
    videojs.VoiceTitleMenuItem = videojs.MenuItem.extend({
        init : function(player, options) {
            // Call the parent constructor
            videojs.MenuItem.call(this, player, options);

            // No click handler for the menu title
            this.on(['click', 'tap'], function() {
                if (location.host === 'dotinstall.com' && typeof ga !== 'undefined') {
                    ga('send', 'event', 'Player', 'Click', 'voice_selector/premium');
                }
                window.open('/premium');
            });
        }
    });

    /***********************************************************************************
     * Define our voice selector button
     ***********************************************************************************/
    videojs.VoiceSelector = videojs.MenuButton.extend({
        /** @constructor */
        init : function(player, options) {
            // Call the parent constructor
            videojs.MenuButton.call(this, player, options);

            this.on('mouseover', function() {
                $(this.el()).find('.vjs-menu').addClass('vjs-lock-showing');
            });
            this.on('mouseout', function() {
                $(this.el()).find('.vjs-menu').removeClass('vjs-lock-showing');
            });
        }
    });

    // Create a menu item for each available voice
    videojs.VoiceSelector.prototype.createItems = function() {        
        var player = this.player(),
            items = [];

        // Add the menu title item
        items.push( new videojs.VoiceTitleMenuItem(player, {
            el : videojs.Component.prototype.createEl('li', {
                className: 'vjs-voice-premium-navi',
                innerHTML: 'プレミアム会員になると女性ボイスに切り替えられます'
            })
        }));

        return items;
    };

    /***********************************************************************************
     * Register the plugin with videojs, main plugin function
     ***********************************************************************************/
    videojs.plugin( 'VoiceSelector', function( options ) {
        // Only enable the plugin on HTML5 videos
        //if (!this.el().firstChild.canPlayType) { return; }

        if (!HMHM.movie.hasWomanVoice) {
            return;
        }

        // Override default options with those provided
        var player = this,
            sources = player.options().sources,
            i,
            available_voice = { length : 0 },
            current_voice,
            voiceSelector;

        // Helper function to get the current voice
        player.getCurrentVoice = function() {
            if (typeof player.currentVoice !== 'undefined') {
                return player.currentVoice;
            } else {
                try {
                    return voice = player.options().sources[0]['data-voice'];
                } catch(e) {
                    return '';
                }
            }
        };

        // Get the started voice
        current_voice = player.getCurrentVoice();

        if (current_voice) {
            current_voice = createVoiceLabel(current_voice);
        }

        // Add the voice selector button
        voiceSelector = new videojs.VoiceSelector(player, {
            el : videojs.Component.prototype.createEl(null, {
                className  : 'vjs-voice-button vjs-menu-button vjs-control',
                innerHTML  : '<div class="vjs-control-content"><span class="vjs-current-voice">男性ボイス</span></div>',
                role       : 'button',
                'aria-live': 'polite', // let the screen reader user know that the text of the button may change
                tabIndex   : 0
                
            }),
            available_voice: available_voice
        });

        // Add the button to the control bar object and the DOM
        player.controlBar.voiceSelector = player.controlBar.addChild(voiceSelector);
    });
})(window, window.videojs);
