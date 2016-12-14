module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['src/js/controllers/*.js'],
        dest: 'public/js/controllers.js'
      }
    },
    clean : {
      build : {
        src : ['public']
      }
    },
    copy: {
      build: {
        files: [
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
            src: ['**'], 
            dest: 'public/' 
          }
        ]
      }
    },
    watch : {
      scripts: {
        files: ['src/**'],
        tasks: ['clean:build', 'copy:build'],
        options: {
          spawn: false,
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // Default task(s).
  grunt.registerTask('build', ['clean:build','copy:build']);

};