module.exports = function(grunt)
{
	// START INIT
	grunt.initConfig({
		jshint: {
			all: ['src/**/*.js','test/**/*.js']],
			options: {
				globals: {
					_:false,
					$:false,
					Promise:false,
					jasmine: false,
					_describe:false,
					it:false,
					expect:false,
					beforeEach: false,
					afterEach: false,
					sinon: false
				},
				browser:true,
				devel:true
			}
		}
	});
	//END INIT

	grunt.loadNpmTasks('grunt-contrib-jshint');
};