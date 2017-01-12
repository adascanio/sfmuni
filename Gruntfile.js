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
        src: ['*.js', '**/*.html','!**/*.tpl.html'],
        dest: '<%= distdir %>/'
      }
    ]
  };

  // Project configuration.
  grunt.initConfig({
    distdir: 'public',
    src : {
      js : ['src/js/*.js'],
      directives : ['src/js/directives/**/*.js'],
      models : ['src/js/models/*.js'],
      controllers: ['src/js/controllers/*.js'],
      services: ['src/js/services/*.js'],
      less: ['src/less/*.less']
    },
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
          '<%= distdir %>/js/app.js': ['<%= src.js %>'],
          '<%= distdir %>/js/directives/directives.js': ['<%= src.directives %>'],
          '<%= distdir %>/js/models.js': ['<%= src.models %>'],
          '<%= distdir %>/js/controllers.js': ['<%= src.controllers %>'],
          '<%= distdir %>/js/services.js': ['<%= src.services %>'],
          '<%= distdir %>/templates/templates_cache.js': ['<%= distdir %>/templates/*.js']
        }
      }
    },
    concat: {
      build: {
        files: {
          '<%= distdir %>/js/app.js': ['<%= src.js %>'],
          '<%= distdir %>/js/directives/directives.js': ['<%= src.directives %>'],
          '<%= distdir %>/js/models.js': ['<%= src.models %>'],
          '<%= distdir %>/js/controllers.js': ['<%= src.controllers %>'],
          '<%= distdir %>/js/services.js': ['<%= src.services %>'],
          '<%= distdir %>/templates/templates_cache.js': ['<%= distdir %>/templates/*.js']
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
          '<%= distdir %>/css/style.css' : ['<%= src.less %>']
        }
      },
      dist: {
         files : {
          '<%= distdir %>/css/style.css' : ['<%= src.less %>']
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/**'],
        tasks: ['clean:build','html2js:directives','html2js:views', 'copy:build', 'concat:build', 'less:build'],
        options: {
          spawn: false,
        }
      }
    },
    eslint: {
      build :{
        options: {
            configFile: '.eslintrc.js'
        },
        src: ['src/**/*.js', '<%= distdir %>/js/directives/**/*.js','<%= distdir %>/js/*.js']
      },
      dist :{
        options: {
            configFile: '.eslintrc.js'
        },
        src: ['src/**/*.js', '<%= distdir %>/js/directives/**/*.js','<%= distdir %>/js/*.js']
      }
    },
    html2js: {
      htmlmin: {
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
      },
      directives: {
        options: {
          base: 'src/js/directives'
        },
        src: ['src/js/directives/**/*.tpl.html'],
        dest: '<%= distdir %>/templates/directives.js',
        module: 'templates.directives'
      },
      views: {
        options: {
          base: 'src/'
        },
        src: ['src/views/*.tpl.html'],
        dest: '<%= distdir %>/templates/views.js',
        module: 'templates.views'
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
  grunt.loadNpmTasks('grunt-html2js');
  

  // Default task(s).
  grunt.registerTask('build', ['clean:build','html2js:directives','html2js:views', 'copy:build', 'concat:build', 'eslint:build','less:build']);
  grunt.registerTask('dist', ['clean:dist','html2js:directives','html2js:views', 'copy:dist', 'uglify:dist', 'less:dist']);

};