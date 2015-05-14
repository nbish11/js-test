/*!
 * Moovie - An advanced HTML5 video player for MooTools.
 * Copyright (c) 2010 Colin Aarts <colin@colinaarts.com>
 * Licensed MIT-style.
 */
/*!
 * 
 */

(function (window) {
    'use strict';
    
    var Moovie = function Moovie() {
        if (!(this instanceof Moovie)) {
            throw new TypeError('Moovie MUST be constructed with the `new` keyword.');
        }
    };
    
    window.Moovie = Moovie;
    
})(this);
