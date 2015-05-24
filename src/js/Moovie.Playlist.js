/* global Moovie */
(function (Moovie) {
    'use strict';
    
    Moovie.Playlist = new Class({
        Implements: [Events, Options],
        
        options: {
            disabled: false,
            url: null,
            name: '',
            template: {
                'class': 'active',
                html: '<p>{{title}}</p>'
            }
        },
        
        /**
         * Creates an instance of Moovie.Playlist
         * 
         * @constructor
         * @this {Moovie.Playlist}
         * @param {Object} options
         */
        initialize: function (options) {
            this.setOptions(options);
            this.element = new Element('ol.playlist');
            
            this.bound = {
                parse: this.parse.bind(this),
                prevent: this.prevent.bind(this),
                relay: this.relay.bind(this)
            };
            
            this.reset();
            
            Object.defineProperties(this, {
                length: {
                    enumerable: true,
                    get: function () {
                        return this.itemData.length;
                    }
                }
            });
            
            if (this.options.url) {
                this.load(this.options.url);
            }
            
            if (!this.options.disabled) {
                this.attach();
            }
        },
        
        /**
         * Resets the class back to it's default state.
         * 
         * @return {Moovie.Playlist}
         */
        reset: function () {
            this.index = 0;
            this.request = null;
            this.itemElements = new Elements();
            this.itemData = [];
            this.name = this.options.name;
            this.element.empty();
            return this;
        },
        
        /**
         * Makes a HTTP GET request to the provided URL and 
         * then sends the data to the parse() method on success.
         * 
         * @param {String} url  The url must lead to a valid JSON file.
         * @return {Moovie.Playlist}
         */
        load: function (url) {
            this.request = new Request.JSON({
                method: 'GET',
                url: url,
                async: true,
                onSuccess: this.bound.parse
            });
            
            this.request.send();
            return this;
        },
        
        /**
         * Start listening and responding to events.
         * 
         * @return {Moovie.Playlist}
         */
        attach: function () {
            this.element.addEvent('mousedown', this.bound.prevent);
            this.element.addEvent('click:relay(li)', this.bound.relay);
            return this;
        },
        
        /**
         * Stop listening and responding to events.
         * 
         * @return {Moovie.Playlist}
         */
        detach: function () {
            this.element.removeEvent('mousedown', this.bound.prevent);
            this.element.removeEvent('click:relay(li)', this.bound.relay);
            return this;
        },
        
        /**
         * Builds the HTML DOM structure based on the 
         * template provided and the JSON data provided 
         * to parse().
         * 
         * @return {Moovie.Playlist}
         */
        build: function () {
            var elements = this.itemData.map(function (item, index) {
                // provide access to item index when building
                //item.index = index;
                
                return new Element('li', {
                    'class': index === this.index ? 'active' : null,
                    'html': this.transform(this.options.template.html, item)
                });
            }, this);
            
            this.itemElements = new Elements(elements);
            this.element.adopt(this.itemElements);
            return this;
        },
        
        /**
         * Parses the raw JSON response into the playlist and 
         * builds the DOM structure. Use this method if you 
         * want to use javascript object array for the playlist 
         * data instead.
         * 
         * @param {Array} response  Must be an array of objects.
         * @return {Moovie.Playlist}
         */
        parse: function (response) {
            this.itemData.combine(response);
            this.build();
            this.fireEvent('load', [
                this.itemData,
                this.itemElements
            ]);
            
            return this;
        },
        
        /**
         * Checks if another item exists in the playlist before 
         * the current one, regardless of whether or not it has 
         * been checked.
         * 
         * @return {Boolean}
         */
        hasPrevious: function () {
            return this.index > 0;
        },
        
        /**
         * Selects the previous unchecked item before the 
         * current one.
         * 
         * @return {Moovie.Playlist}
         */
        previous: function () {
            if (this.hasPrevious()) {
                this.select(this.index - 1);
            }
            
            return this;
        },
        
        /**
         * Checks if another item exists next in the playlist, 
         * whether or not it has been checked.
         * 
         * @return {Boolean}
         */
        hasNext: function () {
            return this.index < this.length - 1;
        },
        
        /**
         * Selects the next unchecked item in the playlist.
         * 
         * @return {Moovie.Playlist}
         */
        next: function () {
            if (this.hasNext()) {
                this.select(this.index + 1);
            }
            
            return this;
        },
        
        /**
         * Selects an item by it's index.
         * 
         * @param {Number} index  This is always converted to an integer.
         * @return {Moovie.Playlist}
         */
        select: function (index) {
            index = index.toInt();
            
            if (index >= 0 && index <= this.length - 1) {
                this.index = index;
                this.fireEvent('select', [
                    this.current(),
                    this.active()
                ]);
            }
            
            return this;
        },
        
        /**
         * Returns the currently selected playlist item.
         * 
         * @return {Object}
         */
        current: function () {
            return this.itemData[this.index];
        },
        
        /**
         * Returns the element corresponding to the current() 
         * playlist item.
         * 
         * @return {Element}
         */
        active: function () {
            return this.itemElements.removeClass('active')[this.index].addClass('active');
        },
        
        /**
         * Allows the class to be treated an an Element.
         * 
         * @return {Element}
         */
        toElement: function () {
            return this.element;
        },
        
        /**
         * Disables text highlighting.
         * 
         * @param {Object} e  The "mousedown" event object.
         * @return {Boolean}  Always returns `false`.
         */
        prevent: function (e) {
            e.preventDefault();
            return false;
        },
        
        /**
         * Handles the click events for the playlist.
         * 
         * @param {Object} e  The "click" event object.
         * @param {Element} clicked  The element that was clicked.
         * @return {Moovie.Playlist}
         */
        relay: function (e, clicked) {
            this.select(this.itemElements.indexOf(clicked));
            return this;
        },
        
        /**
         * Replaces tokens in a template string with the 
         * associated values found in the "data" object.
         * 
         * @param {String} template  Anything surrounded by "{{" and "}}" will be parsed.
         * @param {Object} data 
         * @return {String}
         */
        transform: function (template, data) {
            return template.replace(/{{(?:\s*(.*?)\s*(?:\|\|\s*(.*?)\s*)?)}}/g, function (token, key, defaultValue) {
                return key in (data || {}) ? data[key] : typeof defaultValue !== 'undefined' ? defaultValue : '';
            });
        }
    });
    
})(Moovie);
