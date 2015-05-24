/* global Moovie, sinon, expect */
/* jshint expr:true */

var booleanAttrs = [
    'compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked',
    'disabled', 'readOnly', 'multiple', 'selected', 'noresize',
    'defer', 'defaultChecked', 'autofocus', 'controls', 'autoplay',
    'loop', 'default'
];

Element.implement({
    getAttributes: function () {
        'use strict';
        
        var attributes = {};
        
        Array.prototype.slice.call(this.attributes).each(function (attribute) {
            attributes[attribute.name] = booleanAttrs.contains(attribute.name) ? !!attribute.value : attribute.value;
        });
        
        return attributes;
    }
});

describe('Moovie.js', function () {
    'use strict';
    
    beforeEach(function () {
        // create a sandbox
        this.sandbox = sinon.sandbox.create();

        // Because Moovie basically acts like a proxy for the
        // HTMLVideoElement we will need to spy on most, if 
        // not all video methods.
        this.sandbox.spy(HTMLVideoElement.prototype, 'load');
        this.sandbox.spy(HTMLVideoElement.prototype, 'play');
        this.sandbox.spy(HTMLVideoElement.prototype, 'pause');
        this.sandbox.spy(Moovie.prototype, 'pause');
        
        // test fixtures
        this.divElement = new Element('div#test-div-fixture');
        this.divElement.inject(document.body);
        
        this.videoElement = new Element('video#test-video-fixture');
        this.videoElement.inject(document.body);
        
        // instantiation/mock options
        this.genericOptions = {
            greeting: 'Hello, World!',
            debug: true
        };
        
        this.videoOptions = {
            src: 'http://colinaarts.com/assets/avatar.ogv',
            poster: 'http://colinaarts.com/assets/avatar.png'
        };
    
        this.sources = [{
            src: 'avatar.ogv',
            type: 'video/ogg'
        }, {
            src: 'avatar.mov',
            type: 'video/quicktime'
        }];
    
        this.tracks = [{
            kind: 'captions',
            label: 'English for the Hearing Impaired',
            default: true,
            src: '/en-captions-vid.vtt'
        }, {
            kind: 'subtitles',
            label: 'English',
            srclang: 'en',
            src: '/en-subtitles-vid.srt'
        }];
        
        // error messages
        this.unresolvableErrorMessage = /video could not be created or resolved/;
        this.noArgumentsErrorMessage = /video element or options object/;
    });
    
    afterEach(function () {
        this.sandbox.restore();
        this.divElement.destroy();
        this.videoElement.destroy();
    });
    
    it('should be a defined class', function () {
        expect(typeOf(Moovie)).to.equal('class');
    });
    
    it('should implement "Options" mutator', function () {
        expect(Moovie.prototype.setOptions).to.be.a('function');
    });
    
    // this will fail if the Browser does not support the video element
    it('should return instance', function () {
        var moovie = new Moovie(this.videoElement);
        
        expect(moovie).to.be.an.instanceof(Moovie);
    });
    
    describe('initialize()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.initialize).to.be.a('function');
        });
        
        it('should throw an error if called with no arguments', function () {
            var fn = function () {
                return new Moovie();
            };
            
            expect(fn).to.throw(Error, this.noArgumentsErrorMessage);
        });
        
        describe('when the first argument is an object', function () {
            it('should throw an error if a "src" or "sources" option is not provided', function () {
                var fn = function () {
                    return new Moovie({});
                };
                
                expect(fn).to.throw(Error, this.unresolvableErrorMessage);
            });
            
            it('should create a <video> element and set the "video" property', function () {
                var moovie = new Moovie(this.videoOptions);
                
                expect(moovie).to.have.property('video').and.to.be.an.instanceof(HTMLVideoElement);
            });
            
            // Every item in the Moovie.MediaAttributes array is considered a "media-specific option".
            it('should set <video> attributes from only media-specific options', function () {
                var options = Object.merge({}, this.genericOptions, this.videoOptions);
                var moovie = new Moovie(options);
                var attrs = moovie.video.getAttributes();
                
                expect(attrs).to.not.have.property('greeting');
                expect(attrs).to.not.have.property('debug');
            });
            
            // @todo: write tests for "private" parseSources() method
            it('should parse the "sources" property into <source> elements', function () {
                var moovie = new Moovie({
                    sources: this.sources
                });
                
                var sourceElements = moovie.video.getChildren('source');
                
                expect(sourceElements).to.have.length(2);
                expect(sourceElements[0].getAttributes()).to.deep.equal(this.sources[0]);
                expect(sourceElements[1].getAttributes()).to.deep.equal(this.sources[1]);
            });
            
            it('should call the video\'s load method', function () {
                /* jshint unused:false */
                var moovie = new Moovie({
                    sources: this.sources
                });

                expect(HTMLVideoElement.prototype.load).to.have.been.called;
            });
            
            it('should only create <source> elements if the "src" property was not provided', function () {
                var moovie = new Moovie({
                    sources: this.sources,
                    src: this.videoOptions.src
                });
                
                var sourceElements = moovie.video.getChildren('source');
                
                expect(sourceElements).to.have.length(0);
                expect(moovie.video.get('src')).to.equal(this.videoOptions.src);
            });
            
            it('should parse every object in the "tracks" option to <track> elements', function () {
                var options = Object.merge({}, this.videoOptions, {
                    tracks: this.tracks.combine([''])   // empty string is intentional
                });
                
                var moovie = new Moovie(options);
                var trackElements = moovie.video.getChildren('track');
                
                expect(trackElements).to.have.length(2);
                expect(trackElements[0].getAttributes()).to.deep.equal(this.tracks[0]);
                expect(trackElements[1].getAttributes()).to.deep.equal(this.tracks[1]);
            });
            
            // Every item in the Moovie.MediaAttributes array is considered a "media-specific option".
            it('should set the class options without media-specific options', function () {
                var moovie = new Moovie(this.videoOptions);
                
                expect(moovie.options).to.not.have.any.keys(Moovie.MediaAttributes);
            });
            
            it('should set the class options without the "sources" option', function () {
                var moovie = new Moovie({
                    sources: this.sources
                });
                
                expect(moovie).to.not.have.deep.property('options.sources');
            });
            
            it('should set the class options without the "tracks" option', function () {
                var trackOptions = { tracks: this.tracks };
                var options = Object.merge({}, this.videoOptions, trackOptions);
                var moovie = new Moovie(options);
                
                expect(moovie).to.not.have.deep.property('options.tracks');
            });
        });
        
        describe('when the first argument is an element instance', function () {
            it('should throw an error if it is not a <video> element', function () {
                var self = this;
                var fn = function () {
                    return new Moovie(self.divElement);
                };
                
                expect(fn).to.throw(Error, this.unresolvableErrorMessage);
            });
            
            it('should set the "video" property to the <video> element', function () {
                var moovie = new Moovie(this.videoElement);
                
                expect(moovie).to.have.property('video', this.videoElement);
            });
            
            it('should set options if an object is provided as the second argument', function () {
                var moovie = new Moovie(this.videoElement, this.genericOptions);
                
                expect(moovie).to.have.deep.property('options.greeting', this.genericOptions.greeting);
                expect(moovie).to.have.deep.property('options.debug', this.genericOptions.debug);
            });
        });
        
        describe('when the first argument is an element ID', function () {
            it('should throw an error if it is not a <video> element', function () {
                var fn = function () {
                    return new Moovie('test-div-fixture');
                };
                
                expect(fn).to.throw(Error, this.unresolvableErrorMessage);
            });
            
            it('should set the "video" property to the resolved <video> element', function () {
                var moovie = new Moovie('test-video-fixture');
                
                expect(moovie).to.have.property('video', this.videoElement);
            });
            
            it('should set options when an object is provided as the second argument', function () {
                var moovie = new Moovie('test-video-fixture', this.genericOptions);
                
                expect(moovie).to.have.deep.property('options.greeting', this.genericOptions.greeting);
                expect(moovie).to.have.deep.property('options.debug', this.genericOptions.debug);
            });
        });
    });
    
    describe('build()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.build).to.be.a('function');
        });
        
        it('should automatically be called once constructed', function () {
            sinon.spy(Moovie.prototype, 'build');
            
            /* jshint unused:false */
            var moovie = new Moovie(this.videoElement);
            
            expect(Moovie.prototype.build).to.have.been.called;
            
            Moovie.prototype.build.restore();
        });
        
        describe('container|element', function () {
            it('should set the element from options', function () {
                var moovie = new Moovie(this.videoElement, {
                    container: 'test-div-fixture'
                });
                
                expect(moovie).to.have.property('element', this.divElement);
            });
            
            it('should provide and set a default element', function () {
                var moovie = new Moovie(this.videoElement);
                
                expect(moovie).to.have.property('element').and.to.be.an.instanceof(Element);
            });
            
            it('should have a css class of "moovie"', function () {
                var moovie = new Moovie(this.videoElement, {
                    container: this.divElement
                });
                
                expect(moovie.element.hasClass('moovie')).to.be.true;
            });
        });
        
        describe('controls', function () {
            it('should exist', function () {
                var moovie = new Moovie(this.videoElement);
                
                expect(moovie).to.have.property('controls').and.to.be.an('object');
            });
            
            it('should have the correct controls', function () {
                var moovie = new Moovie(this.videoElement);
                var controls = moovie.controls;
                
                expect(controls).to.have.property('play').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('stop').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('previous').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('next').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('elapsed').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('seekbar').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('duration').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('volume').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('settings').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('more').and.to.be.an.instanceof(Element);
                expect(controls).to.have.property('fullscreen').and.to.be.an.instanceof(Element);
            });
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.build()).to.equal(moovie);
        });
    });
    
    describe('load()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.load).to.be.a('function');
        });
        
        it('should try and set video source if first argument is a string', function () {
            var moovie = new Moovie(this.videoElement);
            var src = 'http://colinaarts.com/assets/avatar.ogv';
            
            expect(moovie.video.get('src')).to.be.null;
            
            moovie.load(src);
            
            expect(moovie.video.get('src')).to.equal(src);
        });
        
        it.skip('should load playlist if a string is provided as the first argument and has a ".json" extension', function () {
            
        });
        
        it('should try and set the poster attribute if second arg is a string', function () {
            var moovie = new Moovie(this.videoElement);
            var poster = 'http://colinaarts.com/assets/avatar.png';
            
            expect(moovie.video.get('poster')).to.be.null;
            
            moovie.load(null, poster);
            
            expect(moovie.video.get('poster')).to.equal(poster);
        });
        
        it('should call the video\'s load method', function () {
            var moovie = new Moovie(this.videoElement);

            moovie.load();

            expect(HTMLVideoElement.prototype.load).to.have.been.called;
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.load()).to.equal(moovie);
        });
    });
    
    describe('play()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.play).to.be.a('function');
        });
        
        it('should call the video\'s play method', function () {
            var moovie = new Moovie(this.videoElement);

            moovie.play();

            expect(HTMLVideoElement.prototype.play).to.have.been.called;
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.play()).to.equal(moovie);
        });
    });
    
    describe('pause()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.pause).to.be.a('function');
        });
        
        it('should call the video\'s pause method', function () {
            var moovie = new Moovie(this.videoElement);

            moovie.pause();

            expect(HTMLVideoElement.prototype.pause).to.have.been.called;
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.pause()).to.equal(moovie);
        });
    });
    
    describe('stop()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.stop).to.be.a('function');
        });
        
        it('should call the video\'s pause method', function () {
            var moovie = new Moovie(this.videoElement);

            moovie.stop();

            expect(HTMLVideoElement.prototype.pause).to.have.been.called;
        });
        
        it('should set the playback time to 0', function () {
            var moovie = new Moovie(this.videoElement);

            // mock "currentTime" property and pause method
            moovie.video = Object.clone(moovie.video);
            moovie.video.pause = Function.from();
            
            // explicitly set to NaN to assume no src was provided
            moovie.video.currentTime = NaN;
            moovie.stop();
            
            expect(moovie.video.currentTime).to.equal(0);
        });
        
        
        it('should force a video reload if `true` is passed in', function () {
            var moovie = new Moovie(this.videoElement);

            moovie.stop(true);
            expect(HTMLVideoElement.prototype.load).to.have.been.called;
            
            // basically make sure "load()" wasn't called
            moovie.stop();
            expect(HTMLVideoElement.prototype.load).to.have.been.calledOnce;
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.stop()).to.equal(moovie);
        });
    });
    
    describe('request()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.request).to.be.a('function');
        });
        
        it.skip('should request fullscreen', function () {
            // requestFullscreen()
        });
        
        it.skip('should reflect the fullscreen state', function () {
            // data-fullscreen="true"
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.request()).to.equal(moovie);
        });
    });
    
    describe('cancel()', function () {
        it('should exist on the prototype', function () {
            expect(Moovie.prototype.cancel).to.be.a('function');
        });
        
        it.skip('should cancel fullscreen', function () {
            // requestFullscreen()
        });
        
        it.skip('should reflect the fullscreen state', function () {
            // data-fullscreen="false"
        });
        
        it('should return `this`', function () {
            var moovie = new Moovie(this.videoElement);

            expect(moovie.cancel()).to.equal(moovie);
        });
    });
});
