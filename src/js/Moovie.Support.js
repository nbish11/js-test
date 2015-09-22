/* global Moovie:false */
Moovie.Support = {
	TextTrackApi: 'track' in new Element('track') &&
        'textTracks' in new Element('video')
};
