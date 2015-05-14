/* global module, require */
module.exports = function (grunt) {
    'use strict';
    
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
            unit: {
                configFile: '<%= jshint.karmafile.src %>'
            },
            
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
    
    grunt.registerTask('default', ['test', 'build']);
    grunt.registerTask('test', ['jshint', 'karma:unit']);
    grunt.registerTask('start', ['karma:watch:start', 'watch']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('release', function (target) {
        target = 'bump-only:' + (target || 'patch');
        grunt.task.run(['default', target, 'bump-commit']);
    });
};
