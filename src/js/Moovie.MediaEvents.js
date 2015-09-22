/* global Moovie:false */
Moovie.MediaEvents = {
	loadstart: 1,
    progress: 1,
    suspend: 1,
    abort: 1,
    error: 1,
    emptied: 1,
    stalled: 1,
    play: 1,
    pause: 1,
    loadedmetadata: 1,
    loadeddata: 1,
    waiting: 1,
    playing: 1,
    canplay: 1,
    canplaythrough: 1,
    seeking: 1,
    seeked: 1,
    timeupdate: 1,
    ended: 1,
    ratechange: 1,
    durationchange: 1,
    volumechange: 1
};

Object.merge(Element.NativeEvents, Moovie.MediaEvents);
