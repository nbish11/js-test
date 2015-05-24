/*!
 * 
 */

(function (window) {
    'use strict';
    
    var hasVideoSupport = !!(document.createElement('video').canPlayType && HTMLVideoElement);
    //var hasTrackAPISupport = typeof (document.createElement('video').addTextTrack) === 'function';
    //var hasTrackSupport = 'kind' in document.createElement('track');    // ui support
    
    /*
    var parseSources = function parseSources(sources, toSourceElement) {
        var types = {
            'video/mp4; codecs="avc1.42E01E"': ['mp4', 'm4v'],
            'video/ogg; codecs="theora"': ['ogg', 'ogv'],
            'video/webm; codecs="vp8, vorbis"': ['webm']
        };
        
        // mimic source element attributes as object properties
        return sources.map(function (source) {
            if (typeOf(source) === 'string') {
                source = { src: source };
            }
            
            var ext = source.src.split('.').pop();
            
            // Essentially if we haven't explicitly set a type,
            // we will guess one based on the src's file extension.
            if (!('type' in source)) {
                for (var z in types) {
                    if (types[z].contains(ext)) {
                        source.type = z;
                    }
                }
            }
            
            return toSourceElement ? new Element('source', source) : source;
        });    
    };

    var getSrc = function getSrc(sources) {
        var probably = null;
        var maybe = null;
        var video = new Element('video');
        
        sources = parseSources(sources);
        
        for (var i = 0, l = sources.length; i < l; i++) {
            if (video.canPlayType(sources[i].type) === 'probably') {
                probably = sources[i].src;
                continue;
            }
            
            if (video.canPlayType(sources[i].type) === 'maybe') {
                maybe = sources[i].src;
                continue;
            }
        }
        
        return probably || maybe;
    };
    */
    
    var Moovie = new Class({
        Implements: [Options],
        
        options: {
            debug: false,
            container: null
        },
        
        /**
         * Constructor
         * 
         * @constructor
         * @param `required` {String|Object|Element}
         * @param `optional` {Object}
         * @return {Moovie}
         */
        initialize: function (video, options) {
            var sources, tracks;
            
            // Moovie must have <video> tag support.
            if (!hasVideoSupport) {
                throw new Error('Your browser does not support the video tag!');
            }
            
            if (arguments.length === 0) {
                throw new Error('A video element or options object is required!');
            }
            
            // An object with a "src" property
            if (typeOf(video) === 'object' && ('src' in video || 'sources' in video)) {
                
                // filter out video-specific properties (blacklist)
                options = Object.filter(video, function (value, key) {
                    return Moovie.MediaAttributes.contains(key) ? false : true;
                });
                
                // get all video-specific properties (whitelist)
                video = Object.subset(video, Moovie.MediaAttributes);
                this.video = new Element('video', video);
                
                if (typeOf(options.sources) === 'array' && !('src' in video)) {
                    sources = Array.map(options.sources, function (sourceOptions) {
                        return new Element('source', sourceOptions);
                    });
                    
                    delete options.sources;
                    this.video.adopt(sources);
                    this.video.load(); // we're adding <source> elements, let's make sure they actually get loaded.
                }
                
                if (typeOf(options.tracks) === 'array') {
                    tracks = Array.map(options.tracks, function (trackOptions) {
                        if (typeOf(trackOptions) === 'object') {
                            return new Element('track', trackOptions);
                        }
                    });
                    
                    delete options.tracks;
                    this.video.adopt(tracks);
                }
                
                this.setOptions(options);
                
            // a video element instance OR an ID to a video element
            } else if (document.id(video) && instanceOf(document.id(video), HTMLVideoElement)) {
                this.video = document.id(video);
                this.setOptions(options);
            } else {
                throw new Error('The video could not be created or resolved!');
            }
            
            this.bound = {};
            this.build();
        },
        
        /**
         * Builds the player.
         * 
         * @return {Moovie}
         */
        build: function () {
            this.element = document.id(this.options.container) || new Element('div');
            
            if (!this.element.hasClass('moovie')) {
                this.element.addClass('moovie');
            }
            
            this.controls = {
                play: function () {
                    return new Element('div.play', {});
                }(this),
                
                stop: function () {
                    return new Element('div.stop', {});
                }(this),
                
                previous: function () {
                    return new Element('div.previous', {});
                }(this),
                
                next: function () {
                    return new Element('div.next', {});
                }(this),
                
                elapsed: function () {
                    return new Element('div.elapsed', {});
                }(this),
                
                seekbar: function () {
                    return new Element('div.seekbar', {});
                }(this),
                
                duration: function () {
                    return new Element('div.duration', {});
                }(this),
                
                volume: function () {
                    return new Element('div.volume', {});
                }(this),
                
                settings: function () {
                    return new Element('div.settings', {});
                }(this),
                
                more: function () {
                    return new Element('div.more', {});
                }(this),
                
                fullscreen: function () {
                    return new Element('div.fullscreen', {});
                }(this)
            };
            
            return this;
        },
        
        /**
         * Load/re-load the video and set the video's 
         * source and/or poster.
         * 
         * @param `optional` {String}  Sets the video source
         * @param `optional` {String}  Sets the video poster
         * @return {Moovie}
         */
        load: function (src, poster) {
            if (typeOf(src) === 'string') {
                this.video.set('src', src);
            }
            
            if (typeOf(poster) === 'string') {
                this.video.set('poster', poster);
            }
            
            this.video.load();
            return this;
        },
        
        /**
         * Plays the video.
         * 
         * @return {Moovie}
         */
        play: function () {
            this.video.play();
            return this;
        },
        
        /**
         * Pauses the video.
         * 
         * @return {Moovie}
         */
        pause: function () {
            this.video.pause();
            return this;
        },
        
        /**
         * Stops the video.
         * 
         * @param `optional` {Boolean} Forces the data fetching to be suspended.
         * @return {Moovie}
         */
        stop: function (trueStop) {
            this.video.pause();
            
            // This needs to be wrapped in a try/catch block 
            // to prevent other tests from failing. This is 
            // because the video will throw an error when 
            // trying to set the currentTime without a video 
            // src (makes sense).
            try {
                this.video.currentTime = 0;
            } catch (e) {}
            
            // A "true stop" will force all data fetching to 
            // be suspended as well as any events, the poster 
            // will also be re-shown.
            if (trueStop) { this.video.load(); }
            return this;
        },
        
        /**
         * Takes the video into fullscreen mode.
         * 
         * @return {Moovie}
         */
        request: function () {
            return this;
        },
        
        /**
         * Exits the video from fullscreen mode.
         * 
         * @return {Moovie}
         */
        cancel: function () {
            return this;
        }
    });
    
    window.Moovie = Moovie;
    
})(this);
