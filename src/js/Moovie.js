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
