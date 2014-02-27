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

    this.copy('main.js', this.jsDir + '/main.js');

    var layoutHtml = this.readFileAsString('Views/Shared/_Layout.cshtml');

    // add css refs
    if (layoutHtml.indexOf('build:css') == -1) {
      layoutHtml = this.append(layoutHtml, 'head',
        '    <!-- build:css /' + this.cssDir + '/min.css -->\r\n' +
        '    <link rel="stylesheet" href="/' + this.cssDir + '/site.css"/>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
    }

    // add js refs
    if (layoutHtml.indexOf('build:js') == -1) {
      layoutHtml = this.append(layoutHtml, 'body',
        '    <!-- build:cdn -->\r\n' +
        '    <!-- build:js /' + this.jsDir + '/min.js -->\r\n' +
        '    <script src="/' + this.bowerDir + '/requirejs/require.js"></script>\r\n' +
        '    <script>require([\'config\'], function(){require([\'main\']);});</script>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
    }

    // remove js bundles
    layoutHtml = layoutHtml.replace('    @Scripts.Render("~/bundles/jquery")\r\n', '');

    // insert livereload ref
    if (layoutHtml.indexOf('//localhost:35729/livereload.js') == -1) {
      layoutHtml = this.append(layoutHtml, 'body',
        '    <!-- build:remove:dist -->\r\n' +
        '    <script src="//localhost:35729/livereload.js"></script>\r\n' +
        '    <!-- /build -->\r\n'
      );
    }

    this.write('Views/Shared/_Layout.cshtml', layoutHtml);
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