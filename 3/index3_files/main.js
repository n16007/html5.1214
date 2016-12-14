$(function() {
    function setupSwitchToNewDesign() {
        var content = [
            '<p>デザインはあとで元に戻すこともできます。新しいデザインに切り替えますか？</p>',
            '<p class="txc">',
            '<input type="button" class="btn btn-info" value="切り替える" id="exec_switch_to_new_design">',
            '<input type="button" class="btn" value="いいえ" id="close_switch_design_popover">',
            '</p>'
        ].join('');

        $('#switch_to_new_design').popover({
            trigger: 'click',
            html: true,
            title: 'このページの新しいデザインを試す',
            content: content,
            placement: 'left'
        }).on('click', function() {
            setNewDesignPopoverCookie();
        });

        $('#main')
            .on('click', '#exec_switch_to_new_design', function() {
                $(this).prop('disabled', true);
                $('#close_switch_design_popover').prop('disabled', true);

                setNewDesignPopoverCookie();

                $.post('/user/switch_to_new_design.json', {
                    user_id: $('#user_id').val(),
                    token: $('#switch_to_new_design_token').val(),
                    width: $(window).width(),
                    one_time_token: $('.one_time_token').val()
                }).done(function() {
                    location.reload();
                });
            })
            .on('click', '#close_switch_design_popover', function() {
                $('#switch_to_new_design').popover('hide');

                setNewDesignPopoverCookie();
            });
    }

    function setNewDesignPopoverCookie() {
        HMHM.cookie.set('switch_to_new_design_4491', 1, 86400*1000*30, '/lessons/');
    }

    // hide #back-top first
    $("#back-top").hide();

    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 60) {
            $('#back-top').fadeIn();
        } else {
            $('#back-top').fadeOut();
        }
    });

    // scroll body to 0px on click
    $('#back-top a').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, 500);

        Dotinstall.ga.tracking('Icon', 'Click', 'back-top');

        return false;
    });

    $('#signup_top_bar .close').on('click', function() {
        $('#signup_top_bar').hide();
        HMHM.cookie.set('display_signup_topbar', 'hide', 7*86400*1000, '/');
    });

    $('#explain_premium_for_transcript .close').on('click', function() {
        $('#explain_premium_for_transcript').fadeOut();
        HMHM.cookie.set('display_ep_for_transcript', 'hide', 7*86400*1000, '/');
    });

    $('#notice_for_course_link .close').on('click', function() {
        $('#notice_for_course_link').fadeOut();
        HMHM.cookie.set('display_notice_for_course_link', 'hide', 30*86400*1000, '/');
    });

    $('a.package_lesson_more').on('click', function(e) {
        var ename
          , $hiddenRows
          , $linkRow;

        e.preventDefault();

        ename = $(this).data('package-ename');

        $hiddenRows = $(this).parents('.lesson_table_'+ename).find('tr:hidden');//.fadeIn(500);
        $linkRow = $(this).parent().parent();//.hide();

        HMHM.lesson.getPackageProgress(ename, {
            completed: function(lesson) {
                $('#progress_lesson_title_' + lesson.id).addClass('done');
                $('#progress_lesson_completed_' + lesson.id).text('完了済');
            },
            notCompleted: function(lesson) {
                $('#progress_lesson_title_' + lesson.id).removeClass('done');
                $('#progress_lesson_completed_' + lesson.id).text('---');
            },
            after: function() {
                $hiddenRows.fadeIn(500);
                $linkRow.hide();
            }
        });
    });

    if ($('#memo')[0]) {
        if (!HMHM.navigator.isSmartphone && !HMHM.navigator.isTablet) {
            $('#memo').on('keydown', function() {
                HMHM.memo.lastKeydownTime = HMHM.getTime();
                HMHM.memo.autoSave();
                $('#memo_sysmessage').fadeOut(300);
            });
            // 初期value
            HMHM.memo.savedVal = $('#memo').val();
        } else {
            $('#memo').on('blur', function() {
                HMHM.memo.save(true);
            });
        }
    }

    $('#load_memo').click(function(e) {
        e.preventDefault();
        HMHM.memo.load();
    });

    $('ul#lesson-info-tabs').children('li').click(function(e) {
        HMHM.ui.switchTabs(e, this);
    });

    if ($('ul.hash-linked-tabs')[0]) {
        if (location.hash.match(/^#!/)) {
            var tabBodyId = location.hash.substr(2);
            if (document.getElementById(tabBodyId)) {
                $('li#tab_'+tabBodyId + ' > a').trigger('click');
            }
        }

        $('ul.hash-linked-tabs').on('click', 'li', function(e) {
            if ($(this).data('tab-default') === 1) {
                location.hash = '';
            } else {
                if ($(this).attr('id')) {
                    location.hash = '!'+$(this).attr('id').substr(4);
                } else {
                    location.hash = '';
                }
            }
        });
    }

    $('#change_to_smartphone_view').click(function(e) {
        e.preventDefault();

        Dotinstall.cookie.remove('display_pc_view', '/');

        location.reload();
    });

    $('#clear_memo_search').click(function() {
        $('#memo_search_query').val('');
        HMHM.memo.clearSearch();
    });

    $('#memo_search_query').on('keyup change', function() {
        if ($(this).val() == '' && HMHM.memo.searchQuery != '') {
            HMHM.memo.clearSearch();
        }
    });

    if ($('#switch_to_new_design')[0]) {
        setupSwitchToNewDesign();

        if (HMHM.cookie.get('switch_to_new_design_4491') !== '1') {
            $('#switch_to_new_design').popover('show');
        }

        $(window).on('resize', function() {
            $('#switch_to_new_design').popover('hide');
        });
    }

    $('#toggle_memo').click(function() {
        if ($('#memo_form').is(':visible')) {
            HMHM.cookie.set('hide_memo', 1, 86400*90*1000, '/lessons/');
            $('#memo_form').fadeOut();
            $(this).text('学習メモを表示する');
        } else {
            HMHM.cookie.set('hide_memo', '', -86400*1000, '/lessons/');
            $('#memo_form').fadeIn();
            $(this).text('学習メモを非表示にする');
        }
    });

    // hide news if cookie is set and no new news.
    if ($('#side_news_body')[0]) {
        var hideNews = HMHM.cookie.get('hide_news');
        if (hideNews && hideNews * 1 >= $('#latest_news_id').val() * 1) {
            HMHM.news.hide();
        }
    }

    // toggle side news
    $('#toggle_side_news_body').click(function() {
        if ($('#side_news_body').is(':visible')) {
            HMHM.cookie.set('hide_news', $('#latest_news_id').val()*1, 86400*90*1000, '/');
            HMHM.news.hide();
        } else {
            HMHM.cookie.set('hide_news', '', -86400*1000, '/');
            HMHM.news.show();
        }
    });
});
/* //document.ready */

if (typeof HMHM == 'undefined') {
    var HMHM = {}; 
}

HMHM.navigator = {};
HMHM.navigator.isSmartphone = (function() {
    if (navigator.userAgent.match(/^Mozilla.+(iPhone|iPod|iPhone Simulator);.+iPhone OS.+AppleWebKit/) != null) {
        return true;
    }
    if (navigator.userAgent.match(/Android.+Mobile/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isTablet = (function() {
    if (navigator.userAgent.match(/iPad;.+ OS.+AppleWebKit/) != null) {
        return true;
    }
    if (navigator.userAgent.match(/Android ((?!Mobile).)+$/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isAndroidChrome = (function() {
    if (navigator.userAgent.match(/Android.+Chrome/) !== null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isChrome = (function() {
    if (navigator.userAgent.match(/^Mozilla\/.+AppleWebKit\/.+Chrome\/.+Safari.+$/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isFirefox = (function() {
    if (navigator.userAgent.match(/Firefox/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isSafari = (function() {
    if (navigator.userAgent.match(/AppleWebKit.+Safari/) != null) {
        // This pattern matches safari and chrome, so must not be chrome.
        return !HMHM.navigator.isChrome;
    }
    return false;
})();
HMHM.navigator.isOpera = (function() {
    if (navigator.userAgent.match(/ OPR\/[0-9]/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isIE = (function() {
    if (navigator.userAgent.match(/MSIE/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isIE8 = (function() {
    if (navigator.userAgent.match(/MSIE 8\.0/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isEdge = (function() {
    if (navigator.userAgent.match(/Chrome\/.+Safari\/.+Edge\//) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isWin81Chrome = (function() {
    if (navigator.userAgent.match(/^Mozilla\/[\d\.]+ \(Windows NT 6\.3(; WOW\d+)?\) AppleWebKit\/[\d\.]+ \(KHTML, like Gecko\) Chrome\/[\d\.]+ Safari\/[\d\.]+$/) != null) {
        return true;
    }
    return false;
})();
HMHM.navigator.isWin = (function() {
    return (navigator.userAgent.match(/Windows /) !== null);
})();

HMHM.navigator.isAvailableFlash = function() {
    if (navigator.mimeTypes['application/x-shockwave-flash'] && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
        return true;
    }

    try {
        var flash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        return true;
    } catch (e) {
        return false;
    }

    return false;
};

HMHM.getTime = function() {
    var d = new Date();
    return d.getTime();
};

// alternative setTimeout
HMHM.wait = function(t) {
  return $.Deferred(function(self) {
    setTimeout(self.resolve, t);
  }).promise();
};

// alternative setTimeout repeat
HMHM.repeat = function(t, fn) {
  fn();
  HMHM.wait(t).done(function() {
    HMHM.repeat(t, fn);
  });
};

HMHM.ui = {};
HMHM.ui.switchTabs = function(e, tab) {
    if (e) {
        e.preventDefault();
    }

    $(tab).siblings().removeClass('active');
    $(tab).addClass('active');

    $(tab).parent().children().each(function() {
        var tabBodyId = $(this).attr('id').replace(/^tab-/, '');
        if ($(this).hasClass('active')) {
            $('#'+tabBodyId).show();
        } else {
            $('#'+tabBodyId).hide();
        }
    });
}

HMHM.lesson = {};
HMHM.lesson.sendingComplete = false;

/* animate progress bar */
HMHM.lesson.animateProgressBar = function(json) {
    var width = Math.floor(json.completed_lesson_count * 100 / json.lesson_count*1);
    $('div.progress div.bar').animate({
        width: width+"%"
    }, 500, function() {
        if (width == 100) {
            $('div.progress').removeClass('progress-green').addClass('progress-green-done');
        } else {
            $('div.progress').addClass('progress-green').removeClass('progress-green-done');
        }
    });

    if ($('#myStat').length) {
        $('#myStat')
            .empty()
            .data('text', width+'%')
            .data('percent', width)
            .circliful();
    }
};

HMHM.lesson.getPackageProgress = function(ename, callback) {
    $.get('/home/progress', {
        ename: ename
    }).done(function(res) {
        var i, lesson;

        if (!res.lessons) {
            return false;
        }

        for (i = 0; i < res.lessons.length; i++) {
            lesson = res.lessons[i];

            if (lesson.completed) {
                callback.completed(lesson);
            } else {
                callback.notCompleted(lesson);
            }
        }

        callback.after(res);
    });
};

HMHM.lesson.getPackageHistoryCount = function(ename) {
    $.get('/home/history_count', {
        ename: ename
    }).done(function(res) {
        $('#history_count').text(res.history_count);
    });
};

/* movie */
HMHM.movie = {};
HMHM.movie.isLogin = false;
HMHM.movie.isFirstPlaying = true;
HMHM.movie.historyId = 0;
HMHM.movie.formatDuration = function(sec) {
    if (sec < 60 ) {
        if (sec < 10) sec = '0' + sec;
        return '00:'+sec;
    }
    var min = Math.floor(sec / 60);
    var sec = sec - 60 * min;
    if (min < 10) min = '0' + min;
    if (sec < 10) sec = '0' + sec;
    return min+':'+sec;
};

HMHM.movie.ytplayer = null;
HMHM.movie.startTime = null;
HMHM.movie.preCurrentTime = null;
HMHM.movie.currentTime = null;
HMHM.movie.nowSending = false;
HMHM.movie.isStartPlayback = false;
HMHM.movie.captionAutoScroll = true;

HMHM.movie.playHistory = [];
HMHM.movie.autoplay = {
    next: function() {
        var popup = false
          , _$
          , nextPath;

        if (window.opener === null || typeof window.opener === 'undefined') {
            _$ = window.$;
        } else {
            popup = true;
            _$ = window.opener.$;
        }

        if (_$('#autoplay').is(':checked') && !_$('#go_to_next_video').hasClass('disabled')) {
            nextPath = _$('#go_to_next_video').attr('href');

            if (popup) {
                // 先に opener を遷移させて
                window.opener.location.href = nextPath;

                // その後に Cookie をセット
                HMHM.movie.autoplay.setAutoplayCookie();

                $form = _$('<form method="post" id="popup_video_form"></form>')
                            .attr('action', nextPath + '/popup')
                            .attr('target', 'dotinstall_popup');

                $form.appendTo('body').submit();
            } else {
                // set cookie
                HMHM.movie.autoplay.setAutoplayCookie();
                location.href = nextPath;
            }
        }
    },
    playIfMovedAutomatically: function() {
        var autoplay = HMHM.cookie.get('autoplay');

        if (autoplay === '1') {
            HMHM.movie.autoplay.removeAutoplayCookie();
            HMHM.movie.vimeo.player.playVideo() || HMHM.movie.videojs.player.playVideo()
        }
    },
    setAutoplayCookie: function() {
        HMHM.cookie.set('autoplay', 1, 365*86400*1000, '/lessons');
    },
    removeAutoplayCookie: function() {
        HMHM.cookie.set('autoplay', '', -86400*1000, '/lessons');
    },
    logIfOn: function() {
        var _$, imgEl, src;

        if (window.opener !== null) {
            popup = true;
            _$ = window.opener.$;
        } else {
            _$ = window.$;
        }

        if (_$('#autoplay').is(':checked')) {
            imgEl = document.createElement('img');

            src = '/img/__vjs.gif?' + [
                'fullscreen=1',
                'autoplay=1',
                'uri='+encodeURIComponent(location.href)
            ].join('&');

            imgEl.src = src;

            document.body.appendChild(imgEl);
        }
    }
};

HMHM.movie.seekAndPlay = function() {
    var m;
    if (m = location.hash.match(/^#t=(\d+)$/)) {
        HMHM.movie.vimeo.player.seekTo(m[1]) || HMHM.movie.videojs.player.seekTo(m[1]);
        HMHM.movie.vimeo.player.playVideo() || HMHM.movie.videojs.player.playVideo();
    }
};

HMHM.movie.skipPlayback = function() {
  return ( Math.abs(HMHM.movie.preCurrentTime - HMHM.movie.currentTime) > 2.0);
}

HMHM.movie.monitorCurrentTime = function() {
  if (HMHM.movie.ytplayer === null) {
    return false;
  }

  // playing
  if (HMHM.movie.ytplayer.getPlayerState() === 1) {
    HMHM.movie.currentTime = HMHM.movie.ytplayer.getCurrentTime();
 
    // check skip playback
    if (HMHM.movie.skipPlayback()) {
      // stack in history
      HMHM.movie.stackPlayHistory(); // console.log('skipped');
 
      // reset
      HMHM.movie.startTime = HMHM.movie.currentTime;
      HMHM.movie.preCurrentTime = HMHM.movie.currentTime;
    } else {
      HMHM.movie.preCurrentTime = HMHM.movie.currentTime;
    }
  }
};

HMHM.movie.stackPlayHistory = function() {
  var st = ~~HMHM.movie.startTime;
  var et = ~~HMHM.movie.preCurrentTime;

  var history = (st === et) ? st : st+'-'+et;

  HMHM.movie.playHistory.push(history);
  //console.log(HMHM.movie.playHistory);
};

/* handler for changing state */
HMHM.movie.onYtplayerStateChange = function(state) {
    //console.log('state='+state);

    switch (state) {
    case 1: // playing
        if (HMHM.movie.isFirstPlaying) {
            HMHM.movie.isFirstPlaying = false;
            HMHM.movie.stackPlayHistory();
            HMHM.movie.sendUpdatePlayHistory();
        }

        // reset
        HMHM.movie.startTime = HMHM.movie.ytplayer.getCurrentTime();
        HMHM.movie.currentTime = HMHM.movie.startTime;
        HMHM.movie.preCurrentTime = HMHM.movie.startTime;
        HMHM.movie.isStartPlayback = true;
        break;
    case (0 || 2 || 3): // ended, pause, buffering
        // should not be sent if video is stopped.
        if (!HMHM.movie.isStartPlayback) {
            break;
        }

        HMHM.movie.isStartPlayback = false;

        HMHM.movie.stackPlayHistory();
        HMHM.movie.sendUpdatePlayHistory();

        // reset
        HMHM.movie.startTime = HMHM.movie.ytplayer.getCurrentTime();
        HMHM.movie.currentTime = HMHM.movie.startTime;
        HMHM.movie.preCurrentTime = HMHM.movie.startTime;
    default:
        break;
    }
};
/* send playback history */
HMHM.movie.sendUpdatePlayHistory = function() {
    // end if user is not login
    if (!HMHM.movie.isLogin) {
        return false;
    }

    // end if pre sending is not completed.
    if (HMHM.movie.nowSending) {
        return false;
    }

    // end if history is empty
    if (HMHM.movie.playHistory.length === 0) {
        return false;
    }

    HMHM.movie.nowSending = true;

    var playHistory = HMHM.movie.playHistory.join(',');

    // send
    $.ajax({
        url:'/lesson/update_play_history?h='+playHistory,
        type:'POST',
        data:{
            history_id: HMHM.movie.historyId,
            user_id: $('#user_id').val(),
            lesson_id: $('#lesson_id').val(),
            play_history: playHistory,
            one_time_token:$('input[name="one_time_token"]:first').val()
        },
        timeout:15000,
        success:function(json) {
            HMHM.movie.nowSending = false;
        }
    });
};

HMHM.movie.onPlaybackQualityChange = function(quality) {
    var cookieStr = [
        'playback_quality=',
        encodeURIComponent(quality),
        '; path=/lessons'
    ].join('');
    document.cookie = cookieStr;
}
HMHM.movie.setDefaultPlaybackQuality = function() {
    if (!document.cookie) {
        return false;
    }
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var str = cookies[i].split("=");
        if (str[0] == 'playback_quality') {
            HMHM.movie.ytplayer.setPlaybackQuality(str[1]);
            return true;
        }
    }
    HMHM.movie.ytplayer.setPlaybackQuality('large');
}

HMHM.movie.setCurrentPlayer = function(playerId) {
    var cookieStr = [
        'current_player=',
        encodeURIComponent(playerId),
        '; path=/lessons'
    ].join('');
    document.cookie = cookieStr;
};

HMHM.movie.vimeo = {};
HMHM.movie.vimeo.playerReady = false;
// same as YouTube Player API state
HMHM.movie.vimeo.state = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
};
HMHM.movie.vimeo.currentState = HMHM.movie.vimeo.state.UNSTARTED;
HMHM.movie.vimeo.currentTime = 0.0;
HMHM.movie.vimeo.onMessageReceived = function(event) {
    var data, method;

    try {
        data = JSON.parse(event.data);
        method = data.event || data.method;
    } catch(e) {
        return false;
    }

    if (method == 'ready') {
        HMHM.movie.vimeo.playerReady = true;

        HMHM.movie.vimeo.postMessage('addEventListener', 'play');
        HMHM.movie.vimeo.postMessage('addEventListener', 'pause');
        HMHM.movie.vimeo.postMessage('addEventListener', 'finish');
        HMHM.movie.vimeo.postMessage('addEventListener', 'playProgress');
        HMHM.movie.vimeo.postMessage('addEventListener', 'seek');

        HMHM.movie.ytplayer = HMHM.movie.vimeo.player;

        HMHM.movie.autoplay.playIfMovedAutomatically();
    }

    if (method == 'play') {
        HMHM.movie.vimeo.on.play();
    }

    if (method == 'pause') {
        HMHM.movie.vimeo.on.pause();
    }

    if (method == 'finish') {
        HMHM.movie.vimeo.on.finish();
    }

    if (method == 'playProgress') {
        HMHM.movie.vimeo.currentTime = data.data.seconds;
    }

    if (method == 'seek') {
        HMHM.movie.vimeo.player.playVideo();
    }
};
HMHM.movie.vimeo.postMessage = function(method, params) {
    var iframe, url, data;

    iframe = document.getElementById('vimeo_player');

    url = iframe.getAttribute('src').split('?')[0];
    if (url.substr(0, 2) === '//') {
        url = window.location.protocol + url;
    }

    data = JSON.stringify({
        method: method,
        value: params
    });

    iframe.contentWindow.postMessage(data, url);
};

HMHM.movie.vimeo.on = {
    play: function() {
        HMHM.movie.vimeo.currentState = HMHM.movie.vimeo.state.PLAYING;
        HMHM.movie.onYtplayerStateChange(HMHM.movie.vimeo.currentState);
    },
    pause: function() {
        HMHM.movie.vimeo.currentState = HMHM.movie.vimeo.state.PAUSED;
        HMHM.movie.onYtplayerStateChange(HMHM.movie.vimeo.currentState);
    },
    finish: function() {
        HMHM.movie.vimeo.currentState = HMHM.movie.vimeo.state.ENDED;
        HMHM.movie.onYtplayerStateChange(HMHM.movie.vimeo.currentState);
        HMHM.movie.autoplay.next();
    }
};

HMHM.movie.vimeo.player = {
    seekTo: function(seconds, allowSeekAhead) {
        if (!HMHM.movie.vimeo.playerReady) {
            return false;
        }

        this.pauseVideo();
        HMHM.movie.vimeo.postMessage('seekTo', seconds);
    },
    playVideo: function() {
        if (!HMHM.movie.vimeo.playerReady) {
            return false;
        }

        HMHM.movie.vimeo.postMessage('play');

        return true;
    },
    pauseVideo: function() {
        if (!HMHM.movie.vimeo.playerReady) {
            return false;
        }

        HMHM.movie.vimeo.postMessage('pause');

        return true;
    },
    getPlayerState: function() {
        if (!HMHM.movie.vimeo.playerReady) {
            return;
        }

        return HMHM.movie.vimeo.currentState;
    },
    getCurrentTime: function() {
        if (!HMHM.movie.vimeo.playerReady) {
            return false;
        }

        return HMHM.movie.vimeo.currentTime;
    },
    setPlaybackQuality: function(quality) {
        // do nothing
    }
};

HMHM.movie.videojs = {};
HMHM.movie.videojs.playerReady = false;
// same as YouTube Player API state
HMHM.movie.videojs.state = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
};
HMHM.movie.videojs.currentState = HMHM.movie.videojs.state.UNSTARTED;
HMHM.movie.videojs.currentTime = 0.0;

HMHM.movie.videojs.on = {
    loadeddata: function() {
        HMHM.movie.autoplay.playIfMovedAutomatically();

        HMHM.movie.seekAndPlay();
    },
    play: function() {
        HMHM.movie.videojs.currentState = HMHM.movie.videojs.state.PLAYING;
        HMHM.movie.onYtplayerStateChange(HMHM.movie.videojs.currentState);
    },
    pause: function() {
        HMHM.movie.videojs.currentState = HMHM.movie.videojs.state.PAUSED;
        HMHM.movie.onYtplayerStateChange(HMHM.movie.videojs.currentState);
    },
    ended: function() {
        HMHM.movie.autoplay.next();
    },
    timeupdate: function() {
        HMHM.movie.videojs.currentTime = HMHM.movie.videojs.player_.currentTime();
    },
    changeResolution: function(quality) {
        HMHM.cookie.set('playback_quality_vj', quality, 365*86400*1000, '/lessons');
    },
    changeVoice: function(voice) {
        var cookieStr = [
            'voice_vj=',
            encodeURIComponent(voice),
            '; path=/lessons'
        ].join('');
        document.cookie = cookieStr;
    },
    changePlaybackSpeed: function(speed) {
        var cookieStr = [
            'playback_speed_vj=',
            encodeURIComponent(speed),
            '; path=/lessons'
        ].join('');
        document.cookie = cookieStr;
    },
    volumeChange: function(volume) {
        var cookieStr = [
            'volume_vj=',
            encodeURIComponent(volume),
            '; path=/lessons'
        ].join('');
        document.cookie = cookieStr;
    },
    error: function(error, videoSrc) {
        var imgEl, src;

        if (!error.code || !error.message) {
            return false;
        }

        imgEl = document.createElement('img');

        src = '/img/__vjs.gif?' + [
            'error_code='+encodeURIComponent(error.code),
            'error_message='+encodeURIComponent(error.message),
            'uri='+encodeURIComponent(location.href),
            'src='+encodeURIComponent(videoSrc)
        ].join('&');

        imgEl.src = src;

        document.body.appendChild(imgEl);

        setTimeout(function() {
            $('#video_error_message').slideDown();
        }, 750);
    }
};

HMHM.movie.videojs.getDefaultPlaybackQuality = function(defaultValue) {
    var val = HMHM.cookie.get('playback_quality_vj')
      , i
      , available = false;

    for (i = 0; i < HMHM.movie.availableQualities.length; i++) {
        if (val === HMHM.movie.availableQualities[i]) {
            available = true;
            break;
        }
    }

    // convert high quality value
    if (val === '480' && !available) {
        val = '720';
    } else if (val === '720' && !available) {
        val = '480';
    }

    var qualities = HMHM.movie.availableQualities || [];

    for (var i = 0; i < qualities.length; i++) {
        if (qualities[i] === val) {
            return val;
        }
    }

    return defaultValue;
};

HMHM.movie.videojs.getDefaultVoice = function(defaultVoice) {
    var val = HMHM.cookie.get('voice_vj');

    if (val !== 'm' && val !== 'w') {
        return defaultVoice;
    } else {
        return val;
    }
};

HMHM.movie.videojs.getDefaultVolume = function(defaultValue) {
    var val = HMHM.cookie.get('volume_vj');
    if (val === '1') {
        val = 0.99;
    }
    return (val === null) ? defaultValue : val * 1;
};

HMHM.movie.videojs.getCurrentPlaybackSpeed = function(defaultValue) {
    var val = HMHM.cookie.get('playback_speed_vj');
    return (val === null) ? defaultValue : val;
};

HMHM.movie.videojs.player = {
    seekTo: function(seconds, allowSeekAhead) {
        if (!HMHM.movie.videojs.playerReady) {
            return;
        }

        HMHM.movie.videojs.player_.currentTime(seconds);
    },
    playVideo: function() {
        HMHM.movie.videojs.player_.play();
    },
    pauseVideo: function() {
        HMHM.movie.videojs.player_.pause();
    },
    getPlayerState: function() {
        if (!HMHM.movie.videojs.playerReady) {
            return;
        }

        return HMHM.movie.videojs.currentState;
    },
    getCurrentTime: function() {
        if (!HMHM.movie.videojs.playerReady) {
            return;
        }

        return HMHM.movie.videojs.currentTime;
    },
    setPlaybackQuality: function(quality) {
        // do nothing
    }
};

//---- HMHM.movie ----//

/* memo */
HMHM.memo = {};
HMHM.memo.searchQuery = '';
HMHM.memo.IGNORE_KEYDOWN_INTERVAL = 800;
HMHM.memo.AUTO_SAVE_INTERVAL = 200;
HMHM.memo.savedVal = null;
HMHM.memo.lastKeydownTime = HMHM.getTime();
HMHM.memo.nowSaving = false;
HMHM.memo.autoSave = function() {
    if (HMHM.getTime() - HMHM.memo.lastKeydownTime < HMHM.memo.IGNORE_KEYDOWN_INTERVAL) {
        //console.log('inputting');
        setTimeout(function() {
            HMHM.memo.autoSave();
        }, HMHM.memo.AUTO_SAVE_INTERVAL);
    } else {
        //console.log('create');
        HMHM.memo.save(false);
    }
};
HMHM.memo.save = function(forceSave) {
    if (HMHM.memo.nowSaving) {
        return false;
    }

    // 保存されるvalue
    var savedVal = $('#memo').val();

    // 前回保存した値と同じなら終了
    if (!forceSave && HMHM.memo.savedVal == savedVal) {
        //console.log('same');
        //$('#memo_sysmessage').fadeIn(500);
        return false;
    }

    // 保存ボタンをdisabledに
    $('#memo_save_button').attr('disabled', true);

    HMHM.memo.nowSaving = true;
    $('#memo_sysmessage').fadeOut(300);

    $.ajax({
        url:'/memo/create.json',
        type:'POST',
        data:{
            lesson_id:$('#lesson_id').val(),
            user_id:$('#user_id').val(),
            memo:savedVal,
            one_time_token:$('input[name="one_time_token"]:first').val()
        },
        timeout:15000,
        success:function(json) {
            //console.log('save!'+savedVal);
            if (json.res) {
                $('#memo_sysmessage').fadeIn(500);
                // 今回保存したvalueをセット
                HMHM.memo.savedVal = savedVal;
            }
            // 保存ボタンのdisabledを元に戻す
            $('#memo_save_button').attr('disabled', false);
            HMHM.memo.nowSaving = false;
        }
    });
    return false;
};
HMHM.memo.load = function() {
    $('#load_memo').hide();
    $('#ajax_loader').show();
    var page = $('#load_memo')[0] ? $('#load_memo').data('current-page')*1 + 1 : 1;
    $.ajax({
        url:'/memo/load.json?p='+encodeURIComponent(page)+'&q='+encodeURIComponent(HMHM.memo.searchQuery),
        timeout:15000,
        success:function(json) {
            _(json.memos).each(function(memo) {
                //console.log(memo);
                var $tr = $($('#memo_table_row_template').val());
                //console.log($tr);

                var lessonLink = '/lessons/'+memo.package_ename+'/'+memo.lesson_id;

                $tr.find('a.lesson_memo')
                        .attr('href', lessonLink)
                        .text(HMHM.truncate(memo.memo, 40));

                $tr.find('a.memo_lesson_link')
                        .attr('href', lessonLink)
                        .text('#'+HMHM.padZero(memo.sequence)+' '+HMHM.truncate(memo.lesson_title, 12));

                $tr.find('a.memo_package_link')
                        .attr('href', '/lessons/'+memo.package_ename)
                        .text('('+HMHM.truncate(memo.package_name, 12)+')');

                $tr.insertBefore($('#load_memo_row'));
            });
            if (json.memos.length == 0) {
                var $tr = $('<tr></tr>').append($('<td colspan="2" class="txc"></td>').text('一致するメモはありません。'));
                $tr.insertBefore($('#load_memo_row'));
            }
            if (json.has_next_page) {
                $('#load_memo_row').hide();
            } else {
                $('#load_memo_row').show();
                $('#load_memo').show().data('current-page', page);
            }
            $('#ajax_loader').hide();
        }
    });
};
HMHM.memo.search = function() {
    if ($('#memo_search_query').val() == '') {
        return false;
    }

    // remove tbody rows
    $('#memo_table>tbody>tr:not("#load_memo_row")').remove();

    // reset page
    $('#load_memo').data('current-page', 0);

    HMHM.memo.searchQuery = $('#memo_search_query').val();
    HMHM.memo.load();

    return false;
};
HMHM.memo.clearSearch = function() {
    // remove tbody rows
    $('#memo_table>tbody>tr:not("#load_memo_row")').remove();

    // reset page
    $('#load_memo').data('current-page', 0);

    // reset query
    HMHM.memo.searchQuery = '';

    HMHM.memo.load();
};

/* user */
HMHM.user = {};
HMHM.user.disconnect = function(e, service) {
    $.ajax({
        url:'/user/disconnect.json',
        type:'POST',
        data:{
            user_id:$('#user_id').val(),
            service:service,
            one_time_token:$('input[name="one_time_token"]:first').val()
        },
        timeout:15000,
        success:function(json) {
            location.href = '/user/settings#!apps';
            location.reload();
        },
        error:function(xhr) {
            var res = $.parseJSON(xhr.responseText);
            alert(res.error_message);
        }
    });
};

HMHM.settings = {};
HMHM.settings.appendUrlInput = function() {
    var div = $('#url-input-template').clone().attr('id', '');
    div.find('img').show();
    div.find('input').val('');
    div.insertAfter($('div.url-input-area:last'));
}
HMHM.settings.removeUrlInput = function(button) {
    $(button).parents('div.url-input-area').remove();
}

HMHM.dashboard = {};
HMHM.dashboard.sortByGroups = {};
HMHM.dashboard.defaultSortOrders = {};
HMHM.dashboard.defaultFirstSortOrders = {};
HMHM.dashboard.currentSortOrders = {};
HMHM.dashboard.preSortBy = '';

// 現在のソート順の初期設定
HMHM.dashboard.initCurrentSortOrders = function() {
    for (var key in HMHM.dashboard.defaultSortOrders) {
        HMHM.dashboard.currentSortOrders[key] = HMHM.dashboard.defaultSortOrders[key];
    };
};

HMHM.dashboard.sortBy = function($el, tableId, asNumeric) {
    var $arrowUp = $('<img src="/img/sort_arrow_up.png" width="8" height="16" class="linkLike vam">');
    var $arrowDown = $('<img src="/img/sort_arrow_down.png" width="8" height="16" class="linkLike vam">');
    var $arrowUpDown = $('<img src="/img/sort_arrow_updown.png" width="8" height="16" class="linkLike vam">');

    // arrow をデフォルトに
    $('#'+tableId+'>thead>tr>th').find('img[src^="/img/sort_arrow"]').each(function() {
        $(this).replaceWith($arrowUpDown.clone());
    });

    // ソート基準
    var sortBy = $el.data('sort-by');
    var sortTargetSelector = 'span.'+sortBy;
    var secondSortTargetSelector = 'span.'+$el.data('second-sort-by');

    // sort target rows
    var $rows = $('#'+tableId+'>tbody>tr');

    // 次のソート順
    var nextSortOrder = null;
    if (HMHM.dashboard.currentSortOrders[sortBy] == -1) {
        nextSortOrder = HMHM.dashboard.defaultFirstSortOrders[sortBy];
    } else {
        nextSortOrder = (HMHM.dashboard.currentSortOrders[sortBy] + 1) % 2;
    }

    if (nextSortOrder == 0) {
        $rows.sort(function(a, b) {
            if (asNumeric) {
                if ($(a).find(sortTargetSelector).text()*1 == $(b).find(sortTargetSelector).text()*1) {
                    return $(a).find(secondSortTargetSelector).text()*1 - $(b).find(secondSortTargetSelector).text()*1;
                }
                return $(a).find(sortTargetSelector).text()*1 - $(b).find(sortTargetSelector).text()*1;
            } else {
                if ($(a).find(sortTargetSelector).text() < $(b).find(sortTargetSelector).text()) {
                    return -1;
                }
                else if ($(a).find(sortTargetSelector).text() > $(b).find(sortTargetSelector).text()) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        $el.find('img[src^="/img/sort_arrow"]').replaceWith($arrowUp.clone());
    } else {
        $rows.sort(function(a, b) {
            if (asNumeric) {
                if ($(b).find(sortTargetSelector).text()*1 == $(a).find(sortTargetSelector).text()*1) {
                    return $(b).find(secondSortTargetSelector).text()*1 - $(a).find(secondSortTargetSelector).text()*1;
                }
                return $(b).find(sortTargetSelector).text()*1 - $(a).find(sortTargetSelector).text()*1;
            } else {
                if ($(b).find(sortTargetSelector).text() < $(a).find(sortTargetSelector).text()) {
                    return -1;
                }
                if ($(b).find(sortTargetSelector).text() > $(a).find(sortTargetSelector).text()) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        $el.find('img[src^="/img/sort_arrow"]').replaceWith($arrowDown.clone());
    }

    // 順位表示がある場合
    var rank = 1;
    if ($rows.find('td>span.sort_rank').length) {
        $rows.each(function() {
            $(this).find('td>span.sort_rank').text(HMHM.padZero(rank));
            rank++;
        });
    }

    // 現在のソート順を更新
    HMHM.dashboard.currentSortOrders[sortBy] = nextSortOrder;

    // ソート結果
    $('#'+tableId+'>tbody').empty().append($rows);

    // ソート基準が切り替わった場合、同じグループの他のソート基準のorderをソートなし(-1)にする
    if (HMHM.dashboard.preSortBy != sortBy) {
        var groupId = HMHM.dashboard.sortByGroups[sortBy];
        for (var key in HMHM.dashboard.currentSortOrders) {
            if (HMHM.dashboard.sortByGroups[key] == groupId && key != sortBy) {
                HMHM.dashboard.currentSortOrders[key] = -1;
            }
        }
        HMHM.dashboard.preSortBy = sortBy;
    }
}

HMHM.uploadImage = function($form, $fileElement, callback) {
    var data = {
        user_id: $('#user_id').val(),
        is_ie: $.browser.msie ? 1 : 0,
        one_time_token: $('input[name="one_time_token"]:first').val()
    };

    $.ajaxFileUpload({
        url: $form.attr('action'),
        data: data,
        secureuri: false,
        fileElementId: $fileElement.attr('id'),
        dataType: 'json',
        success: function(res, status) {
            // error
            if (res.error) {
                alert(res.error_message);
                return false;
            }
            callback(res);
        },
        error: function(res, status, e) {
        }
    });
};

HMHM.loadUploadImages = function() {
    var url = $('#show_uploaded_image_on_course_dashboard').data('url');
    $.get(url, function(res) {
        _(res.images).each(function(img) {
            $('<img>')
                .attr('src', img.url)
                .data('id', img.id)
                .appendTo($('#uploaded_images'));
        });
    });
};

HMHM.announcement = {};
HMHM.announcement.create = function(form) {
    if ($(form).find('input[name="title"]').val() == '') {
        alert('タイトルを入力してください。');
        return false;
    }
    if ($(form).find('textarea[name="body"]').val() == '') {
        alert('本文を入力してください。');
        return false;
    }
    return true;
}

HMHM.topic = {};
HMHM.topic.comment = {};
HMHM.topic.comment.create = function($form) {
    // validation
    if (!HMHM.validate.comment.create($form)) {
        return false;
    }

    var url = $form.attr('action');
    var data = {
        "topicfile_id[]": []
    };
    _($form.find('input[type="hidden"],textarea')).each(function(el) {
        if ($(el).attr('name') == 'topicfile_id[]') {
            data['topicfile_id[]'].push($(el).val());
        } else {
            data[$(el).attr('name')] = $(el).val();
        }
    });

    $('#topic_comment_submit_btn').prop('disabled', true);

    $.post(url, data, function(res) {
        $('#topic_comment_submit_btn').prop('disabled', false);

        if (res.error) {
            alert(res.error_message);
            return false;
        }

        $('#topic_comments').append(res.comment);
        $('#attachments').children(':not(:last)').remove();
        $form.find('textarea[name="body"]').val('');

        $('#topic_comment_created_message').fadeIn(400, function() {
            setTimeout(function() {
                $('#topic_comment_created_message').fadeOut(750);
            }, 5000);
        });

        $('#tab_write').click();
    });

    return false;
};

HMHM.escapeHTML = function(str) {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#039;');
    return str;
}
HMHM.nl2br = function(str) {
    return str.replace(/\n/g, '<br />');
}
HMHM.autoLink = function(str) {
    var re = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;
    return str.replace(re, '<a href="$1" target="_blank">$1</a>');
}
HMHM.truncate = function(str, len) {
    if (str.length <= len) {
        return str;
    }
    return str.substr(0, len) + '...';
}
HMHM.formatLessonNumber = function(number) {
    return parseInt(number.substr(8, 3) * 1);
}
HMHM.padZero = function(n) {
    return (n < 10) ? '0' + n : n;
}
HMHM.timeToGo = function(t) {
    var delta = Math.round((t - new Date().getTime()) / 1000);
    if (delta < 60) {
        return delta + '秒';
    }
    if (delta / 60 < 60) {
        return Math.round(delta / 60) + '分';
    }
    if (delta / 3600 < 24) {
        return Math.round(delta / 3600) + '時間';
    }
    return Math.round(delta / 86400) + '日';
}

HMHM.numberFormat = function(num) {
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};

HMHM.img = {};
HMHM.img.LESSON_DONE_IMAGE = '/img/lesson_done_60.png';

HMHM.saveLoginMail = function() {
    var now = new Date().getTime();
    if ($('#save_mail:checked')[0]) {
        var expires = new Date(now + (1000 * 86400 * 30));
        var cookieStr = [
            'login_mail=',
            encodeURIComponent($.trim($('#mail').val())),
            '; path=/',
            '; expires=',
            expires.toGMTString()
        ].join('');
    } else {
        var expires = new Date(now - (86400 * 365));
        var cookieStr = [
            'login_mail=',
            '; path=/',
            '; expires=',
            expires.toGMTString()
        ].join('');
    }
    document.cookie = cookieStr;
};
HMHM.getLoginMail = function() {
    if (!document.cookie) {
        return false;
    }
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var str = cookies[i].split("=");
        if (str[0] == 'login_mail') {
            $('#mail').val(decodeURIComponent(str[1]));
            break;
        }
    }
};

HMHM.checkCouponInput = function() {
    if ($('#coupon_code').val() != '') {
        alert('クーポンコードが入力されています。使用するにはクーポンコードの横にある「適用する」ボタンをクリックしてください。使用しない場合はクーポンコードを削除してください。');
        $('#coupon_code').focus();
        return false;
    }
    return true;
};

HMHM.validate = {};
HMHM.validate.topic = {};
HMHM.validate.comment = {};
HMHM.validate.topic.create = function($form) {
    if ($form.find('input[name="title"]').val() == '') {
        alert('タイトルを入力してください。');
        return false;
    }
    if ($form.find('textarea[name="body"]').val() == '') {
        alert('本文を入力してください。');
        return false;
    }
    return true;
};
HMHM.validate.comment.create = function($form) {
    if ($form.find('textarea[name="body"]').val() == '') {
        alert('本文を入力してください。');
        return false;
    }
    return true;
};

HMHM.cookie = {
    get: function(name) {
        if (!document.cookie) {
            return null;
        }

        var cookies = document.cookie.split("; ");
        var str;
        for (var i = 0; i < cookies.length; i++) {
            var str = cookies[i].split("=");
            if (str[0] == name) {
                return decodeURIComponent(str[1]);
            }
        }
        return null;
    },
    set: function(name, value, expire, path) {
        if (!document.cookie) {
            return null;
        }

        var now = new Date().getTime();
        var expires = new Date(now + expire);
        var cookieStr = [
            name+'='+encodeURIComponent(value),
            '; path='+path,
            '; expires=',
            expires.toGMTString()
        ].join('');
        document.cookie = cookieStr;
    }
};

HMHM.search = {};
HMHM.search.emphasizeInNodeText = function(query, $node) {
  if (/[<>]/.test(query)) {
    return false;
  }

  var keywords = query.split(' ');
  for (var i = 0; i < keywords.length; i++) {
    var pattern = new RegExp(keywords[i], 'ig');
    var dom = $node.get(0);
    for (var j = 0; j < dom.childNodes.length; j++) {
      var emphasized = HMHM.search.emphasize(dom.childNodes[j], pattern, keywords[i]);
      dom.replaceChild(emphasized, dom.childNodes[j]);
    }
  }
};
HMHM.search.emphasize = function(node, pattern, keyword) {
  if (node.nodeType == 1) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var emphasized = HMHM.search.emphasize(node.childNodes[i], pattern, keyword);
      node.replaceChild(emphasized, node.childNodes[i]);
    }
  }
  else if (node.nodeType == 3) {
    if (!pattern.test(node.data)) {
      return node;
    }

    if (node.data === keyword) {
      var span = document.createElement('span');
      span.className = 'emphasize';
      span.innerHTML = keyword;
      return span;
    }

    var index = node.data.toLowerCase().indexOf(keyword.toLowerCase());
    //console.log(node.data);
    var emphasized = [
      HMHM.escapeHTML(node.data.substr(0, index)),
      '<span class="emphasize">'+node.data.substr(index, keyword.length)+'</span>',
      HMHM.escapeHTML(node.data.substr(index+keyword.length))
    ].join('');

    var span = document.createElement('span');
    span.innerHTML = emphasized;
    return span;
  }
  return node;
};

HMHM.analytics = {};
HMHM.analytics.trackEvent = function(category, action, label, value) {
    if (typeof ga === 'undefined') {
        return true;
    }

    if (typeof value === 'undefined') {
        ga('send', 'event', category, action, label);
    } else {
        ga('send', 'event', category, action, label, value);
    }
};

HMHM.search.track = function(query, column, rank, mobile, text, href) {
  var img = document.createElement('img');
  var src = '/img/__track.gif?';
  var params = [
    'sec='+encodeURIComponent((new Date()).getTime()),
    'query='+encodeURIComponent(query),
    'column='+encodeURIComponent(column),
    'rank='+encodeURIComponent(rank),
    'mobile='+encodeURIComponent(mobile),
    'text='+encodeURIComponent(text)
  ].join('&');
  img.src = src+params;
  document.body.appendChild(img);

  if (typeof href !== 'undefined') {
    setTimeout(function() {
      window.location.href = href;
    }, 100);
  }
}

HMHM.icon = {};
HMHM.icon.notFound = function(img) {
  var url = $(img).attr('src');
  var userName = $(img).data('user-name');
  if (url === '' || userName === '') {
    return false;
  }
  var imgEl = document.createElement('img');
  var src = '/img/__error_icon.gif?';
  var params = [
    'user_name='+encodeURIComponent(userName),
    'url='+encodeURIComponent(url)
  ].join('&');
  imgEl.src = src+params;
  document.body.appendChild(imgEl);
};

HMHM.news = {};
HMHM.news.hide = function() {
    $('#side_news_body').hide();
    $('#side_news_more').hide();
    $('#side_news_header').addClass('body-hidden');
    $('#toggle_side_news_body').text('開く');
};
HMHM.news.show = function() {
    $('#side_news_body').show();
    $('#side_news_more').show();
    $('#side_news_header').removeClass('body-hidden');
    $('#toggle_side_news_body').text('閉じる');
};

function frameInFrame(url) {
  var iframe = document.createElement('iframe');
  (iframe.frameElement || iframe).style.cssText = 'width:0;height:0;border:0;';
  iframe.src = 'javascript:false';
  var where = document.getElementsByTagName('script');
  if (where.length == 0) {
    where = document.getElementsByTagName('head');
    where[0].appendChild(iframe);
  } else {
    where = where[where.length - 1];
    where.parentNode.insertBefore(iframe, where);
  }
  var doc = iframe.contentWindow.document;
  doc.open().write([
    '<body onload="var js=document.createElement(\'script\');',
    'js.src=\'',
    url,
    '\';document.body.appendChild(js);">'
  ].join(''));
  doc.close();
}
