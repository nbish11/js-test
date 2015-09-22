/* global Moovie:false */
/* jshint maxcomplexity:9, maxstatements:26 */
Moovie.toHTMLTrackElement = (function () {
    'use strict';

    var parsers = {
        vtt: function (data) {
            function toSeconds(timecode) {
                timecode = timecode.split(/[:.]/);

                if (timecode.length === 4) {
                    // hh, mm, ss, ms
                    timecode = timecode[0].toInt() * 3600 +
                        timecode[1].toInt() * 60 +
                        timecode[2].toInt() +
                        timecode[3].toInt() / 1000;
                } else if (timecode.length === 3) {
                    // mm, ss, ms
                    timecode = timecode[0].toInt() * 60 +
                        timecode[1].toInt() +
                        timecode[2].toInt() / 1000;
                }

                return timecode;
            }

            // vtt parsing requires normalizing newlines
            data = data.replace(/\r\n|\r/gm, '\n').trim().split('\n\n');

            // check for valid WebVTT file
            if (data[0] !== 'WEBVTT') {
                return;
            } else {
                data.shift();
            }

            return data.map(function (cue) {
                cue = cue.split('\n');

                var cueid = cue.shift();
                var cuetc = cue.shift().split(' --> ');
                var cuetx = cue.join('\n');
                var events = new Events();

                cue = {
                    id: cueid,
                    startTime: toSeconds(cuetc[0]),
                    endTime: toSeconds(cuetc[1]),
                    text: cuetx,
                    region: null,
                    vertical: '',
                    snapToLines: true,
                    line: 'auto',
                    lineAlign: 'start',
                    position: 50,
                    positionAlign: 'middle',
                    size: 50,
                    align: 'middle',
                    pauseOnExit: false
                };

                for (var key in events) {
                    cue[key] = events[key];
                }
                return cue;
            });
        },

        srt: function (data) {
            function toSeconds(timecode) {
                timecode = timecode.split(/[:,]/);

                return timecode[0].toInt() * 3600 +
                    timecode[1].toInt() * 60 +
                    timecode[2].toInt() +
                    timecode[3].toInt() / 1000;
            }

            return data.split('\n\n').map(function (cue) {
                cue = cue.split('\n');

                var cueid = cue.shift();
                var cuetc = cue.shift().split(' --> ');
                var cuetx = cue.join('\n');
                var events = new Events();

                cue = {
                    id: cueid,
                    startTime: toSeconds(cuetc[0]),
                    endTime: toSeconds(cuetc[1]),
                    text: cuetx
                };

                for (var key in events) {
                    cue[key] = events[key];
                }

                return cue;
            });
        }
    };

    var displays = {};

    var toHTMLTrackElement = function (trackElement) {
        trackElement = document.id(trackElement);

        if (trackElement.get('tag') !== 'track') {
            return;
        }

        // disable native support
        if ('track' in trackElement) {
            trackElement.mode = 'disabled';
        }

        var readyState = 0;

        // audio elements do not have a visual rendering area
        var video = trackElement.getParent('video');
        var textTrack = {
            cues: [],
            activeCues: [],
            mode: 'disabled'
        };

        if (video === null) {
            throw new Error('An appropriate video element could not be found.');
        }

        Moovie.Util.defineConstant(trackElement, 'NONE', 0);
        Moovie.Util.defineConstant(trackElement, 'LOADING', 1);
        Moovie.Util.defineConstant(trackElement, 'LOADED', 2);
        Moovie.Util.defineConstant(trackElement, 'ERROR', 3);

        Object.defineProperties(trackElement, {
            kind: {
                enumerable: true,
                get: function () {
                    return this.get('kind');
                },
                set: function (value) {
                    this.set('kind', value);
                }
            },

            src: {
                enumerable: true,
                get: function () {
                    return this.get('src');
                },
                set: function (value) {
                    this.set('src', value);
                    new Request({
                        url: value,
                        method: 'GET',
                        async: true,
                        onSuccess: function (response) {
                            textTrack.cues = parsers[value.split('.').pop().toLowerCase()](response);

                            if (textTrack.cues.length) {
                                textTrack.mode = trackElement.hasAttribute('default') ? 'showing' : 'hidden';
                            }

                            readyState = 2;
                            trackElement.fireEvent('load');
                        }
                    }).send();
                }
            },

            srclang: {
                enumerable: true,
                get: function () {
                    return this.get('srclang');
                },
                set: function (value) {
                    this.set('srclang', value);
                }
            },

            label: {
                enumerable: true,
                get: function () {
                    return this.get('label');
                },
                set: function (value) {
                    this.set('label', value);
                }
            },

            default: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('default');
                },
                set: function () {
                    this.set('default', '');
                }
            },

            readyState: {
                enumerable: true,
                get: function () {
                    return readyState;
                }
            },

            track: {
                enumerable: true,
                get: function () {
                    return textTrack;
                }
            }
        });

        if (!displays[video]) {
            displays[video] = new Element('div', {
                styles: {
                    'position': 'absolute',
                    'width': video.getWidth() || 0,
                    'height': video.getHeight() || 0,
                    'overflow': 'hidden',
                    'font': '22px sans-serif',
                    'text-align': 'center',
                    'color': 'rgba(255, 255, 255, 1)',
                    'letter-spacing': 'normal',
                    'word-spacing': 'normal',
                    'text-transform': 'none',
                    'text-indent': 0,
                    'text-decoration': 'none',
                    'pointer-events': 'none',
                    'user-select': 'none',
                    'word-break': 'break-word',
                    'top': 0
                }
            }).inject(video, 'after');
        }

        /* @todo Remove fixed positioning and implement vtt positional settings */
        var cueBox = displays[video];
        var cueDisplay = new Element('div', {
            styles: {
                'position': 'absolute',
                'overflow': 'hidden',
                'white-space': 'pre-wrap',
                'box-sizing': 'border-box',
                'flex': '0 0 auto',
                'direction': 'ltr',
                'top': '80%',
                'left': '0%',
                'width': '100%',
                'height': 'auto',
                'text-align': 'center',
                'display': 'none'
            }
        });
        var reference = new Element('span', {
            class: 'cue',
            styles: {
                'display': 'inline',
                'background-color': 'rgba(0, 0, 0, 0.8)',
                'padding': '2px',
                'visibility': 'hidden',
                'opacity': 0
            }
        }).inject(cueDisplay);

        var renderCue = function (cue, event) {
            // don't display anything
            if (textTrack.mode === 'disabled' || textTrack.mode === 'hidden') {
                return;

            // add to DOM (if not already added), if we are showing text track
            } else if (!video.getParent().contains(cueDisplay)) {
                cueDisplay.inject(cueBox);
            }

            // display or hide text tracks
            if (event === 'cueenter' && textTrack.mode === 'showing') {
                cueDisplay.setStyle('display', 'block');
                reference.set('text', cue.text).setStyles({
                    visibility: 'visible', opacity: 1
                });
            } else if (event === 'cueexit' && textTrack.mode === 'showing') {
                cueDisplay.setStyle('display', 'none');
                reference.setStyles({
                    visibility: 'hidden', opacity: 0
                }).empty();
            }
        };

        var triggerCueChange = function (cue, event) {
            renderCue(cue, event);
            trackElement.fireEvent('cuechange');
            cue.fireEvent(event, [cue]);
        };

        video.addEvent('timeupdate', function () {
            var activeCue;
            var time = video.currentTime;
            var cue, i, l;

            l = textTrack.activeCues.length;
            for (i = 0; i < l; i++) {
                activeCue = textTrack.activeCues[i];

                if (activeCue && (activeCue.startTime > time || activeCue.endTime < time)) {
                    textTrack.activeCues.splice(i, 1);
                    i--;

                    if (activeCue.pauseOnExit) {
                        video.pause();
                    }

                    triggerCueChange(activeCue, 'cueexit');
                }
            }

            l = textTrack.cues.length;
            for (i = 0; i < l; i++) {
                cue = textTrack.cues[i];

                if (time >= cue.startTime && time <= cue.endTime && !textTrack.activeCues.contains(cue)) {
                    if (textTrack.mode === 'showing' || textTrack.mode === 'hidden') {
                        textTrack.activeCues.push(cue);
                        triggerCueChange(cue, 'cueenter');
                    }
                }
            }
        });

        // if we already have metadata, then load tracks
        if (video.networkState >= video.NETWORK_IDLE &&
            video.readyState >= video.HAVE_METADATA) {
            trackElement.src = trackElement.get('src');
        }

        return trackElement;
    };

    return toHTMLTrackElement;
})();
/* jshint maxcomplexity:8, maxstatements:24 */
