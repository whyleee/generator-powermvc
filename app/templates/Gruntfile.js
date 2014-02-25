// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var request = require('request');

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // Configurable paths
            proj: '<%= projName %>',
            host: '<%= host %>',
            port: <%= port %>,
            cssDir: '<%= cssDir %>',
            sassDir: '<%= sassDir %>',
            jsDir: '<%= jsDir %>',
            jsLibDir: '<%= jsLibDir %>',
            bowerDir: '<%= bowerDir %>',
            imgDir: '<%= imgDir %>',
            fontsDir: '<%= fontsDir %>',
            vsVer: '<%= vsVer %>'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                nospawn: true,
                livereload: 35729
            },
            // grunt
            gruntfile: {
                files: ['Gruntfile.js']
            },
            // front-end files
            html: {
                files: ['Views/**/*.cshtml']
            },
            css: {
                files: ['<%%= yeoman.cssDir %>/{,*/}*.css']
            },
            sass: {
                files: ['<%%= yeoman.sassDir %>/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'refreshCss'],
                options: {
                    livereload: false
                }
            },
            js: {
                files: ['<%%= yeoman.jsDir %>/{,*/}*.js'],
                tasks: ['jshint']
            },
            gfx: {
                files: ['<%%= yeoman.imgDir %>/{,*/}*.{gif,jpeg,jpg,png,svg,webp}']
            },
            // back-end files
            config: {
                files: ['*.config', 'App_Config/**/*.config']
            },
            cs: {
                files: ['**/*.cs'],
                tasks: ['msbuild']
            }
        },

        // Rebuilds the project
        msbuild: {
            dev: {
                src: ['<%%= yeoman.proj %>.csproj'],
                options: {
                    projectConfiguration: 'Debug',
                    targets: ['Build'],
                    stdout: true,
                    maxCpuCount: 8,
                    buildParameters: {
                        WarningLevel: 2,
                        VisualStudioVersion: '<%%= yeoman.vsVer %>'
                    },
                    verbosity: 'quiet'
                }
            }
        },

        // Empties files/dirs to start fresh
        clean: {
            dist: [
                'Views/min',
                '<%%= yeoman.cssDir %>/min.css',
                '<%%= yeoman.jsDir %>/min.js'
            ],
            postdist: [
                'Views/Shared/_Layout_processed.cshtml',
                'Views/min/Shared/_Layout_processed.cshtml'
            ]
        },

        // Process HTML files
        processhtml: {
            dist: {
                files: {
                    'Views/Shared/_Layout_processed.cshtml': ['Views/Shared/_Layout.cshtml']
                }
            }
        },

        // Copy files
        copy: {
            postdist: {
                src: 'Views/min/Shared/_Layout_processed.cshtml',
                dest: 'Views/min/Shared/_Layout.cshtml'
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
                '<%%= yeoman.jsDir %>/*.js',
                '!<%%= yeoman.jsLibDir %>/*'
            ]
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%%= yeoman.sassDir %>',
                cssDir: '<%%= yeoman.cssDir %>',
                javascriptsDir: '<%%= yeoman.jsDir %>',
                imagesDir: '<%%= yeoman.imgDir %>',
                fontsDir: '<%%= yeoman.fontsDir %>',
                httpStylesheetsPath: '/<%%= yeoman.cssDir %>',
                httpJavascriptsPath: '/<%%= yeoman.jsDir %>',
                httpImagesPath: '/<%%= yeoman.imgDir %>',
                httpFontsPath: '/<%%= yeoman.fontsDir %>',
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
                    cwd: 'Views',
                    src: '**/*.cshtml',
                    dest: 'Views/min'
                }]
            }
        },
        cssmin: {
            dist: {
                options: {
                    keepSpecialComments: false
                },
                files: {
                    '<%%= yeoman.cssDir %>/min.css': [
                        '<%%= yeoman.cssDir %>/{,*/}*.css',
                        '!<%%= yeoman.cssDir %>/{,*/}*.min.css',
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%%= yeoman.jsDir %>/min.js': [
                        '<%%= yeoman.jsDir %>/{,*/}*.js',
                        '!<%%= yeoman.jsDir %>/{,*/}*.min.js',
                        '!<%%= yeoman.jsDir %>/_references.js',
                        '!<%%= yeoman.jsDir %>/jquery-*.js'
                    ]
                }
            }
        },

        // Open in browser
        open: {
            server: {
                path: 'http://<%%= yeoman.host %>:<%%= yeoman.port %>',
                app: 'chrome'
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            serve: [
                'msbuild',
                'compass:server'
            ],
            dist: [
                'msbuild',
                'compass:dist'
            ],
            min: [
                'cssmin',
                'uglify',
                'htmlmin:dist'
            ]
        }
    });

    var changedCss = [];

    grunt.event.on('watch', function(action, filepath) {
        if (filepath.indexOf('.scss', filepath.length - '.scss'.lenth) != -1 ||
            filepath.indexOf('.sass', filepath.length - '.sass'.lenth) != -1) {
            var sassDirPath = ('<%= sassDir %>\\').replace('/', '\\');
            var cssDirPath = ('<%= cssDir %>\\').replace('/', '\\');
            var cssPath = filepath.replace(sassDirPath, cssDirPath)
                .replace('.scss', '.css')
                .replace('.sass', '.css');
            changedCss.push(cssPath);
            console.log('CSS path: ' + cssPath);
        }
    });

    grunt.registerTask('refreshCss', function (target) {
        request.post('http://localhost:35729/changed', {
                json: {
                    files: changedCss
                }
            }, function (error, response, body) {
                if (error) {
                    grunt.log.writeln('ERROR'.red);
                }
                changedCss = [];
            }
        );
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:server']);
        }

        grunt.task.run([
            'concurrent:serve',
            'open:server',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'concurrent:dist',
        'processhtml',
        'concurrent:min',
        'copy:postdist',
        'clean:postdist'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
