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

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var path = require('path');

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
            bowerDirName: path.basename('<%= bowerDir %>'),
            imgDir: '<%= imgDir %>',
            fontsDir: '<%= fontsDir %>',
            vsVer: '<%= vsVer %>'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                nospawn: true
            },
            js: {
                files: ['<%%= yeoman.jsDir %>/{,*/}*.js'],
                tasks: ['jshint']
            },
            cs: {
                files: ['{,*/}*.cs', 'Controllers/*.cs', 'Models/*.cs'],
                tasks: ['msbuild']
            },
            reload: {
                options: {
                    livereload: 35729
                },
                files: [
                    'Gruntfile.js',
                    'Views/**/*.cshtml',
                    '<%%= yeoman.cssDir %>/{,*/}*.css',
                    '<%%= yeoman.jsDir %>/{,*/}*.js',
                    '<%%= yeoman.imgDir %>/{,*/}*.{gif,jpeg,jpg,png,svg,webp}',
                    '*.config', 'App_Config/**/*.config',
                    '{,*/}*.cs', 'Controllers/*.cs', 'Models/*.cs'
                ]
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
                '<%%= yeoman.cssDir %>/*.min.css',
                '<%%= yeoman.jsDir %>/*.min.js',
                'min'
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
            watch: {
                options: {
                    debugInfo: true,
                    watch: true
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
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.imgDir %>',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: 'min/<%%= yeoman.imgDir %>'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.imgDir %>',
                    src: '{,*/}*.svg',
                    dest: 'min/<%%= yeoman.imgDir %>'
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
                    '<%%= yeoman.jsDir %>/min.amd.js': [
                        '<%%= yeoman.bowerDir %>/almond/almond.js'
                    ]
                }
            }
        },
        bower: {
            require: {
                rjsConfig: '<%%= yeoman.jsDir %>/config.js',
                options: {
                    baseUrl: '<%%= yeoman.jsDir %>'
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: '<%%= yeoman.jsDir %>',
                    mainConfigFile: '<%%= yeoman.jsDir %>/config.js',
                    name: 'main',
                    out: '<%%= yeoman.jsDir %>/min.js',
                    paths: {
                        'jquery': 'empty:'
                    },
                    preserveLicenseComments: false
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%%= yeoman.cssDir %>/min.css',
                        '<%%= yeoman.jsDir %>/min.js',
                        'min/<%%= yeoman.imgDir %>/{,*/}*.*'
                    ]
                }
            }
        },
        usemin: {
            options: {
                assetsDirs: ['', 'min']
            },
            html: ['Views/Shared/_Layout_processed.cshtml'],
            css: ['<%%= yeoman.cssDir %>/*.min.css']
        },
        cdnify: {
            dist: {
                options: {
                    localFallback: true,
                    bowerDir: '<%%= yeoman.bowerDir %>',
                },
                html: ['Views/Shared/_Layout_processed.cshtml'],
                almond: '<%%= yeoman.jsDir %>/min.amd.js',
                components: {
                    'jquery': {
                        localPath: '<%%= yeoman.bowerDir %>/jquery/dist/jquery.min.js',
                        success: 'window.jQuery'
                    }
                }
            }
        },

        install: {
            bower: {}
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
            build: [
                'install:bower',
                'bower:require',
                'msbuild',
                'compass:dist'
            ],
            min: [
                'requirejs',
                'cssmin',
                'uglify',
                'imagemin',
                'svgmin'
            ],
            watch: {
                tasks: ['watch', 'compass:watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.registerTask('install', 'install/restore npm and bower dependencies', function(cmd) {
        var exec = require('child_process').exec;
        var done = this.async();
        exec(cmd + ' install', {cwd: '.'}, function(err, stdout/*, stderr */) {
            console.log(stdout);
            done();
        });
    });

    grunt.registerTask('serve', [
        'open:server',
        'concurrent:watch'
    ]);

    grunt.registerTask('build', function (target) {
        if (target === 'dist') {
            return grunt.task.run([
                'clean:dist',
                'concurrent:build',
                'processhtml',
                'concurrent:min',
                'cdnify',
                'rev',
                'usemin',
                'htmlmin',
                'copy:postdist',
                'clean:postdist'
            ]);
        }

        grunt.task.run([
            'concurrent:build'
        ]);
    });

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
