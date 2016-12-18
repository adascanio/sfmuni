module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean : {
      build : {
        src : ['public']
      }
    },
    concat : {
      build: {
        files : {
          'public/css/build.css' : ['src/css/*.css'],
          'public/js/models.js' : ['src/js/models/*.js'],
        }
      },
    },
    copy: {
      build: {
        files: [
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
          { 
            expand: true, 
            cwd: 'src/', 
            src: ['**', '!css/*.css'],
            dest: 'public/' 
          }
        ]
      }
    },
    watch : {
      scripts: {
        files: ['src/**'],
        tasks: ['clean:build','copy:build', 'concat:build'],
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
  
  // Default task(s).
  grunt.registerTask('build', ['clean:build','copy:build', 'concat:build']);

};