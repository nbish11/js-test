/* global Moovie:false */
(function () {
    'use strict';

    var registerPlugin = function (name, initializer) {
        if (!Moovie.registeredPlugins) {
            Moovie.registeredPlugins = {};
        }

        Moovie.registeredPlugins[name] = initializer;
        return Moovie;
    };

    Moovie.registerPlugin = registerPlugin.overloadSetter();
})();
