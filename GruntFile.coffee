module.exports = (grunt) ->
  grunt.initConfig {
    pkg: grunt.file.readJSON('package.json')
    coffee: {
      compile: {
        options: {
          join: true
          bare: true
        }
        files: {
          'build/jquery.hevent.js': [
            'src/jquery.hevent.coffee'
            'src/jquery.hclass.coffee'
            'src/jquery.htransanimation.coffee'
          ]
        }
      }
    }
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: [
          'components/jquery-pointer-events/src/pointer.js'
          'build/jquery.hevent.js'
        ],
        dest: 'build/jquery.hevent.js'
      }
    }
    uglify: {
      options: {
        mangle: {
          except: ['jQuery']
        }
      }
      lib: {
        files: {
          'build/jquery.hevent.min.js': ['build/jquery.hevent.js']
        }
      }
    }
    stylus: {
      options: {
        compress: false
        urlfunc: 'embedurl'
      }
      hevent: {
        options: {
          paths : ['dist']
          use: [
            require('hstrap')
          ]
        }
        files: {
          'dist/hevent.css': 'dist/hevent.styl'
        }
      }
    }
    copy: {
      font: {
        files: [
          {
            expand: true
            cwd: 'components/hiso-font/font/'
            src: '*'
            dest: 'dist/font'
            filter: 'isFile'
          }
        ]
      }
      jquery: {
        files: {
          'dist/media/jquery.min.js': 'components/jquery/jquery.min.js'
        }
      }
    }
  }

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.registerTask 'help', ->
    grunt.log.writeln 'grunt build :', 'Concact and uglify plugin'
    grunt.log.writeln 'grunt doc :', 'Generate doc css'
    grunt.log.writeln 'grunt assets :', 'Copy assets from components'

  grunt.registerTask 'build', ['coffee:compile', 'concat', 'uglify:lib']
  grunt.registerTask 'doc', ['stylus:hevent']
  grunt.registerTask 'font', ['copy:font', 'copy:jquery']

  grunt.registerTask 'default', ['help']
