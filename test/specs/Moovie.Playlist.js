/* global Moovie, expect, sinon, fixture */
/* jshint expr:true */
describe('Moovie.Playlist', function () {
    'use strict';
    
    before(function () {
        fixture.setBase('test/fixtures');
    });
    
    beforeEach(function () {
        this.playlistPrototype = Moovie.Playlist.prototype;
        
        this.sandbox = sinon.sandbox.create();
        this.sandbox.spy(this.playlistPrototype, 'attach');
        this.sandbox.spy(this.playlistPrototype, 'parse');
        this.sandbox.spy(this.playlistPrototype, 'reset');
        this.sandbox.spy(this.playlistPrototype, 'build');
        this.sandbox.spy(this.playlistPrototype, 'load');
        this.sandbox.spy(this.playlistPrototype, 'transform');
        
        this.server = sinon.fakeServer.create();
        this.sendResponse = this.server.respond.bind(this.server);
        this.setResponse = function (url, data) {
            this.respondWith(url, [200, {'Content-Type': 'application/json'}, JSON.encode(data)]);
        }.bind(this.server);
    });
    
    afterEach(function () {
        this.sandbox.restore();
        this.server.restore();
    });
    
    it('should be a defined module', function () {
        expect(typeOf(Moovie.Playlist)).to.equal('class');
    });
    
    it('should implement the correct mutators', function () {
        expect(this.playlistPrototype.fireEvent).to.be.a('function');
        expect(this.playlistPrototype.setOptions).to.be.a('function');
    });
    
    it('should return an instance when constructed', function () {
        var playlist = new Moovie.Playlist({});
        
        expect(playlist).to.be.an.instanceof(Moovie.Playlist);
    });
    
    describe('initialize()', function () {
        it('should set options if they are provided, overriding defaults as neccessary', function () {
            var playlist = new Moovie.Playlist({
                url: '/playlist.json',
                name: 'My Playlist!'
            });
            
            expect(playlist).to.have.deep.property('options.url', '/playlist.json');
            expect(playlist).to.have.deep.property('options.name', 'My Playlist!');
        });
        
        it('should have an "element" property that is an <ol> element', function () {
            var playlist = new Moovie.Playlist();
            
            expect(playlist).to.have.property('element');
            expect(playlist.element).to.be.an.instanceof(Element);
            expect(playlist.element.get('tag')).to.equal('ol');
            expect(playlist.element.hasClass('playlist')).to.be.true;
        });
        
        it('should call the reset() method', function () {
            /* jshint unused:false */
            var playlist = new Moovie.Playlist();
            
            // The reset() method is what sets the blank state.
            expect(this.playlistPrototype.reset).to.have.been.calledOnce;
        });
        
        it('should call the load() method if the "url" option is provided', function () {
            /* jshint unused:false */
            var playlist = new Moovie.Playlist({ url: '/playlist.json' });
            
            expect(this.playlistPrototype.load).to.have.been.calledWith('/playlist.json');
        });
        
        it('should not call the attach() method if the "disabled" option is set to "true"', function () {
            /* jshint unused:false */
            var playlist = new Moovie.Playlist({ disabled: true });
            
            expect(this.playlistPrototype.attach).to.have.not.been.called;
        });
        
        it('should call the attach() method if the "disabled" option is set to "false" or is not provided', function () {
            /* jshint unused:false */
            var playlist = new Moovie.Playlist();
            
            expect(this.playlistPrototype.attach).to.have.been.calledOnce;
        });
    });
    
    describe('reset()', function () {
        it('should set the "name" property to an empty string if the "name" option was not provided', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.name = 'My Boring Playlist!';
            playlist.reset();
            
            expect(playlist).to.have.property('name', '');
        });
        
        it('should set the "name" property to the value of the "name" option when provided', function () {
            var playlist = new Moovie.Playlist({ name: 'My Cool Playlist!' });
            
            playlist.name = 'My Boring Playlist!';
            playlist.reset();
            
            expect(playlist).to.have.property('name', 'My Cool Playlist!');
        });
        
        it('should set the "index" property to "0"', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.index = 5;
            playlist.reset();
            
            expect(playlist).to.have.property('index', 0);
        });
        
        it('should set the "request" property to "null"', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.request = new Request.JSON({});
            playlist.reset();
            
            expect(playlist).to.have.property('request', null);
        });
        
        it('should set the "itemElements" property to a new empty `Elements` instance', function () {
            var playlist = new Moovie.Playlist();
            var itemElements = playlist.itemElements;
            
            playlist.itemElements.push(new Element('div'));
            playlist.reset();
            
            expect(playlist).to.have.property('itemElements');
            expect(playlist.itemElements).to.be.an.instanceof(Elements);
            expect(playlist.itemElements).to.be.empty;
            expect(playlist.itemElements).to.not.equal(itemElements);
        });
        
        it('should set the "itemData" property to a new empty array', function () {
            var playlist = new Moovie.Playlist();
            var itemData = playlist.itemData;
            
            playlist.itemData.push({ test: 'value' });
            playlist.reset();
            
            expect(playlist).to.have.property('itemData');
            expect(playlist.itemData).to.be.an('array');
            expect(playlist.itemData).to.be.empty;
            expect(playlist.itemData).to.not.equal(itemData);
        });
        
        it('should be empty (as in no playlist data)', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.itemData = [{}, {}, {}];
            playlist.reset();
            
            // We have to use the "lengthOf" matcher here.
            expect(playlist).to.have.lengthOf(0);
        });
        
        it('should empty the playlist element of all child nodes', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.element.grab(new Element('li'));
            playlist.reset();
            
            expect(playlist.element.getChildren()).to.be.empty;
        });
        
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();
            
            expect(playlist.reset()).to.equal(playlist);
        });
    });
    
    describe('load()', function () {
        it('should make an asynchronus JSON-based GET request to the provided URL', function () {
            var playlist = new Moovie.Playlist();
            var jsonRequestSendSpy = sinon.spy(Request.JSON.prototype, 'send');
            
            playlist.load('/playlist.json');
            
            // spy on Request.JSON for send method and url and method and async options
            expect(playlist.request.options.method).to.equal('GET');
            expect(playlist.request.options.async).to.be.true;
            expect(playlist.request.options.url).to.equal('/playlist.json');
            expect(jsonRequestSendSpy).to.have.been.calledOnce;
            
            jsonRequestSendSpy.restore();
        });
        
        it('should call the parse() method on a successful request', function () {
            var playlist = new Moovie.Playlist();
            var data = fixture.load('simple-playlist.json');
            this.setResponse('/playlist.json', data);
            
            playlist.load('/playlist.json');
            this.sendResponse();
            
            expect(this.playlistPrototype.parse).to.have.been.calledOnce;
            expect(this.playlistPrototype.parse.args[0][0]).to.deep.equal(data);
        });
        
        it('should do nothing if the request fails', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.load('/blah.json');
            
            expect(this.playlistPrototype.parse).to.have.not.been.called;
        });
        
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();
            
            expect(playlist.load()).to.equal(playlist);
        });
    });
    
    describe('parse()', function () {
        it('should store response data in the playlist', function () {
            var data = fixture.load('simple-playlist.json');
            var playlist = new Moovie.Playlist();
            
            playlist.parse(data);
            
            expect(playlist.itemData).to.deep.equal(data);
        });
        
        it('should call the build() method once stored', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(this.playlistPrototype.build).to.have.been.calledOnce;
        });
        
        it('should fire the "load" event with the correct args', function () {
            var playlist = new Moovie.Playlist();
            var callback = sinon.spy();
            
            playlist.addEvent('load', callback);
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(callback).to.have.been.calledOnce;
            expect(callback.args[0][0]).to.equal(playlist.itemData);
            expect(callback.args[0][1]).to.equal(playlist.itemElements);
        });
        
        it('should be chainable', function () {
            var data = fixture.load('simple-playlist.json');
            var playlist = new Moovie.Playlist();
            
            expect(playlist.parse(data)).to.equal(playlist);
        });
    });
    
    // The build() method is called automatically when data 
    // is passed to the parse() method.
    describe('build()', function () {
        it('should create a <li> element for each playlist item', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(playlist.itemElements.filter('li')).to.have.lengthOf(3);
        });
        
        it('should add the "active" class to the element associated with the currently selected playlist item', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(playlist.itemElements[playlist.index].hasClass('active')).to.be.true;
        });
        
        it('should call the transform() method for each playlist item and inject the result as html', function () {
            var data = fixture.load('simple-playlist.json');
            var transform = this.playlistPrototype.transform;
            var playlist = new Moovie.Playlist();
            var html = playlist.options.template.html;
            
            playlist.parse(data);
            
            expect(transform).to.have.been.calledThrice;
            expect(transform.getCall(0)).to.have.been.calledWith(html, data[0]);
            expect(transform.getCall(1)).to.have.been.calledWith(html, data[1]);
            expect(transform.getCall(2)).to.have.been.calledWith(html, data[2]);
        });
        
        it('should be injected into the playlist element', function () {
            var playlist = new Moovie.Playlist(), active;
            
            playlist.parse(fixture.load('simple-playlist.json'));
            active = playlist.element.getChildren('li.active');
            
            expect(playlist.element.getChildren('li')).to.have.lengthOf(3);
            expect(active).to.have.lengthOf(1);
            expect(playlist.itemElements.indexOf(active[0])).to.equal(playlist.index);
        });
        
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();
            
            expect(playlist.build()).to.equal(playlist);
        });
    });
    
    describe('hasPrevious()', function () {
        it('should return true if another item exists', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            playlist.index = 1;
            
            expect(playlist.hasPrevious()).to.be.true;
        });
        
        it('should return false if another item does not exist', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(playlist.hasPrevious()).to.be.false;
        });
    });
    
    describe('hasNext()', function () {
        it('should return true if another item exists', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(playlist.hasNext()).to.be.true;
        });
        
        it('should return false if another item does not exist', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            playlist.index = 2;
            
            expect(playlist.hasNext()).to.be.false;
        });
    });
    
    describe('toElement()', function () {
        it('should return the same element on multiple calls', function () {
            var playlist = new Moovie.Playlist();
            var element = playlist.element;
            
            expect(playlist.element).to.equal(element);
            expect($(playlist)).to.equal(element);
            expect(playlist.toElement()).to.equal(element);
        });
    });
    
    describe('active()', function () {
        it('should return the element associated with the currently selected playlist item', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            playlist.index = 1;
            
            // make sure only 1 element is considered "active"
            expect(playlist.itemElements.filter('li.active')).to.have.lengthOf(1);
            expect(playlist.itemElements.indexOf(playlist.active())).to.equal(playlist.index);
        });
    });
    
    describe('current()', function () {
        it('should return the currently selected playlist item', function () {
            var playlist = new Moovie.Playlist();
            var data = fixture.load('simple-playlist.json');
            
            playlist.parse(data);
            
            expect(playlist.current()).to.deep.equal(data[0]);
        });
    });
    
    describe('select()', function () {
        // a valid number is considered to be above or equal to 0, and less than playlist length minus one;
        it('should set the index if the number provided is valid', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            playlist.select(2);
            expect(playlist.index).to.equal(2);
            
            playlist.select(0);
            expect(playlist.index).to.equal(0);
            
            playlist.select(1);
            expect(playlist.index).to.equal(1);
        });
        
        it('should fire the "select" event if the index was successfully set', function () {
            var playlist = new Moovie.Playlist();
            var callback = sinon.spy();
            
            playlist.addEvent('select', callback);
            playlist.parse(fixture.load('simple-playlist.json'));
            playlist.select(1);
            
            expect(callback).to.have.been.calledOnce;
            expect(callback.args[0][0]).to.equal(playlist.current());
            expect(callback.args[0][1]).to.equal(playlist.active());
        });
        
        it('should do nothing if the number is invalid', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            playlist.select(-4);
            expect(playlist.index).to.equal(0);
            
            playlist.select(4);
            expect(playlist.index).to.equal(0);
        });
        
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();
            
            expect(playlist.select(4)).to.equal(playlist);
        });
    });
    
    describe('next()', function () {
        it('should increment the index by one if hasNext() returns true', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            playlist.next();
            expect(playlist.index).to.equal(1);
            
            playlist.next();
            expect(playlist.index).to.equal(2);
            
            playlist.next();
            expect(playlist.index).to.equal(2);
        });
        
        it('should fire the "select" event if hasNext() returns true', function () {
            
        });
        
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(playlist.next()).to.equal(playlist);
        });
    });
    
    describe('previous()', function () {
        it('should decrement the index by one if hasPrevious() returns true', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            playlist.index = 2;
            
            playlist.previous();
            expect(playlist.index).to.equal(1);
            
            playlist.previous();
            expect(playlist.index).to.equal(0);
            
            playlist.previous();
            expect(playlist.index).to.equal(0);
        });
        
        it('should fire the "select" event if hasPrevious() returns true', function () {
            
        });
        
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();
            
            playlist.parse(fixture.load('simple-playlist.json'));
            
            expect(playlist.previous()).to.equal(playlist);
        });
    });
});
