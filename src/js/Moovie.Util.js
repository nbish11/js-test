/* global Moovie:false */
Moovie.Util = {
    disableNativeTextTracks: function (video) {
        'use strict';

        for (var i = 0, l = video.textTracks.length; i < l; i++) {
            video.textTracks[i].track.mode = 'disabled';
        }
    },

    /**
     * Resize arbitary width x height region to fit inside another region.
     *
     * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     *
     * @param {Number} srcWidth Source area width
     * @param {Number} srcHeight Source area height
     * @param {Number} maxWidth Fittable area maximum available width
     * @param {Number} srcWidth Fittable area maximum available height
     * @return {Object} { width, heigth }
     */
    /* jshint maxparams:4 */
    calculateAspectRatioFit: function (srcWidth, srcHeight, maxWidth, maxHeight) {
    /* jshint maxparams:3 */
        'use strict';

        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

        return {
            width: srcWidth * ratio,
            height: srcHeight * ratio
        };
    },

    /**
     * Reduce a numerator and denominator to it's smallest, integer ratio using Euclid's Algorithm
     */
    reduceRatio: function (numerator, denominator) {
        'use strict';

        var gcd, temp, divisor;

        // from: http://pages.pacificcoast.net/~cazelais/euclid.html
        gcd = function (a, b) {
            if (b === 0) {
                return a;
            }

            return gcd(b, a % b);
        };

        if (numerator === denominator) {
            return [1, 1];
        }

        // make sure numerator is always the larger number
        if (+numerator < +denominator) {
            temp        = numerator;
            numerator   = denominator;
            denominator = temp;
        }

        divisor = gcd(+numerator, +denominator);

        return typeof temp === 'undefined' ?
            [numerator / divisor, denominator / divisor] :
        	[denominator / divisor, numerator / divisor];
    },

    // parse seconds into a timestring with optional hours and optional leading 0
    parseTime: function (seconds) {
        'use strict';

        if (!isFinite(seconds)) {
            return '0:00';
        }

        seconds = Math.round(seconds);

        var hh = Math.floor(seconds / 3600);
        var mm = Math.floor(seconds % 3600 / 60);
        var ss = Math.ceil(seconds % 3600 % 60);
        var time = '';

        if (hh > 0) {
            time += hh + ':';
        }

        if (hh > 0 && mm < 10) {
            time += '0';
        }

        return time + mm + (ss < 10 ? ':0' : ':') + ss;
    },

    defineConstant: function (obj, name, value) {
        'use strict';

        Object.defineProperty(obj, name, {
            enumerable: true,
            value: value,
            writeable: false
        });
    },

    defineGetter: function (obj, name, getter) {
        'use strict';

        Object.defineProperty(obj, name, {
            enumerable: true,
            get: getter
        });
    }
};
