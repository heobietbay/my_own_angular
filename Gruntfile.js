module.exports = function(grunt) {
    // START INIT
    grunt.initConfig({
        jshint: {
            all: ['src/**/*.js', 'test/**/*.js'],
            options: {
                globals: {
                    _: false,
                    $: false,
                    Promise: false,
                    jasmine: false,
                    _describe: false,
                    it: false,
                    expect: false,
                    beforeEach: false,
                    afterEach: false,
                    describe:false,
                    sinon: false
                },
                browser: true,
                devel: true
            }
        } // END JSHINT CONFIG
        ,
        testem: {
            unit: {
                options: {
                    framework: 'jasmine2',
                    launch_in_dev: ['Chrome'],
                    before_tests: 'grunt jshint',
                    serve_files: ['node_modules/lodash/lodash.min.js',
                                  'node_modules/jquery/dist/jquery.js',
																	'node_modules/sinon/pkg/sinon.js',
																	 'src/**/*.js', 'test/**/*.js' ],
                    watch_files: ['src/**/*.js', 'test/**/*.js']
                }
            }
        } // END TESTEM CONFIG

    });
    //END INIT

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-testem');

    grunt.registerTask('default', ['testem:run:unit']);
};
