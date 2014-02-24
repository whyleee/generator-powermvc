// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-msbuild');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // Configurable paths
            app: '<%= appDir %>',
            dist: 'dist',
            port: 9000
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                nospawn: true,
                livereload: 32694
            },
            // grunt
            gruntfile: {
                files: ['Gruntfile.js']
            },
            // front-end files
            html: {
                files: ['<%= yeoman.app %>/Views/**/*.cshtml']
            },
            sass: {
                files: ['<%= yeoman.app %>/sass/{,*/}*.{scss,sass}'],
                tasks: ['compass:server']
            },
            css: {
                files: ['<%= yeoman.app %>/css/{,*/}*.css']
            },
            js: {
                files: ['<%= yeoman.app %>/js/{,*/}*.js'],
                tasks: ['jshint']
            },
            gfx: {
                files: ['<%= yeoman.app %>/gfx/{,*/}*.{gif,jpeg,jpg,png,svg,webp}']
            },
            // back-end files
            webconfig: {
                files: ['<%= yeoman.app %>/Web.config']
            },
            cs: {
                files: ['<%= yeoman.app %>/**/*.cs'],
                tasks: ['msbuild']
            },
            // bin: {
            //     files: ['<%= yeoman.app %>/bin/{,*/}*.dll']
            // }
        },

        // Rebuilds the project
        msbuild: {
            dev: {
                src: ['<%= yeoman.app %>/<%= yeoman.app %>.csproj'],
                options: {
                    projectConfiguration: 'Debug',
                    targets: ['Build'],
                    stdout: true,
                    maxCpuCount: 8,
                    buildParameters: {
                        WarningLevel: 2,
                        VisualStudioVersion: '12.0'
                    },
                    verbosity: 'quiet'
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/js/*.js'
            ]
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/sass',
                cssDir: '<%= yeoman.app %>/css',
                imagesDir: '<%= yeoman.app %>/gfx',
                javascriptsDir: '<%= yeoman.app %>/js',
                fontsDir: '<%= yeoman.app %>/css/fonts',
                httpStylesheetsPath: '/css',
                httpImagesPath: '/gfx',
                httpJavascriptsPath: '/js',
                httpFontsPath: '/css/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {}
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },

        // Automatically inject Bower components into the HTML file
        'bower-install': {
            app: {
                //html: '<%= yeoman.app %>/index.html',
                ignorePath: '<%= yeoman.app %>/'
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: 'Views/**/*.cshtml',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/css/min.css': [
                        '<%= yeoman.app %>/css/{,*/}*.css'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/js/core.js': [
                        '<%= yeoman.dist %>/js/min.js'
                    ]
                }
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'Web.config',
                        'gfx/{,*/}*.webp',
                        'Views/{,*/}*.cshtml',
                        'css/fonts/{,*/}*.*',
                        'js/packages/'
                    ]
                }]
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                'compass:server'
            ],
            dist: [
                'compass',
            ]
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            //return grunt.task.run(['build', 'connect:dist:keepalive']);
            return grunt.task.run(['build', 'open:server']);
        }

        grunt.task.run([
            'msbuild',
            'compass:server', //concurrent:server',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'compass:dist', // 'concurrent:dist',
        'cssmin',
        'uglify',
        'copy:dist',
        'htmlmin:dist'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
