/* global module */
module.exports = function (config) {
    'use strict';
    
    config.set({
        // Enable or disable watching files and executing the tests 
        // whenever one of these files changes.
        autoWatch: false,
        
        // The root path location that will be used to resolve all 
        // relative paths defined in files and exclude.
        basePath : '',
        
        // How long does Karma wait for a browser to reconnect (in ms).
        browserDisconnectTimeout: 3000,
        
        // The number of disconnections tolerated.
        browserDisconnectTolerance: 1,
        
        // How long Karma will wait for a message from a browser,
        // before disconnecting from it (in ms).
        browserNoActivityTimeout: 40000,
        
        // A list of browsers to launch and capture.
        browsers: ['PhantomJS'],
        
        // Timeout for capturing a browser (in ms).
        captureTimeout: 60000,
        
        // Enable or disable colors in the output (reporters and logs).
        colors: true,
        
        // The location of coverage files and the reporter type.
        coverageReporter: {
            type: 'lcov',
            dir: 'test/coverage'
        },
        
        // List of files/patterns to load in the browser.
        files: [
            // dependencies
            'lib/mootools-core/dist/mootools-core.js',
            
            // source
            'src/js/Moovie.js',
            'src/js/Moovie.MediaAttributes.js',
            'src/js/Moovie.Playlist.js',
            
            // fixtures
            { pattern: 'test/fixtures/*.json' },
            
            // tests
            'test/specs/*.js'
        ],
        
        // List of test frameworks you want to use.
        frameworks: ['mocha', 'chai-sinon', 'fixture'],
        
        // Level of logging.
        logLevel: config.LOG_WARN,
        
        // The port where the web server will be listening.
        port: 9876,
        
        // A map of preprocessors to use.
        preprocessors: {
            'src/js/*.js': ['coverage'],
            'test/fixtures/*.json': ['html2js']
        },
        
        // A list of reporters to use.
        reporters: ['dots', 'coverage'],
        
        // Continuous Integration mode.
        singleRun: true
    });
};
