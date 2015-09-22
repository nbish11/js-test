/* global Moovie:false */
(function () {
    'use strict';

    // http://phpjs.org/functions/basename/
    function basename(path, suffix) {
        var b = path;
        var lastChar = b.charAt(b.length - 1);

        if (lastChar === '/' || lastChar === '\\') {
            b = b.slice(0, -1);
        }

        b = b.replace(/^.*[\/\\]/g, '');

        /* jshint eqeqeq:false */
        if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
            b = b.substr(0, b.length - suffix.length);
        }
        /* jshint eqeqeq:true */

        return b;
    }

    function extension(path) {
        return path.split('.').pop();
    }

    function filename(path) {
        return basename(path, '.' + extension(path));
    }

    Moovie.Playlist = new Class({
        Implements: [Events, Options, Moovie.Ui.Panel],

        options: {
            name: '',
            url: null,
            template: {
                parent: 'ol.playlist',
                child: 'li[text={title}]',
                active: 'active',
                handler: null,
                text: '{title} ({year})'
            }
        },

        initialize: function (options) {
            this.setOptions(options);

            // playlist info
            this.index = 0;
            this.element = new Element('ol.playlist');
            this.items = [];
            this.length = this.items.length;
            this.name = this.options.name.toString();
            this.loaded = false;

            // bound event handlers
            this.handle = this.handle.bind(this);

            this.attach();
            //this.load(this.options.url);
        },

        attach: function () {
            this.element.addEvent('click:relay(li)', this.handle);
            return this;
        },

        detach: function () {
            this.element.removeEvent('click:relay(li)', this.handle);
            return this;
        },

        handle: function (event, element) {
            this.select(this.items.indexOf(element));
            this.fireEvent('click', [event, element]);
        },

        load: function (url) {
            var request =  new Request.JSON({
                url: url,
                method: 'GET',
                async: true,
                onSuccess: this.parse.bind(this)
            });

            this.loaded = false;
            request.send();
            this.fireEvent('load', [request]);
            return this;
        },

        current: function () {
            return this.active().item;
        },

        active: function () {
            return this.items.filter(function (element) {
                return element.hasClass('active');
            })[0];
        },

        next: function () {
            if (this.hasNext(this.index)) {
                this.select(this.index + 1);
            }
        },

        hasNext: function () {
            return this.index < this.length - 1;
        },

        previous: function () {
            if (this.hasPrevious(this.index)) {
                this.select(this.index - 1);
            }
        },

        hasPrevious: function () {
            return this.index > 0;
        },

        rewind: function () {
            this.index = 0;
            this.setActive(this.index);
            this.fireEvent('rewind');
        },

        select: function (index) {
            if (typeOf(index) === 'string') {
                index = this.items.indexOf(this.findById(index));
            }

            if (index >= 0 && index < this.length) {
                this.index = index;
                this.setActive(index);
                this.fireEvent('select', [
                    this.current(),
                    this.active()
                ]);
            }

            return this;
        },

        toElement: function () {
            return this.element;
        },

        findById: function (id) {
            return this.items.filter(function (element) {
                var item = element.item;
                return 'id' in item && item.id === id;
            })[0];
        },

        parse: function (data) {
            var thisIndex = this.index;
            var template = this.options.template;
            var contentType = 'html' in template ? 'html' : 'text';
            var items = data.map(function (item, index) {
                item.index = index;
                if (!('title' in item)) {
                    // @todo: check "sources" array
                    item.title = filename(item.src).capitalize();
                }
                var options = { class: thisIndex === index ? 'active' : null };
                options[contentType] = template[contentType].substitute(item);
                var element = new Element('li', options);
                element.item = item;
                return element;
            });

            this.items = items;
            this.length = items.length;
            this.element.empty().adopt(items);
            this.loaded = true;
            this.fireEvent('ready', [items]);
            return this;
        },

        setActive: function (index) {
            this.items.each(function (element) {
                element.removeClass('active');
            });

            this.items[index].addClass('active');
            return this;
        }
    });

}) ();
