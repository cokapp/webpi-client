'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('webpi-client.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            statics: {
              src: ['dist/images', 'dist/vendor']
            },
            src: { 
              src: ['dist/styles', 'dist/tpls', 'dist/*.html', 'dist/*.js']
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['<%= files.angular.app %>'
                ,'<%= files.angular.services %>'
                ,'<%= files.angular.filters %>'
                ,'<%= files.angular.directives %>'
                ,'<%= files.angular.controllers %>'],
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
        files: {
            gruntfile: {
                src: ['Gruntfile.js']
            },
            js: {
                src: ['src/scripts/**/*.js']
            },
            angular: {
                controllers: ['src/scripts/controllers/**/*.js'],
                filters: ['src/scripts/filters/**/*.js'],
                directives: ['src/scripts/directives/**/*.js'],
                services: ['src/scripts/services/**/*.js'],
                app: ['src/scripts/app.js']
            },
            tpls: {
                src: ['src/tpls/**/*.html']
            },
            html: {
                src: ['src/*.html']
            },
            css: {
                src: ['src/styles/*.css']
            },
        },
        watch: {
            change: {
                files: ['<%= files.gruntfile.src %>', '<%= files.js.src %>', '<%= files.tpls.src %>', '<%= files.html.src %>', '<%= files.css.src %>'],
                tasks: ['clean:src', 'concat', 'uglify', 'copy:src', 'copy:deploy']
            },
        },
        copy: {
            statics: {
                files: [{
                        expand: true,
                        cwd: 'src/images/',
                        src: '**',
                        dest: 'dist/images/'
                    }, {
                        expand: true,
                        cwd: 'vendor/',
                        src: '**',
                        dest: 'dist/vendor/'
                    },

                ]
            },
            src: {
                files: [{
                        expand: true,
                        cwd: 'src/styles/',
                        src: '**',
                        dest: 'dist/styles/'
                    }, {
                        expand: true,
                        cwd: 'src/tpls/',
                        src: '**',
                        dest: 'dist/tpls/'
                    }, {
                        expand: true,
                        cwd: 'src/',
                        src: '*.html',
                        dest: 'dist/'
                    },

                ]
            },
            deploy: {
                expand: true, 
                cwd: 'dist', 
                src: '**', 
                dest: 'D:\\JS\\pi\\temp\\'}

        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');


    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'copy']);
};
