/* global Moovie, expect, console */
/* jshint expr:true */

describe('Moovie', function () {
    'use strict';

    it('should be a defined class', function () {
        expect(Moovie).to.be.defined;
        expect(typeOf(Moovie)).to.equal('class');
    });
});
