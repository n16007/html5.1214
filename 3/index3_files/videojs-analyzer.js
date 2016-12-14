(function() {
    var player = document.getElementById('videojs_player')
      , timer;

    function checkPlaybackRate() {
        var img;

        if (player.playbackRate > 1) {
            clearTimeout(timer);

            img = document.createElement('img');
            img.src = [
                '/img/__vjs.gif?rate=',
                player.playbackRate,
                '&id=',
                document.getElementById('user_id').value
            ].join('');
            document.body.appendChild(img);
        }

        timer = setTimeout(checkPlaybackRate, 10000);
    }

    if (player && player.playbackRate) {
        checkPlaybackRate();
    }
})();
