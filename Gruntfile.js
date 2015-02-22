/**
 * Copyright 2013, 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var path = require("path");
 
module.exports = function(grunt) {
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: {
            dist: ".dist"
        },
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: { src: ['test/**/*_spec.js'] },
            core: { src: ["test/_spec.js","test/red/**/*_spec.js"]},
            nodes: { src: ["test/nodes/**/*_spec.js"]}
        },
        jshint: {
            options: {
                // http://www.jshint.com/docs/options/
                "asi": true,      // allow missing semicolons
                "curly": true,    // require braces
                "eqnull": true,   // ignore ==null
                "forin": true,    // require property filtering in "for in" loops
                "immed": true,    // require immediate functions to be wrapped in ( )
                "nonbsp": true,   // warn on unexpected whitespace breaking chars
                //"strict": true, // commented out for now as it causes 100s of warnings, but want to get there eventually
                "loopfunc": true, // allow functions to be defined in loops
                "sub": true       // don't warn that foo['bar'] should be written as foo.bar
            },
            all: [
                'Gruntfile.js',
                'red.js',
                'red/**/*.js',
                'nodes/**/*.js',
                'editor/js/**/*.js'
            ],
            
            core: {
                files: {
                    src: [
                        'Gruntfile.js',
                        'red.js',
                        'red/**/*.js'
                    ]
                }
            },
            nodes: {
                files: {
                    src: [ 'nodes/**/*.js' ]
                }
            },
            editor: {
                files: {
                    src: [ 'editor/js/**/*.js' ]
                }
            },
            tests: {
                files: {
                    src: ['test/**/*.js']
                },
                options: {
                    "expr": true
                }
            }
        },
        concat: {
            options: {
                separator: ";",
            },
            build: {
              src: ["editor/js/main.js","editor/js/settings.js","editor/js/user.js","editor/js/comms.js","editor/js/ui/state.js","editor/js/nodes.js","editor/js/history.js","editor/js/validators.js","editor/js/ui/menu.js","editor/js/ui/keyboard.js","editor/js/ui/tabs.js","editor/js/ui/view.js","editor/js/ui/sidebar.js","editor/js/ui/palette.js","editor/js/ui/tab-info.js","editor/js/ui/tab-config.js","editor/js/ui/editor.js","editor/js/ui/library.js","editor/js/ui/notifications.js","editor/js/ui/touch/radialMenu.js"],
              dest: "public/red/red.js"
            }
        },
        uglify: {
            build: {
                files: {
                    'public/red/red.min.js': 'public/red/red.js'
                }
            }
        },
        sass: {
            build: {
                options: {
                    outputStyle: 'compressed'
                },
                files: [{
                    dest: 'public/red/style.min.css',
                    src: 'editor/sass/style.scss'
                }]
            }
        },
        clean: {
            build: {
                src: [
                    "public/red",
                    "public/index.html",
                    "public/favicon.ico",
                    "public/icons",
                    "public/vendor"
                ]
            },
            dist: {
                src: [
                    '<%= paths.dist %>'
                ]
            }
            
        },
        watch: {
            js: {
                files: [
                    'editor/js/**/*.js'
                ],
                tasks: ['concat','uglify']
            },
            sass: {
                files: [
                    'editor/sass/**/*.scss'
                ],
                tasks: ['sass']
            }
        },
        
        nodemon: {
            /* uses .nodemonignore */
            dev: {
                script: 'red.js',
                args:['-v'],
                ext: 'js,html'
            }
        },
        
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        
        copy: {
            build: {
                files:[{
                    cwd: 'editor/images',
                    src: '**',
                    expand: true,
                    dest: 'public/red/images/'
                },{
                    cwd: 'editor/vendor',
                    src: '**',
                    expand: true,
                    dest: 'public/vendor/'
                },{
                    cwd: 'editor/icons',
                    src: '**',
                    expand: true,
                    dest: 'public/icons/'
                },{
                    expand: true,
                    src: ['editor/index.html','editor/favicon.ico'],
                    dest: 'public/',
                    flatten: true
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    src: [
                        '*.md',
                        'LICENSE',
                        'package.json',
                        'settings.js',
                        'red.js',
                        'lib/.gitignore',
                        'nodes/*.demo',
                        'nodes/core/**',
                        'red/**',
                        'public/**'
                    ],
                    dest: path.resolve('<%= paths.dist %>/node-red-<%= pkg.version %>')
                }]
            }
        },
        
        compress: {
            release: {
                options: {
                    archive: '<%= paths.dist %>/node-red-<%= pkg.version %>.zip'
                },
                expand: true,
                cwd: '<%= paths.dist %>/',
                src: ['node-red-<%= pkg.version %>/**']
            }
        }

    });
    
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask('default', ['test-core','test-editor','test-nodes']);
    
    grunt.registerTask('test-core', ['jshint:core','simplemocha:core']);
    grunt.registerTask('test-editor', ['jshint:editor']);
    grunt.registerTask('test-nodes', ['simplemocha:nodes']);

    grunt.registerTask('build', ['clean:build','concat:build','uglify:build','sass:build','copy:build']);
    
    grunt.registerTask('dev', ['build','concurrent:dev']);
    
    grunt.registerTask('dist', ['build','clean:dist','copy:dist','compress:release']);
    
};
