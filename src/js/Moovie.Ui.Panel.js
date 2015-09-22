/* global Moovie:false */
(function () {
    'use strict';
    
    Moovie.Ui.Panel = new Class({
        closed: false,
        panel: null,

        create: function () {
            var element = $(this);
            var panel = new Element('div.panel');
            var header = new Element('h1.heading');
            var content = new Element('div.content');
            var footer = new Element('div.footer');

            panel.adopt(header, content, footer);
            panel.replaces(element);
            content.grab(element);
            this.panel = panel;
        },

        open: function () {
            this.closed = false;
            $(this).set('data-closed', false);
            return this;
        },

        close: function () {
            this.closed = true;
            $(this).set('data-closed', true);
            return this;
        },

        toggle: function () {
            if (this.closed) {
                this.open();
            } else {
                this.close();
            }
            return this;
        },

        isClosed: function () {
            return this.closed;
        },

        isOpened: function () {
            return !this.opened;
        }
    });
})();
