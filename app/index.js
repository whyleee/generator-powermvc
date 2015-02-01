'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var parseUrl = require('url').parse;
var vs = require('./lib/vs.js');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.pkg = require('../package.json');
  },

  dirCheck: function () {
    var dirHint = 'This generator is meant be used together with ' +
      'ASP.NET MVC projects. Go to your MVC project directory and ' +
      'run ' + chalk.yellow.bold('yo powermvc') + ' again.';
    var dirFiles = fs.readdirSync(process.cwd());

    if (dirFiles.length == 0) {
      this.log(chalk.red('Directory is empty.\n') + dirHint);
      process.exit(1);
    }

    var hasWebConfig = dirFiles.some(function(file) {
      return file.toLowerCase() == 'web.config';
    });

    if (!hasWebConfig) {
      this.log(chalk.red('Web.config is missing.\n') +
        'Looks like you\'re not inside ASP.NET MVC project directory.\n' +
        dirHint
      );
      process.exit(1);
    }
  },

  askFor: function () {
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
      name: 'cssDir',
      message: 'Path to css files?',
      default: 'Content'
    }, {
      name: 'sassDir',
      message: 'Path to sass files?',
      default: 'sass'
    }, {
      name: 'jsDir',
      message: 'Path to js files?',
      default: 'Scripts'
    }, {
      name: 'bowerDir',
      message: 'Path to Bower components?',
      default: 'bower_components'
    }, {
      name: 'jsLibDir',
      message: 'Path to third-party js files?',
      default: 'Scripts'
    }, {
      name: 'imgDir',
      message: 'Path to images?',
      default: 'Content/images'
    }, {
      name: 'fontsDir',
      message: 'Path to fonts?',
      default: 'fonts'
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
      name: 'htmlDir',
      message: 'Path to html?',
      default: 'html'
    }, {
      when: nodeIncluded,
      name: 'nodeStartPath',
      message: 'Start path for Node.js server?',
      default: function(answers) {
        return answers.htmlDir + '/index.html';
      }
    }];

    var done = this.async();
    this.prompt(prompts, function (answers) {
      this.answers = answers;
      done();
    }.bind(this));
  },

  vsVer: function() {
    var done = this.async();
    vs.getVsVer(function(vsVer) {
      this.vsVer = vsVer;
      done();
    }.bind(this));
  },

  settings: function() {
    // project settings
    this.projName = path.basename(process.cwd());
    this.serverInfo = vs.getServerInfo(this.projName + '.csproj');
    this.layoutPath = vs.getLayoutPath();

    // paths
    this.cssDir = this.answers.cssDir;
    this.sassDir = this.answers.sassDir;
    this.jsDir = this.answers.jsDir;
    this.jsLibDir = this.answers.jsLibDir;
    this.bowerDir = this.answers.bowerDir;
    this.imgDir = this.answers.imgDir;
    this.fontsDir = this.answers.fontsDir;

    this.bootstrapCssExists = fs.existsSync(this.cssDir + '/bootstrap.css');
    this.cssName = fs.existsSync(this.cssDir + '/main.css') ? 'main' :
                   fs.existsSync(this.cssDir + '/site.css') ? 'site' : null;

    // server settings
    var parsedUrl = parseUrl(this.serverInfo.url);
    this.host = parsedUrl.hostname;
    this.port = parsedUrl.port || 80;
    this.urlpath = parsedUrl.pathname || '/';
    this.useIisExpress = this.serverInfo.useIisExpress;
    this.livereloadPort = 35729;

    // node server settings
    this.includeNode = this._hasFeature('includeNode');

    if (this.includeNode) {
      this.htmlDir = this.answers.htmlDir;
      this.nodeStartPath = this.answers.nodeStartPath;

      if (!this.nodeStartPath.indexOf('/') == 0) {
        this.nodeStartPath = '/' + this.nodeStartPath;
      }
    }

    // dist site
    this.distDir = 'dist';
    this.distHost = 'localhost';
    this.distPort = 13000 + Math.floor(Math.random() * 1000);
  },

  devSite: function() {
    // if iss express: create site if not exists
    if (this.serverInfo.useIis && this.serverInfo.useIisExpress) {
      var siteName = this.projName;
      var siteUrl = this.serverInfo.url.replace(/\/$/, '');
      var sitePath = process.cwd();

      var done = this.async();
      vs.createIisExpressSite(siteName, siteUrl, sitePath, function(err, created) {
        this._logIisSite(siteName, err, created);
        done();
      }.bind(this));
    }
  },

  distSite: function() {
    // create dist site in IIS Express if not exists
    var distSiteName = this.projName + ':dist';
    var distSiteUrl = 'http://' + this.distHost + ':' + this.distPort;
    var distSitePath = path.resolve(this.distDir);

    var done = this.async();
    vs.createIisExpressSite(distSiteName, distSiteUrl, distSitePath, function(err, created) {
      this._logIisSite(distSiteName, err, created);
      done();
    }.bind(this));
  },

  configs: function() {
    this._copy('editorconfig', '.editorconfig', /*dev*/ true);
    this._copy('jshintrc', '.jshintrc', /*dev*/ true);
    this._template('bowerrc', '.bowerrc', /*dev*/ true);
    this._template('_bower.json', 'bower.json', /*dev*/ true);
    this._template('_package.json', 'package.json', /*dev*/ true);
    this._template('Gruntfile.js', 'Gruntfile.js', /*dev*/ true);
    this._template('Yeoman.Deploy.targets', 'Properties/Yeoman/Yeoman.Deploy.targets', /*dev*/ true);
    this._template('Dist.pubxml', 'Properties/PublishProfiles/Dist.pubxml', /*dev*/ true);
  },

  app: function () {
    // js
    this._copy('config.js', this.jsDir + '/config.js');
    this._copy('main.js', this.jsDir + '/main.js');

    // css
    if (this.cssName) {
      var mainCss = this.readFileAsString(this.cssDir + '/' + this.cssName + '.css');
      this._create(this.sassDir + '/' + this.cssName + '.scss', mainCss, /*dev*/ true);
    } else {
      this._copy('main.scss', this.sassDir + '/main.scss', /*dev*/ true);
      this.cssName = 'main';
    }

    if (this.includeNode) {
      this._template('index.html', this.nodeStartPath.slice(1));
    }
  },

  refs: function() {
    var layoutHtml = this.readFileAsString(this.layoutPath);

    // add css refs
    if (layoutHtml.indexOf('build:css') == -1) {
      layoutHtml = this.append(layoutHtml, 'head',
        '    <!-- build:css /' + this.cssDir + '/main.css -->\r\n' +
        (this.bootstrapCssExists ?
        '    <link rel="stylesheet" href="/' + this.cssDir + '/bootstrap.css"/>\r\n'
        : '') +
        '    <link rel="stylesheet" href="/' + this.cssDir + '/' + this.cssName + '.css"/>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
    } else {
      this.log('usemin css blocks found, skipping... (remove to override)');
    }

    // add js refs
    if (layoutHtml.indexOf('build:js') == -1) {
      layoutHtml = this.append(layoutHtml, 'body',
        '    <!-- build:js /' + this.jsDir + '/almond.js -->\r\n' +
        '    <script src="/' + this.bowerDir + '/requirejs/require.js"></script>\r\n' +
        '    <!-- endbuild -->\r\n' +
        '    <!-- build:cdnfallback /' + this.jsDir + '/jquery.js -->\r\n' +
        '    <script src="/' + this.bowerDir + '/jquery/dist/jquery.js"></script>\r\n' +
        '    <!-- endbuild -->\r\n' +
        '    <!-- build:js /' + this.jsDir + '/main.js -->\r\n' +
        '    <script src="/' + this.jsDir + '/config.js"></script>\r\n' +
        '    <script>require([\'main\']);</script>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
    } else {
      this.log('usemin js blocks found, skipping... (remove to override)');
    }

    // comment all bundle refs
    layoutHtml = layoutHtml.replace(/(@\*\s*)?(@Scripts\.Render(Format)?\(.+\)|@Styles\.Render(Format)?\(.+\))(\s*\*@)?/g, '@\*$2\*@');

    // insert livereload ref
    if (layoutHtml.indexOf('//localhost:' + this.livereloadPort + '/livereload.js') == -1) {
      layoutHtml = this.append(layoutHtml, 'body',
        '    <!-- build:remove:dist -->\r\n' +
        '    <script src="//localhost:' + this.livereloadPort + '/livereload.js"></script>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
    } else {
      this.log('livereload.js ref found, skipping... (remove to override)');
    }

    // move 'scripts' mvc section to the bottom
    var mvcScriptsSection = layoutHtml.match(/[ \t]*(@RenderSection\("scripts".+\))[ \t]*\r\n/g);

    if (mvcScriptsSection) {
      layoutHtml = layoutHtml.replace(mvcScriptsSection[0], '');
      layoutHtml = this.append(layoutHtml, 'body', mvcScriptsSection[0]);
    }

    this.write(this.layoutPath, layoutHtml);
  },

  csproj: function () {
    vs.addToCsproj(this.projName + '.csproj', this._addedFiles);
  },

  webconfig: function () {
    // add mime types for scss/sass files for css source maps support in browsers
    vs.addToConfig('/configuration/system.webServer/staticContent', [
      {name: 'remove', attrs: {fileExtension: '.scss'}},
      {name: 'mimeMap', attrs: {fileExtension: '.scss', mimeType: 'text/x-scss'}},
      {name: 'remove', attrs: {fileExtension: '.sass'}},
      {name: 'mimeMap', attrs: {fileExtension: '.sass', mimeType: 'text/x-sass'}}
    ]);
  },

  install: function () {
    this.on('end', function () {
      var skipMessage = this.options['skip-install-message'];
      if (!this.options['skip-install']) {
        if (!skipMessage) {
          this.log('Running ' + chalk.yellow.bold('npm install') + '...');
        }
        this.npmInstall(null, null, function() {
          this.spawnCommand('npm', ['run', 'bower-requirejs']);
        }.bind(this));
      } else if (!skipMessage) {
        this.log('Done. Run ' + chalk.yellow.bold('npm install') + ' to install the required dependencies.');
      }
    });
  },

  // helpers

  _addedFiles: [], // files to add to csproj

  // copy file and add to csproj
  _copy: function (from, to, dev) {
    to = to || from;
    this._addedFiles.push({
      path: to,
      dev: Boolean(dev)
    });
    this.copy(from, to);
  },

  // template file and add to csproj
  _template: function (from, to, dev) {
    to = to || from;
    this._addedFiles.push({
      path: to,
      dev: Boolean(dev)
    });
    this.template(from, to);
  },

  // create file and add to csproj
  _create: function (path, content, dev) {
    this._addedFiles.push({
      path: path,
      dev: Boolean(dev)
    });
    this.write(path, content);
  },

  _hasFeature: function (feat) {
    return this.answers.features && this.answers.features.indexOf(feat) !== -1;
  },

  _logIisSite: function (siteName, err, created) {
    if (err) {
      this.log(chalk.yellow('error') + ' creating "' + siteName + '" IIS Express site');
    } else if (created) {
      this.log(chalk.green('created') + ' "' + siteName + '" IIS Express site');
    }
  },
});