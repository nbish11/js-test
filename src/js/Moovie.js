var Moovie = (function () {
    'use strict';

    var tracks = [];
    var currentPlaybackState = 'loading';
    var knobOffset = null;

    // define a read-only property
    var defineGetter = function (obj, name, getter) {
        Object.defineProperty(obj, name, {
            enumerable: true,
            get: getter
        });
    };

    // converts an element's "attributes" to a plain JavaScript object.
    // To limit the attributes to just the element's own, just provide
    // the keys as an array and pass through to the "allowed" parameter
    var attrsToObj = function (attrs, allowed) {
        var obj = {};

        for (var i = 0, l = attrs.length; i < l; i++) {
            if (allowed && allowed.contains(attrs[i].name) || !allowed) {
                obj[attrs[i].name] = attrs[i].value;
            }
        }

        return obj;
    };

    // converts a <video> node and it's <track> and <source>
    // elements into a JSON-like JavaScript object.
    var serializeVideoElement = function (element, allowed) {
        var obj = {};

        element = document.id(element);
        Object.merge(obj, attrsToObj(element.attributes, allowed));

        var sources = element.getChildren('source');
        if (!('src' in obj) && sources.length) {
            obj.sources = sources.map(function (source) {
                return attrsToObj(source.attributes, ['src', 'type']);
            });
        }

        var textTracks = element.getChildren('track');
        if (textTracks.length) {
            obj.tracks = textTracks.map(function (track) {
                track = attrsToObj(track.attributes, ['kind', 'src', 'srclang', 'default', 'label']);
                track.kind = track.kind || 'subtitles';
                return track;
            });
        }

        return obj;
    };

    return new Class({
        Implements: [Events, Options],

        options: {},

        /**
         * Constructor
         * @constructs Moovie
         * @param  {String|Element|Object} video   [description]
         * @param  {Object} options [description]
         * @return {Moovie}         [description]
         */
        /* jshint maxstatements:31 */
        initialize: function (video, options) {
            /**
             * A reference to the original <code>&lt;video&gt;</code> element.
             * @name Moovie#video
             * @type {Element}
             * @default null
             * @readonly
             */
            this.video = document.id(video);

            this.setOptions(options);
            this.build();
            this.attach();

            defineGetter(this, 'readyState', function () {
                return this.video.readyState;
            });

            /**
             * Returns the current network state of the video
             * @name Moovie#networkState
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'networkState', function () {
                return this.video.networkState;
            });

            /**
             * Returns the current time the video has buffered too.
             * @name Moovie#buffered
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'buffered', function () {
                return this.video.buffered.end(this.video.buffered.length - 1);
            });

            /**
             * Returns the video's currently selected source.
             * @name Moovie#src
             * @type {String}
             * @default ''
             * @readonly
             */
            defineGetter(this, 'src', function () {
                return this.video.currentSrc || this.video.src;
            });

            /**
             * Returns the url of the video's poster, if set.
             * @name Moovie#poster
             * @type {String}
             * @default ''
             * @readonly
             */
            defineGetter(this, 'poster', function () {
                return this.video.poster;
            });

            /**
             * Returns the video's current time.
             * @name Moovie#elapsed
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'elapsed', function () {
                return this.video.currentTime;
            });

            /**
             * Returns the video's duration
             * @name Moovie#duration
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'duration', function () {
                return this.video.duration;
            });

            /**
             * Returns the video's remaining time.
             * @name Moovie#remaining
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'remaining', function () {
                return this.video.duration - this.video.currentTime;
            });

            /**
             * Returns the video's current playback state as an enum string.
             * @name Moovie#playbackState
             * @type {String}
             * @default 'loading'
             * @readonly
             */
            defineGetter(this, 'playbackState', function () {
                return currentPlaybackState;
            });

            /**
             * Returns <code>true</code> if the video is loading.
             * @name Moovie#loading
             * @type {Boolean}
             * @default true
             * @readonly
             */
            defineGetter(this, 'loading', function () {
                return currentPlaybackState === 'loading';
            });

            /**
             * Returns <code>true</code> if the video has loaded all metadata
             * and the video has not yet been played
             * @name Moovie#stopped
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'stopped', function () {
                return currentPlaybackState === 'stopped';
            });

            /**
             * Returns <code>true</code> if the video has been paused at the
             * current time.
             * @name Moovie#paused
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'paused', function () {
                return currentPlaybackState === 'paused';
            });

            /**
             * Returns <code>true</code> if the video is being seeked to a new
             * time.
             * @name Moovie#seeking
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'seeking', function () {
                return currentPlaybackState === 'seeking';
            });

            /**
             * Returns <code>true</code> if the video has ended. this is
             * different to the "stopped" state.
             * @name Moovie#ended
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'ended', function () {
                return currentPlaybackState === 'ended';
            });

            /**
             * Returns <code>true</code> if the video is currently playing.
             * @name Moovie#playing
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'playing', function () {
                return currentPlaybackState === 'playing';
            });

            /**
             * the video was playing but has suspended while trying to fetch
             * the next frame. in other words, the video is trying to play a
             * frame it does not have the data for.
             * @name Moovie#waiting
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'waiting', function () {
                return currentPlaybackState === 'waiting';
            });

            /**
             * Returns <code>true</code> if the video's audio is currently muted
             * @name Moovie#muted
             * @type {Boolean}
             * @default true
             * @readonly
             */
            defineGetter(this, 'muted', function () {
                return this.video.muted;
            });

            /**
             * Returns the video's current audio volume as a double between 0
             * and 1.
             * @name Moovie#volume
             * @type {Number}
             * @default 1
             * @readonly
             */
            defineGetter(this, 'volume', function () {
                return this.video.volume;
            });

            /**
             * Returns <code>true</code> if the current Moovie instance is in
             * native fullscreen mode.
             * @name Moovie#fullscreen
             * @type {Boolean}
             * @default false
             * @readonly
             */
            defineGetter(this, 'fullscreen', function () {
                return document.fullscreenEnabled &&
                    document.id(document.fullscreenElement) === this.element;
            });

            /**
             * Returns the video's native width in CSS pixels.
             * @name Moovie#width
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'width', function () {
                return this.video.videoWidth;
            });

            /**
             * Returns the video's native height in CSS pixels.
             * @name Moovie#height
             * @type {Number}
             * @default 0
             * @readonly
             */
            defineGetter(this, 'height', function () {
                return this.video.videoHeight;
            });

            /**
             * A list of all <code>&lt;track&gt;</code> elements
             * @name Moovie#textTracks
             * @type {TextTrackList}
             * @default []
             * @readonly
             */
            defineGetter(this, 'textTracks', function () {
                return tracks;
            });

            this.options.plugins.each(this.loadPlugin, this);

            // If we already have metadata, then chances are, all events that
            // are meant to fire during resource selection have already fired.
            // So, in this case, we will call them all manually. This allows
            // the plugins to function correctly with all media events.
            if (this.hasMetaData()) {
                this.onLoadStart();
                this.onDurationChange();
                this.onLoadedMetaData();
            }
        },
        /* jshint maxstatements:24 */

        /**
         * Builds the title
         * @memberof Moovie#
         * @protected
         * @return {undefined}
         */
        buildTitle: function () {
            this.title = new Element('h1.title');
            this.title.mode = 'showing';

            this.title.disable = function () {
                this.mode = 'disabled';
                this.set('data-mode', 'disabled');
                return this;
            };

            this.title.hide = function () {
                this.mode = 'hidden';
                this.set('data-mode', 'hidden');
                return this;
            };

            this.title.show = function () {
                this.mode = 'showing';
                this.set('data-mode', 'showing');
                return this;
            };

            this.title.update = function (template, data) {
                this.set('text', template.substitute(data || {}));
                return this;
            };

            this.title.inject(this.video, 'after');
        },

        /**
         * Builds the playlist
         * @memberof Moovie#
         * @protected
         * @return {undefined}
         */
        buildPlaylist: function () {
            var title = this.title;
            this.playlist = new Moovie.Playlist({
                template: {
                    html: '\
                        <div><img class="thumbnail" src="{thumbnail}" /></div>\
                        <div><h1 class="title">{title} ({year})</h1>\
                        <p class="synopsis">{synopsis}</p></div>\
                    '
                },
                onReady: function () {
                    title.update('{title}', this.current());
                },
                onSelect: function (current) {
                    title.update('{title}', current);
                }
            });

            // why does it only work here? "Element.wrap"?
            $(this.playlist).inject(this.element);

            // convert playlist into a panel
            this.playlist.create();
            this.playlist.panel.getFirst('.heading').set('text', this.playlist.name);

            if (this.options.playlist) {
                this.playlist.load(this.options.playlist);
            } else {
                this.playlist.parse([serializeVideoElement(this.video)]);
            }
        },

        /**
         * Builds the video's controlbar.
         * @memberof Moovie#
         * @protected
         * @return {undefined}
         */
        buildControls: function () {
            this.controls = new Element('div.controls');
            this.controls.wrapper = new Element('div.wrapper');

            this.controls.play = new Element('div', {
                class: 'play',
                events: {
                    click: this.togglePlayback.bind(this)
                }
            });

            this.controls.stop = new Element('div', {
                class: 'stop',
                events: {
                    click: this.stop.bind(this)
                }
            });

            this.controls.previous = new Element('div', {
                class: 'previous',
                events: {
                    click: this.playlist.previous(this.playlist)
                }
            });

            this.controls.next = new Element('div', {
                class: 'next',
                events: {
                    click: this.playlist.next(this.playlist)
                }
            });

            this.controls.elapsed = new Element('span', {
                class: 'elapsed',
                text: '0:00'
            });

            this.controls.seekbar = new Element('div.seekbar.slider');
            this.controls.seekbar.track = new Element('div', {
                class: 'track',
                events: {
                    click: (function (e) {
                        if (e.target === this.controls.seekbar.track.knob) { return; }
                        var track = this.controls.seekbar.track;
                        var percentage = (e.page.x - track.getLeft()) / track.getWidth();
                        this.seek(percentage * this.duration);
                    }).bind(this)
                }
            });
            this.controls.seekbar.track.fill = new Element('div.fill');
            this.controls.seekbar.track.bar = new Element('div.bar');
            this.controls.seekbar.track.knob = new Element('div.knob');
            this.controls.seekbar.track.adopt(
                this.controls.seekbar.track.fill,
            	this.controls.seekbar.track.bar,
                this.controls.seekbar.track.knob
            );

            this.controls.seekbar.grab(this.controls.seekbar.track);

            this.controls.duration = new Element('span', {
                class: 'duration',
                text: '0:00'
            });

            this.controls.fullscreen = new Element('div', {
                class: 'fullscreen',
                events: {
                    click: this.toggleFullscreen.bind(this)
                }
            });

            this.controls.wrapper.adopt(
                this.controls.play,
                this.controls.stop,
                this.controls.previous,
                this.controls.next,
                this.controls.elapsed,
                this.controls.seekbar,
                this.controls.duration,
                this.controls.fullscreen
            );

            var disposePlaylistControls = function () {
                if (this.playlist.length < 2) {
                    this.controls.previous = this.controls.previous.dispose();
                    this.controls.next = this.controls.next.dispose();
                }
            };

            if (this.playlist.loaded) {
                disposePlaylistControls.call(this);
            } else {
                this.playlist.addEvent('ready', disposePlaylistControls.bind(this));
            }

            this.controls.grab(this.controls.wrapper);
            this.element.grab(this.controls);
        },

        /**
         * Builds the video overlay (which displays the video
         * playback states to the user).
         * @memberof Moovie#
         * @protected
         * @return {undefined}
         */
        buildOverlay: function () {
            this.overlay = new Element('div', {
                class: 'overlay',
                events: {
                    click: (function () {
                        if (this.paused || this.ended || this.stopped) { this.play();}
                        return;
                    }.bind(this))
                }
            });
            this.element.grab(this.overlay);
        },

        build: function () {
            this.element = new Element('figure.moovie');

            if (document.body.contains(this.video)) {
                this.element.wraps(this.video);
            }

            this.buildTitle();
            this.buildPlaylist();
            this.buildControls();
            this.buildOverlay();
        },

        attach: function () {
            this.video.addEvents({
                // media selection progress events
                loadstart: this.onLoadStart.bind(this),
                durationchange: this.onDurationChange.bind(this),
                loadedmetadata: this.onLoadedMetaData.bind(this),
                loadeddata: this.onLoadedData.bind(this),
                progress: this.onProgress.bind(this),
                canplay: this.onCanPlay.bind(this),
                canplaythrough: this.onCanPlayThrough.bind(this),

                // buffering related events
                suspend: this.onSuspend.bind(this),
                emptied: this.onEmptied.bind(this),
                stalled: this.onStalled.bind(this),
                waiting: this.onWaiting.bind(this),

                // seeking related events
                seeking: this.onSeeking.bind(this),
                seeked: this.onSeeked.bind(this),

                abort: this.onAbort.bind(this),
                error: this.onError.bind(this),
                play: this.onPlay.bind(this),
                pause: this.onPause.bind(this),
                playing: this.onPlaying.bind(this),
                timeupdate: this.onTimeUpdate.bind(this),
                ended: this.onEnded.bind(this),
                //volumechange: this.handleVolumeChange.bind(this),
                click: this.togglePlayback.bind(this)
            });

            this.addEvents({
                loadedmetadata: function () {
                    this.title.disable();
                },

                play: function () {
                    this.title.show();
                    this.title.hide.delay(500, this.title);
                },

                pause: function () {
                    this.title.show();
                }
            });
        },

        onLoadStart: function () {
            tracks = this.video.getChildren('track');
            tracks.map(Moovie.toHTMLTrackElement);

            this.setPlaybackState('loading');
            this.fireEvent('loadstart');
        },

        onDurationChange: function () {
            this.controls.duration.set('text', Moovie.Util.parseTime(this.video.duration));
            this.fireEvent('durationchange');
        },

        onLoadedMetaData: function () {
            this.setPlaybackState('stopped');

            // disable native tracks, as Moovie uses it's own text track renderer
            if (Moovie.Support.TextTrackApi) {
                Moovie.Util.disableNativeTextTracks(this.video);
            }

            this.controls.elapsed.set('text', Moovie.Util.parseTime(this.video.currentTime));
            this.fireEvent('loadedmetadata');
        },

        onLoadedData: function () {
            this.fireEvent('loadeddata');
        },

        onProgress: function () {
            var buffered = this.video.buffered.end(this.video.buffered.length - 1);
            var percentage = buffered / this.video.duration;

            if (percentage === 0 || percentage > 0) {
                this.controls.seekbar.track.fill.setStyle('width', percentage * 100 + '%');
            }

            this.fireEvent('progress');
        },

        onCanPlay: function () {
            this.fireEvent('canplay');
        },

        onCanPlayThrough: function () {
            this.fireEvent('canplaythrough');
        },

        onSeeking: function () {
        	this.setPlaybackState('seeking');
        },

        onSeeked: function () {

        },

        onPlay: function () {
            this.setPlaybackState('playing');
            this.fireEvent('play');
        },

        onPause: function () {
            this.setPlaybackState('paused');
            this.fireEvent('pause');
        },

        onEnded: function () {
            // Opera, Safari and IE10 remains in the
            // "play" state even when the video has ended.
            this.pause();

        	this.setPlaybackState('ended');
            this.fireEvent('ended');
        },

        onPlaying: function () {
        	this.setPlaybackState('playing');
            this.fireEvent('playing');
        },

        onSuspend: function () {

        },

        onEmptied: function () {

        },

        onStalled: function () {

        },

        onWaiting: function () {
            this.setPlaybackState('waiting');
            this.fireEvent('waiting');
        },

        onVolumeChange: function () {
            this.fireEvent('volumechange');
        },

        onMuteChange: function () {
            this.fireEvent('mutechange');
        },

        onTimeUpdate: function () {
            var track = this.controls.seekbar.track;
            var ratio = this.elapsed / this.duration;
            var width = Math.ceil(ratio * track.getWidth());

            if (knobOffset === null) {
                knobOffset = track.knob.getPosition(track).x;
            }

            track.bar.setStyle('width', width);
            track.knob.setStyle('left', width - Math.abs(knobOffset));
        	this.controls.elapsed.set('text', Moovie.Util.parseTime(this.elapsed));
            this.fireEvent('timeupdate');
        },

        onAbort: function () {

        },

        onError: function () {

        },

        onFullscreenChange: function () {
        	this.element.set('data-fullscreen', this.fullscreen);
            this.fireEvent('fullscreenchange');
        },

        /**
         * Dynamically load a plugin for this player instance.<br><strong>Note:
         * plugins still need to be registered prior to calling this
         * method.</strong>
         * @memberof Moovie#
         * @param  {String} name    The name of the registered plugin to load
         * @return {Moovie}        <code>this</code>
         */
        loadPlugin: function (name) {
            if (Moovie.registeredPlugins && name in Moovie.registeredPlugins) {
                Moovie.registeredPlugins[name].call(this);
            }

            return this;
        },

        setPlaybackState: function (playbackState) {
            currentPlaybackState = playbackState;
        	this.element.set('data-playbackstate', playbackState);
        },

        hasMetaData: function () {
            var video = this.video;

            return video.networkState >= video.NETWORK_IDLE &&
                video.readyState >= video.HAVE_METADATA;
        },

        /**
         * Re-loads the video. Or loads a new video.
         * @memberof Moovie#
         * @param  {String} src    [description]
         * @param  {String} poster [description]
         * @return {Moovie}        <code>this</code>
         */
        load: function (src, poster) {
            if (src) {
                this.video.src = src;
            }

            // an empty string means we are setting the player to have no poster
            // @todo get the poster from a video frame
            if (poster || poster === '') {
                this.video.poster = poster;
            }

            this.video.load();
            return this;
        },

        /**
         * Plays the video.
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        play: function () {
            this.video.play();
            return this;
        },

        /**
         * Pauses the video.
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        pause: function () {
            this.video.pause();
            return this;
        },

        /**
         * Stops the video. forces the video to stop loading data as well
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        stop: function () {
            // force buffering to stop by re-loading the video source
            this.load(this.video.currentSrc);
            return this;
        },

        /**
         * Send this player fullscreen. Will force any other fullscreen elements to cancel.
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        requestFullscreen: function () {
            if (document.fullscreenEnabled && !document.fullscreenElement) {
                this.element.requestFullscreen();
            }

            return this;
        },

        /**
         * exit out of fullscreen
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        cancelFullscreen: function () {
            if (this.fullscreen) {
                document.exitFullscreen();
            }

            return this;
        },

        /**
         * mute the video's audio
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        mute: function () {
            this.video.muted = true;
            return this;
        },

        /**
         * unmute the videos audio
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        unmute: function () {
            this.video.muted = false;
            return this;
        },

        /**
         * Set the video's audio volume
         * @memberof Moovie#
         * @param {Number} volume a value between 0 and 1
         * @return {Moovie}        <code>this</code>
         */
        setVolume: function (volume) {
            this.video.volume = volume.limit(0, 1);
            return this;
        },

        /**
         * Sets the video's playback position
         * @memberof Moovie#
         * @param {Number} time a value between 0 and {@link Moovie#duration}
         * @return {Moovie}        <code>this</code>
         */
        seek: function (time) {
            time = time.limit(0, this.video.duration);
            this.video.currentTime = time;
            return this;
        },

        /**
         * Gives this class the ability to be treated like an element through
         * the use of <code>document.id</code>
         * @memberof Moovie#
         * @return {Element}
         */
        toElement: function () {
            return this.element;
        },

        /**
         * Resize the video player to a new dimension
         * @memberof Moovie#
         * @param  {Number} width  the new width in CSS pixels
         * @param  {Number} height the new height in CSS pixels
         * @return {Moovie}        <code>this</code>
         */
        resize: function (width, height) {
            if (this.options.aspectRatio === 'original') {
                //var ratio =
                    Moovie.Util.reduceRatio(width, height);
                //this.element.setStyle('padding-bottom', (ratio[1] / ratio[0] * 100) + '%');
            }

            //this.element.setStyle('padding-bottom', '21.75%');
            return this;
        },

        /**
         * Pauses the video if playing, else plays the video.
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        togglePlayback: function () {
            this[this.playing ? 'pause' : 'play']();
            return this;
        },

        /**
         * Exits out of fullscreen if the player is in fullscreen, else, exits
         * out of fullscreen.
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        toggleFullscreen: function () {
            this[this.fullscreen ? 'cancelFullscreen' : 'requestFullscreen']();
            return this;
        },

        /**
         * Mutes the video's audio if it is unmuted, else unmutes it.
         * @memberof Moovie#
         * @return {Moovie}        <code>this</code>
         */
        toggleMute: function () {
        	this.video.muted = !this.video.muted;
            return this;
        }
    });
})();
