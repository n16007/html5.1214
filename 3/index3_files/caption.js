$(function() {
    var reversedCaptionRows
      , enableAutoScrollCaption = false
      , enableCaptionHeightChange = false
      , animateFinished = false
      , mouseY;

    function supportSelectstart() {
        return "onselectstart" in document.createElement( "div" );
    }

    function disableSelection() {
        var eventName = supportSelectstart() ? 'selectstart' : 'mousedown';
        $('body').bind(eventName + '.disableSelection', function(e) {
            e.preventDefault();
        });
    }

    function enableSelection() {
        var eventName = supportSelectstart() ? 'selectstart' : 'mousedown';
        $('body').unbind(eventName + '.disableSelection');
    }

    function setHeightOfCaptionBottomSpace() {
        var height = $('#caption').height() - $('.caption-row:last').height() - $('#caption_handle').height() + 3;
        $('#caption_bottom_space').height(height);
    }

    function getCaptionBaseTop() {
        var baseTop = $('#caption_base_top').offset().top;
        if ($('#caption_base_top').data('is-premium') === false) {
            baseTop += $('.explain_premium').height();
        }
        return baseTop;
    }

    function scrollCaption() {
        setTimeout(function() {
            if (HMHM.movie.ytplayer && HMHM.movie.ytplayer.getPlayerState() === 1) {
                doAutoScrollCaption();
                highLightCurrentCaptionRow();
            }

            scrollCaption();
        }, 400);
    }

    function doAutoScrollCaption() {
        if (!enableAutoScrollCaption) {
            return false;
        }

        seekCurrentCaptionRow(function($row, expectedScrollTop) {
            if ($('#caption').scrollTop() === expectedScrollTop) {
                return false;
            }

            enableAutoScrollCaption = false;

            $('#caption').animate({
                scrollTop: expectedScrollTop
            }, 450, function() {
                animateFinished = true;
                enableAutoScrollCaption = true;
            });
        });
    }

    function highLightCurrentCaptionRow() {
        seekCurrentCaptionRow(function($row, _) {
            $('.caption-row').removeClass('active');
            $row.addClass('active');

            $('.caption-row').find('.iconSound').removeClass('on');
            $row.find('.iconSound').removeClass('mouseover').addClass('on');
        });
    }

    function seekCurrentCaptionRow(callback) {
        var expectedScrollTop = 0
          , currentTime = ~~HMHM.movie.ytplayer.getCurrentTime()
          , $row
          , rowSec
          , i
          , j;

        // 最後の行からたどる
        for (i = 0; i < reversedCaptionRows.length; i++) {
            $row = $(reversedCaptionRows[i]);

            rowSec = $row.data('time').substr(0, 1) * 60 + $row.data('time').substr(2, 3) * 1;

            // 現在の再生時間が初めて行の再生時間を超える -> その行がスクロールの目標
            if (rowSec <= currentTime) {
                // 残りの行の height 等を加算してスクロール量を決定
                for (var j = i + 1; j < reversedCaptionRows.length; j++) {
                    expectedScrollTop += $(reversedCaptionRows[j]).height() + 15;
                }
                callback($row, expectedScrollTop);
                break;
            }
        }
    }

    $('#caption').on('scroll', function(e) {
        if (animateFinished === true) {
            //console.log('Animation scroll');
            animateFinished = false;
        } else {
            if ($(this).is(':animated')) {
                //console.log('Animation scroll');
            } else {
                enableAutoScrollCaption = false;

                $('#caption').stop(true, false);

                HMHM.movie.captionAutoScroll = false;

                if (HMHM.movie.ytplayer.getPlayerState() === 1) {
                    $('.caption-revert-auto-scroll').fadeIn();
                }
                //console.log('Manual scroll');
            }
        }
    });

    $('.caption-revert-auto-scroll').on('click', function() {
        enableAutoScrollCaption = true;

        HMHM.movie.captionAutoScroll = true;

        $(this).fadeOut();
    });

    if (HMHM.cookie.get('caption_height')) {
        $('#caption').height(HMHM.cookie.get('caption_height'));
    }

    // toggle caption
    $('#toggle_text').click(function() {
        if ($('#caption_wrapper').is(':visible')) {
            $('#caption_handle').fadeOut();
            $('#caption_wrapper').slideUp();
            $('#toggle_text_label').text('表示する');

            HMHM.cookie.set('display_caption', 0, 86400*90*1000, '/lessons/');

            Dotinstall.ga.tracking('Button', 'Click', 'transcript/close');
        } else {
            $('#caption_wrapper').slideDown();
            $('#caption_handle').fadeIn();
            $('#toggle_text_label').text('閉じる');

            HMHM.cookie.set('display_caption', 1, 86400*90*1000, '/lessons/');

            Dotinstall.ga.tracking('Button', 'Click', 'transcript/open');
        }
        setHeightOfCaptionBottomSpace();
    });

    $('.cinfo-link').click(function(e) {
        e.preventDefault();

        var sec = (function(t) {
            var sTime = t.split(':');
            return sTime[0] * 60 + sTime[1] * 1;
        })( $(this).parents('.caption-row').data('time') );

        HMHM.movie.ytplayer.seekTo(sec, true);
        HMHM.movie.ytplayer.playVideo();
    });

    $('.caption-row').click(function(e) {
        var sec = (function(t) {
            var sTime = t.split(':');
            return sTime[0] * 60 + sTime[1] * 1;
        })( $(this).data('time') );

        HMHM.movie.ytplayer.seekTo(sec, true);
        HMHM.movie.ytplayer.playVideo();
    });

    $('#caption_handle').on('mousedown', function(e) {
        enableCaptionHeightChange = true;
        disableSelection();
        mouseY = e.clientY;
    });

    // update caption height by drag
    $('body').on('mouseup', function() {
        enableCaptionHeightChange = false;
        enableSelection();
    }).on('mousemove', function(e) {
        if (enableCaptionHeightChange) {
            var amount = e.clientY - mouseY;
            mouseY = e.clientY;
            var newHeight = $('#caption').height() + amount;
            if (newHeight < 0) {
                newHeight = 0;
            }
            if (newHeight > $('#caption').get(0).scrollHeight) {
                newHeight = $('#caption').get(0).scrollHeight;
            }
            HMHM.cookie.set('caption_height', newHeight, 86400*90*1000, '/lessons/');
            $('#caption').height(newHeight);

            // last row can be scrolled to top.
            setHeightOfCaptionBottomSpace();
        }
    });

    /*$('#caption_wrapper').on('mouseenter', function() {
        enableAutoScrollCaption = false;
        $('#caption').stop();
    });

    $('#video_section').on('mouseleave', function() {
        enableAutoScrollCaption = true;
    });*/

    // disabled auto scroll if mouseover
    $('.caption-row').on('mouseover', function() {
        if (!$(this).find('.iconSound').hasClass('on')) {
            $(this).find('.iconSound').addClass('mouseover');
        }
    }).on('mouseout', function() {
        if (!$(this).find('.iconSound').hasClass('on')) {
            $(this).find('.iconSound').removeClass('mouseover');
        }
    });

    if ($('.caption-row').length > 0) {
        enableAutoScrollCaption = true;
        reversedCaptionRows = $('.caption-row').get().reverse();
        setHeightOfCaptionBottomSpace();
    }

    // start caption auto scroll
    if ($('#caption').length === 1) {
        scrollCaption();
    }

    if (!HMHM.navigator.isFirefox) {
        (function() {
            'use strict';

            var scrollTimer = null;
            var scrollEndEvent = new $.Event('scrollend');

            $(window).on('scroll', function() {
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                } else {
                    // Process for scroll start
                    $('#caption').css('overflow-y', 'hidden');
                }

                scrollTimer = setTimeout(function() {
                    $(window).trigger(scrollEndEvent);
                }, 200);
            });

            $(window).on('scrollend', function() {
                // Be sure to set null
                scrollTimer = null;
                $('#caption').css('overflow-y', 'scroll');
            });
        })();
    }
});
