/**
 * Video.js Resolution Selector
 *
 * This plugin for Video.js adds a resolution selector option
 * to the toolbar. Usage:
 *
 * <video>
 *     <source data-res="480" src="..." />
 *     <source data-res="240" src="..." />
 * </video>
 */

(function(window, videojs) {
    'use strict';

    var SUPER_HIGH_RES     = 720
      , HIGH_RES           = 480
      , LOW_RES            = 360
      , HIGH_RES_CSS_CLASS = 'vjs-res-high'
      , LOW_RES_CSS_CLASS  = 'vjs-res-low';

    var createResolutionLabel = function(resolution) {
        if (resolution >= SUPER_HIGH_RES) {
            return '最高画質';
        } else if (resolution >= HIGH_RES) {
            return '高画質';
        } else {
            return '標準画質';
        }
        return (/^\d+$/.test(resolution)) ? resolution + 'p' : resolution;
    };

    var createResolutionCssClass = function(resolution) {
        if (resolution >= HIGH_RES) {
            return HIGH_RES_CSS_CLASS;
        } else {
            return LOW_RES_CSS_CLASS;
        }
    };

    var selectSrcByVoiceType = function(srcSet, voiceType) {
        var i;

        for (i = 0; i < srcSet.length; i++) {
            if (srcSet[i]['data-voice'] === voiceType) {
                return srcSet[i];
            }
        }

        return srcSet[0];
    };

    var Source = function(resolution, src) {
        this.resolution = resolution;
        this.src = src;
    };

    var selectExpectedSrc = function(player, availableSoures, resolution, toggle) {
        var expectedSrc;

        if (toggle) {
            for (var res in availableSoures) {
                if (res === 'length') { continue; }
                if (res != resolution) {
                    resolution = res;
                    break;
                }
            }
        }

        if (HMHM.movie.hasWomanVoice) {
            if (player.getCurrentVoice && player.getCurrentVoice() === 'w') {
                expectedSrc = selectSrcByVoiceType(availableSoures[resolution], 'w');
            } else {
                expectedSrc = selectSrcByVoiceType(availableSoures[resolution], 'm');
            }
        } else {
            expectedSrc = availableSoures[resolution][0];
        }

        return new Source(resolution, expectedSrc);
    };

    /***********************************************************************************
     * Setup our resolution menu item
     ***********************************************************************************/
    /*videojs.ResolutionMenuItem = videojs.MenuItem.extend({
        init: function(player, options, ready) {

            // Modify options for parent MenuItem class's init.
            options.label = createResolutionLabel(options.res);
            options.selected = (options.res.toString() === player.getCurrentRes().toString());

            // Call the parent constructor
            videojs.MenuItem.call(this, player, options, ready);

            // Store the resolution as a call property
            this.resolution = options.res;

            // Register our click handler
            this.on('click', this.onClick);

            // Toggle the selected class whenever the resolution changes
            player.on('changeRes', videojs.bind(this, function() {
                if (this.resolution == player.getCurrentRes()) {
                    this.selected( true );
                } else {
                    this.selected( false );
                }
            }));
        }
    });*/

    // Handle clicks on the menu items
    /*videojs.ResolutionMenuItem.prototype.onClick = function() {
        
        var player = this.player(),
            video_el = player.el().firstChild,
            current_time = player.currentTime(),
            is_paused = player.paused(),
            button_nodes = player.controlBar.resolutionSelector.el().firstChild.children,
            button_node_count = button_nodes.length,
            expectedSrc;

        // Do nothing if we aren't changing resolutions
        if (player.getCurrentRes() == this.resolution) { return; }

        // Make sure the loadedmetadata event will fire
        if ('none' === video_el.preload) { video_el.preload = 'metadata'; }

        if (HMHM.movie.hasWomanVoice) {
            if (player.getCurrentVoice() === 'w') {
                expectedSrc = selectSrcByVoiceType(player.availableRes[this.resolution], 'w');
            } else {
                expectedSrc = selectSrcByVoiceType(player.availableRes[this.resolution], 'm');
            }
        } else {
            expectedSrc = player.availableRes[this.resolution][0];
        }

        // Change the source and make sure we don't start the video over        
        player.src(expectedSrc).one('loadedmetadata', function() {
            player.currentTime( current_time );

            if (!is_paused) { player.play(); }
        });

        // Save the newly selected resolution in our player options property
        player.currentRes = this.resolution;

        // Update the button text
        while (button_node_count > 0) {
            button_node_count--;

            if ('vjs-current-res' === button_nodes[button_node_count].className) {
                button_nodes[button_node_count].innerHTML = createResolutionLabel(this.resolution);
                break;
            }
        }

        // Update the classes to reflect the currently selected resolution
        player.trigger('changeRes');
    };*/

    /***********************************************************************************
     * Setup our resolution menu title item
     ***********************************************************************************/
    /*videojs.ResolutionTitleMenuItem = videojs.MenuItem.extend({
        init: function(player, options, ready) {
            // Call the parent constructor
            videojs.MenuItem.call(this, player, options, ready);

            // No click handler for the menu title
            this.off('click');
        }
    });*/

    /***********************************************************************************
     * Define our resolution selector button
     ***********************************************************************************/
    videojs.ResolutionSelector = videojs.Button.extend({
        /** @constructor */
        init: function(player, options, ready) {
            // Add our list of available resolutions to the player object
            player.availableRes = options.available_res;

            // Call the parent constructor
            videojs.Button.call(this, player, options, ready);

            this.on(['click', 'tap'], function() {
                var expectedSrc
                , current_time = player.currentTime()
                , is_paused = player.paused();

                expectedSrc = selectExpectedSrc(player, options.available_res, player.currentRes, true);

                player.src(expectedSrc.src).one('loadedmetadata', function() {
                    player.currentTime(current_time);

                    if (!is_paused) { player.play(); }
                });

                if (expectedSrc.resolution >= HIGH_RES) {
                    $(this.el()).find('.vjs-current-res').removeClass(LOW_RES_CSS_CLASS).addClass(HIGH_RES_CSS_CLASS);
                } else {
                    $(this.el()).find('.vjs-current-res').removeClass(HIGH_RES_CSS_CLASS).addClass(LOW_RES_CSS_CLASS);
                }

                player.currentRes = expectedSrc.resolution;

                player.trigger('changeRes');
            });
        }
    });

    // Create a menu item for each available resolution
    /*videojs.ResolutionSelector.prototype.createItems = function() {
        var player = this.player(),
            items = [],
            current_res;

        // Add the menu title item
        items.push(new videojs.ResolutionTitleMenuItem(player, {
            el: videojs.Component.prototype.createEl('li', {
                className: 'vjs-menu-title vjs-res-menu-title',
                innerHTML: 'Quality'
            })
        }));

        // Add an item for each available resolution
        for (current_res in player.availableRes) {
            // Don't add an item for the length attribute
            if ( 'length' == current_res ) { continue; }

            items.push(new videojs.ResolutionMenuItem(player, {
                res: current_res
            }));
        }

        // Sort the available resolutions in descending order
        items.sort(function(a, b) {
            if ( typeof a.resolution == 'undefined' ) {
                return -1;
            } else {
                return parseInt( b.resolution ) - parseInt( a.resolution );
            }
        });

        return items;
    };*/

    /***********************************************************************************
     * Register the plugin with videojs, main plugin function
     ***********************************************************************************/
    videojs.plugin('ResolutionSelector', function(options) {
        // Only enable the plugin on HTML5 videos
        //if (!this.el().firstChild.canPlayType) { return; }

        // Override default options with those provided
        var player = this,
            sources = player.options().sources,
            i,
            j,
            settings = videojs.util.mergeOptions({
                default_res: null, // (string)    The resolution that should be selected by default
                force_types: false // (array)    List of media types. If passed, we need to have source for each type in each resolution or that resolution will not be an option
            }, options),
            available_res = { length: 0 },
            current_res,
            resolutionSelector,
            currentQualityCssClass,
            expectedSrc;

        var filterUnavailableVideos = function(sources) {
            var i
              , source
              , filteredSources = [];

            for (i = 0; i <= sources.length - 1; i++) {
                source = sources[i];

                if (player.el().firstChild.canPlayType) {
                    if (player.el().firstChild.canPlayType(source.type) !== '') {
                        filteredSources.push(source);
                    }
                } else {
                    // Safari and IE8 must be mp4
                    if (HMHM.navigator.isSafari || HMHM.navigator.isIE8) {
                        if (source.type === 'video/mp4') {
                            filteredSources.push(source);
                        }
                    }
                }
            }

            return filteredSources;
        };

        // Get all of the available resoloutions
        for (i = sources.length - 1; i >= 0; i--) {
            // Skip sources that don't have data-res attributes
            if ( ! sources[i]['data-res'] ) { continue; }

            current_res = sources[i]['data-res'];

            if (typeof available_res[current_res] !== 'object') {
                available_res[current_res] = [];
                available_res.length++;
            }

            available_res[current_res].push(sources[i]);
        }

        // Check for forced types
        if (settings.force_types) {
            for (current_res in available_res) {
                // Don't count the length property as a resolution
                if ('length' == current_res) { continue; }

                available_res[current_res] = filterUnavailableVideos(available_res[current_res]);

                if (available_res[current_res].length === 0) {
                    delete available_res[current_res];
                    available_res.length--;
                }
            }
        }

        // Make sure we have at least 2 available resolutions before we add the button
        if (available_res.length < 2) { return; }

        // Set the video to start out with the default res if it's available
        if (settings.default_res && available_res[settings.default_res]) {
            expectedSrc = selectExpectedSrc(player, available_res, settings.default_res, false)

            setTimeout(function() {
                player.src(expectedSrc.src);
            }, 1);

            player.currentRes = settings.default_res;
        }

        // IE9+ can play webm with plugin, so we check which video type will be played.
        if (HMHM.navigator.isIE && player.currentType() === 'video/mp4' && !/vimeo\.com/.test(player.src())) {
            return;
        }

        // Helper function to get the current resolution
        player.getCurrentRes = function() {
            if ( typeof player.currentRes !== 'undefined' ) {
                return player.currentRes;
            } else {
                try {
                    return res = player.options().sources[0]['data-res'];
                } catch(e) {
                    return '';
                }
            }
        };

        // Get the started resolution
        current_res = player.getCurrentRes();

        if (current_res) {
            currentQualityCssClass = createResolutionCssClass(current_res);
        } else {
            currentQualityCssClass = createResolutionCssClass(player.currentRes);
        }

        // Add the resolution selector button
        resolutionSelector = new videojs.ResolutionSelector( player, {
            el: videojs.Component.prototype.createEl( null, {
                className  : 'vjs-res-button vjs-menu-button vjs-control',
                innerHTML  : '<div class="vjs-control-content"><span class="vjs-current-res '+currentQualityCssClass+'">HD</span></div>',
                role       : 'button',
                'aria-live': 'polite', // let the screen reader user know that the text of the button may change
                tabIndex   : 0
            }),
            available_res: available_res
        });

        // Add the button to the control bar object and the DOM
        player.controlBar.resolutionSelector = player.controlBar.addChild(resolutionSelector);
    });

})(window, window.videojs);
