module.exports = function (grunt) {


  var copyConfig = {
    files: [
      //===LIBRARIES ===================
      {
        expand: true,
        cwd: 'node_modules/jquery/dist',
        src: 'jquery.min.js',
        dest: '<%= distdir %>/js/lib/jquery'
      },
      {
        expand: true,
        cwd: 'node_modules/x2js',
        src: 'x2js.js',
        dest: '<%= distdir %>/js/lib/x2js'
      },
      {
        expand: true,
        cwd: 'node_modules/angular',
        src: 'angular.min.js',
        dest: '<%= distdir %>/js/lib/angular'
      },
      {
        expand: true,
        cwd: 'node_modules/angular-route',
        src: 'angular-route.min.js',
        dest: '<%= distdir %>/js/lib/angular-route'
      },
      {
        expand: true,
        cwd: 'node_modules/bootstrap/dist',
        src: ['**'],
        dest: '<%= distdir %>/bootstrap'
      },
      {
        expand: true,
        cwd: 'node_modules/d3/build',
        src: ['d3.min.js'],
        dest: '<%= distdir %>/js/lib/d3'
      },
      //======================================
      // Views
      {
        expand: true,
        cwd: 'src/',
        src: ['views/*.html'],
        dest: '<%= distdir %>/'
      },
      // Maps 
      {
        expand: true,
        cwd: 'src/',
        src: ['js/maps/**/*.json'],
        dest: '<%= distdir %>/'
      },
      // Views with subfolders and js 
      {
        expand: true,
        cwd: 'src/',
        src: ['*.js', '**/*.html'],
        dest: '<%= distdir %>/'
      }
    ]
  };

  // Project configuration.
  grunt.initConfig({
    distdir: 'public',
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: ['<%= distdir %>']
      },
      dist: {
        src: ['<%= distdir %>']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      dist: {
        files: {
          '<%= distdir %>/js/app.js': ['src/js/*.js'],
          '<%= distdir %>/js/directives/directives.js': ['src/js/directives/**/*.js'],
          '<%= distdir %>/js/models.js': ['src/js/models/*.js'],
          '<%= distdir %>/js/controllers.js': ['src/js/controllers/*.js'],
          '<%= distdir %>/js/services.js': ['src/js/services/*.js']
        }
      }
    },
    concat: {
      build: {
        files: {
          '<%= distdir %>/js/app.js': ['src/js/*.js'],
          '<%= distdir %>/js/directives/directives.js': ['src/js/directives/**/*.js'],
          '<%= distdir %>/js/models.js': ['src/js/models/*.js'],
          '<%= distdir %>/js/controllers.js': ['src/js/controllers/*.js'],
          '<%= distdir %>/js/services.js': ['src/js/services/*.js'],
        }
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
    less : {
      build: {
        files : {
          '<%= distdir %>/css/style.css' : ['src/less/*.less']
        }
      },
      dist: {
         files : {
          '<%= distdir %>/css/style.css' : ['src/less/*.less']
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/**'],
        tasks: ['clean:build', 'copy:build', 'concat:build', 'less:build'],
        options: {
          spawn: false,
        }
      }
    }
  });

  //Load Tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-eslint');
  

  // Default task(s).
  grunt.registerTask('build', ['clean:build', 'copy:build', 'concat:build', 'less:build']);
  grunt.registerTask('dist', ['clean:dist', 'copy:dist', 'uglify:dist', 'less:dist']);

};