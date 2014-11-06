'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.log(chalk.magenta(
        'Out of the box I include Sass, jQuery, Require.js and a ' +
        'Gruntfile.js to build your app.'
      ));
    }

    var nodeIncluded = function (answers) {
      return answers && answers.features &&
        answers.features.indexOf('includeNode') !== -1;
    };

    var prompts = [{
      name: 'host',
      message: 'What hostname would you like to use?',
      default: 'localhost'
    }, {
      name: 'port',
      message: 'What port would you like to use?',
      default: '9001'
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
    }, {
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Node.js server (to work with front-end without IIS)',
        value: 'includeNode',
        checked: false
      }]
    }, {
      when: nodeIncluded,
      name: 'nodeStartPath',
      message: 'Start path for Node.js server?',
      default: '/html/index.html'
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.projName = path.basename(process.cwd());
      this.host = answers.host;
      this.port = answers.port;
      this.cssDir = answers.cssDir;
      this.sassDir = answers.sassDir;
      this.jsDir = answers.jsDir;
      this.jsLibDir = answers.jsLibDir;
      this.bowerDir = answers.bowerDir;
      this.imgDir = answers.imgDir;
      this.fontsDir = answers.fontsDir;
      this.vsVer = answers.vsVer;
      this.distDir = 'dist';

      this.includeNode = hasFeature('includeNode');

      if (this.includeNode) {
        this.nodeStartPath = answers.nodeStartPath;

        if (!this.nodeStartPath.indexOf('/') == 0) {
          this.nodeStartPath = '/' + this.nodeStartPath;
        }
      }

      done();
    }.bind(this));
  },

  projectfiles: function () {

  },

  configs: function() {
    this._copy('editorconfig', '.editorconfig', /*dev*/ true);
    this._copy('jshintrc', '.jshintrc', /*dev*/ true);
    this._template('bowerrc', '.bowerrc', /*dev*/ true);
    this._template('_bower.json', 'bower.json', /*dev*/ true);
    this._template('_package.json', 'package.json', /*dev*/ true);
    this._template('Gruntfile.js', 'Gruntfile.js', /*dev*/ true);
    this._template('Yeoman.Deploy.targets', 'Properties/Yeoman/Yeoman.Deploy.targets', /*dev*/ true);
  },

  app: function () {
    // js
    this._copy('config.js', this.jsDir + '/config.js');
    this._copy('main.js', this.jsDir + '/main.js');

    // css
    var siteCssExists = fs.existsSync(this.cssDir + '/site.css');
    if (siteCssExists) {
      var siteCss = this.readFileAsString(this.cssDir + '/site.css');
      this._create(this.sassDir + '/site.scss', siteCss);
    } else {
      this._copy('site.scss', this.sassDir + '/site.scss');
    }
  },

  refs: function() {
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
        '    <script>require([\'/' + this.jsDir + '/config.js\'], function(){require([\'main\']);});</script>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
    }

    // comment all bundle refs
    layoutHtml = layoutHtml.replace(/(@\*\s*)?(@Scripts\.Render\(.+\)|@Styles\.Render\(.+\))(\s*\*@)?/g, '@\*$2\*@');

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

  csproj: function () {
    if (this._addedFiles.length == 0) {
      return;
    }

    var proj = this.readFileAsString(this.projName + '.csproj');
    var contentElems = [];
    var filesXml = '';

    this._addedFiles.forEach(function (file) {
      contentElems.push('    <' + (file.dev ? 'None' : 'Content') + ' Include="' + file.path.replace(/\//g, '\\') + '" />\r\n');
    });

    contentElems.forEach(function (elem) {
      proj = proj.replace(elem, '');
      filesXml += elem;
    });

    proj = proj.replace('  <ItemGroup>\r\n  </ItemGroup>\r\n', '');
    proj = proj.replace('</ItemGroup>', '</ItemGroup>\r\n  <ItemGroup>\r\n' + filesXml + '  </ItemGroup>');

    this._addedFiles.forEach(function (file) {
      if (file.path.indexOf('.targets') != -1) {
        var importEl = '<Import Project="' + file.path.replace(/\//g, '\\') + '" />';
        if (proj.indexOf(importEl) == -1) {
          proj = proj.replace('</ProjectExtensions>', '</ProjectExtensions>\r\n  ' + importEl);
        }
      }
    });

    this.write(this.projName + '.csproj', proj);
  },

  install: function () {
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  },

  // helpers

  _addedFiles: [],

  _copy: function (from, to, dev) {
    to = to || from;
    this._addedFiles.push({
      path: to,
      dev: Boolean(dev)
    });
    this.copy(from, to);
  },

  _template: function (from, to, dev) {
    to = to || from;
    this._addedFiles.push({
      path: to,
      dev: Boolean(dev)
    });
    this.template(from, to);
  },

  _create: function (path, content, dev) {
    this._addedFiles.push({
      path: path,
      dev: Boolean(dev)
    });
    this.write(path, content);
  }
});