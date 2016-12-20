module.exports = function (grunt) {


  var copyConfig = {
    files: [
      //===LIBRARIES ===================
      {
        expand: true,
        cwd: 'node_modules/jquery/dist',
        src: 'jquery.js',
        dest: 'public/js/lib/jquery'
      },
      {
        expand: true,
        cwd: 'node_modules/x2js',
        src: 'x2js.js',
        dest: 'public/js/lib/x2js'
      },
      {
        expand: true,
        cwd: 'node_modules/angular',
        src: 'angular.js',
        dest: 'public/js/lib/angular'
      },
      {
        expand: true,
        cwd: 'node_modules/angular-route',
        src: 'angular-route.js',
        dest: 'public/js/lib/angular-route'
      },
      {
        expand: true,
        cwd: 'node_modules/bootstrap/dist',
        src: ['**'],
        dest: 'public/bootstrap'
      },
      {
        expand: true,
        cwd: 'node_modules/d3/build',
        src: ['d3.js'],
        dest: 'public/js/lib/d3'
      },
      //======================================
      // Views
      {
        expand: true,
        cwd: 'src/',
        src: ['views/*.html'],
        dest: 'public/'
      },
      // Maps 
      {
        expand: true,
        cwd: 'src/',
        src: ['js/sfmaps/*.json'],
        dest: 'public/'
      },
      // Views with subfolders and js 
      {
        expand: true,
        cwd: 'src/',
        src: ['*.js', '**/*.html'],
        dest: 'public/'
      }
    ]
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: ['public']
      },
      dist: {
        src: ['public']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      dist: {
        files: {
          'public/js/app.js': ['src/js/*.js'],
          'public/js/directives/directives.js': ['src/js/directives/**/*.js'],
          'public/js/models.js': ['src/js/models/*.js'],
          'public/js/controllers.js': ['src/js/controllers/*.js'],
          'public/js/services.js': ['src/js/services/*.js']
        }
      }
    },
    concat: {
      build: {
        files: {
          'public/js/app.js': ['src/js/*.js'],
          'public/js/directives/directives.js': ['src/js/directives/**/*.js'],
          'public/js/models.js': ['src/js/models/*.js'],
          'public/js/controllers.js': ['src/js/controllers/*.js'],
          'public/js/services.js': ['src/js/services/*.js'],
          'public/css/build.css': ['src/css/*.css']
        }
      },
      dist: {
        'public/css/build.css': ['src/css/*.css']
      }
    },
    copy: {
      build: {
        files: copyConfig.files
      },
      dist: {
        files: copyConfig.files
      }
    },
    watch: {
      scripts: {
        files: ['src/**'],
        tasks: ['clean:build', 'copy:build', 'concat:build'],
        options: {
          spawn: false,
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('build', ['clean:build', 'copy:build', 'concat:build']);
  grunt.registerTask('dist', ['clean:dist', 'copy:dist', 'concat:dist', 'uglify:dist']);

};