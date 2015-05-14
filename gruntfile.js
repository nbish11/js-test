/* global module, require, console */
module.exports = function (grunt) {
    'use strict';
    
    var inArray = function (needle, haystack) {
        for (var i = 0, l = haystack.length; i < l; i++) {
            if (haystack[i] === needle) { return true; }
        }
        
        return false;
    };
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        banner: '/*!\n * <%= pkg.name %> - <%= pkg.description %>\n' +
            ' * Copyright (c) 2010 <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
            ' * Licensed <%= pkg.license %>-style.\n */\n',
        
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            
            dist: {
                src: ['src/js/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            
            gruntfile: {
                src: 'Gruntfile.js'
            },
            
            karmafile: {
                src: 'karma.conf.js'
            },
            
            all: {
                src: [
                    'src/js/*.js',
                    'test/specs/*.js'
                ]
            }
        },
        
        karma: {
            // single run test using locally installed browsers
            unit: {
                configFile: '<%= jshint.karmafile.src %>'
            },
            
            // monitor files/folders for changes automatically
            watch: {
                configFile: '<%= jshint.karmafile.src %>',
                background: true
            }
        },
        
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            
            karmafile: {
                files: '<%= jshint.karmafile.src %>',
                tasks: ['jshint:karmafile']
            },
            
            all: {
                files: '<%= jshint.all.src %>',
                tasks: ['jshint:all', 'karma:watch:run']
            }
        },
        
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        }
    });
    
    require('load-grunt-tasks')(grunt);
    
    grunt.registerTask('test', ['jshint', 'karma:unit']);
    grunt.registerTask('start', ['karma:watch:start', 'watch']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('default', ['test', 'build']);
    grunt.registerTask('release', function (target, msg) {
        var bumpOptions = grunt.config.data.bump.options;
        var allowed = ['patch', 'minor', 'major'];
        
        if (inArray(target, allowed)) {
        
            if (msg) {
                bumpOptions.commitMessage = msg;
            }
            
        } else if (!msg && target) {
            bumpOptions.commitMessage = target;
            target = 'patch';
        } else {
            target = 'patch';
        }
        
        console.log(target, bumpOptions.commitMessage);
        target = 'bump-only:' + target;
        //grunt.task.run(['default', target, 'bump-commit']);
    });
};
