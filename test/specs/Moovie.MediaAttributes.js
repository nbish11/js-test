/* global Moovie, expect */
/* jshint expr:true */
describe('Moovie.MediaAttributes', function () {
    'use strict';
    
    // http://www.w3.org/wiki/HTML/Elements/video#HTML_Attributes
    it('should be an array with each item corresponding to a HTML "media" attribute', function () {
        var htmlAttributes = [
            'autoplay', 'preload', 'controls', 'loop', 'poster', 'height', 'width', 'muted', 'mediagroup', 'src'
        ];
        
        expect(Moovie).to.have.property('MediaAttributes').and.to.be.an('array');
        expect(Moovie.MediaAttributes).to.have.members(htmlAttributes);
    });
});
