'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var AspnetPowermvcGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = yeoman.file.readJSON(path.join(__dirname, '../package.json'));

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.npmInstall();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    console.log(this.yeoman);

    // description of the generator
    console.log(chalk.magenta('I\'m going to show you the power of Grunt, Bower and Compass. Prepare yourself!'));

    var prompts = [{
      name: 'host',
      message: 'What hostname would you like to use?',
      default: 'localhost'
    }, {
      name: 'port',
      message: 'What port would you like to use?',
      default: '9000'
    }, {
      name: 'cssDir',
      message: 'Path to css files?',
      default: 'Content'
    }, {
      name: 'sassDir',
      message: 'Path to sass files?',
      default: 'Content/sass'
    }, {
      name: 'jsDir',
      message: 'Path to js files?',
      default: 'Scripts'
    }, {
      name: 'jsLibDir',
      message: 'Path to external js files?',
      default: 'Scripts'
    }, {
      name: 'bowerDir',
      message: 'Path to Bower components?',
      default: 'Scripts/bower_components'
    }, {
      name: 'imgDir',
      message: 'Path to images?',
      default: 'Content/images'
    }, {
      name: 'fontsDir',
      message: 'Path to fonts?',
      default: 'fonts'
    }, {
      name: 'vsVer',
      message: 'Your Visual Studio version?',
      default: '12.0'
    }];

    this.prompt(prompts, function (props) {
      this.projName = path.basename(process.cwd());
      this.host = props.host;
      this.port = props.port;
      this.cssDir = props.cssDir;
      this.sassDir = props.sassDir;
      this.jsDir = props.jsDir;
      this.jsLibDir = props.jsLibDir;
      this.bowerDir = props.bowerDir;
      this.imgDir = props.imgDir;
      this.fontsDir = props.fontsDir;
      this.vsVer = props.vsVer;

      done();
    }.bind(this));
  },

  app: function () {
    this.template('Gruntfile.js');
    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');

    // insert livereload ref into _Layout.cshtml
    var layoutHtml = this.readFileAsString('Views/Shared/_Layout.cshtml');
    if (layoutHtml.indexOf('//localhost:35729/livereload.js') == -1) {
      layoutHtml = layoutHtml.replace('</body>', '    <!-- build:remove:dist -->\r\n    <script src="//localhost:35729/livereload.js"></script>\r\n    <!-- /build -->\r\n</body>');
      this.write('Views/Shared/_Layout.cshtml', layoutHtml);
    }
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.template('bowerrc', '.bowerrc');
  },

  install: function() {
    if (this.options['skip-install']) {
      return;
    }

    var done = this.async();
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install'],
      callback: done
    });
  }
});

module.exports = AspnetPowermvcGenerator;