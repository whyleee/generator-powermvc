'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var xmldom = require('xmldom');
var xpath = require('xpath');
var parseUrl = require('url').parse;
var cp = require('child_process');

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
      default: 'bower_components'
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
      default: '/html/index.html'
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.projName = path.basename(process.cwd());

      this._getServerUrl(function(serverUrl, useIisExpress) {
        serverUrl = parseUrl(serverUrl);

        this.host = serverUrl.hostname;
        this.port = serverUrl.port || 80;
        this.urlpath = serverUrl.pathname || '/';
        this.useIisExpress = useIisExpress;

        this.cssDir = answers.cssDir;
        this.sassDir = answers.sassDir;
        this.jsDir = answers.jsDir;
        this.jsLibDir = answers.jsLibDir;
        this.bowerDir = answers.bowerDir;
        this.imgDir = answers.imgDir;
        this.fontsDir = answers.fontsDir;
        this.livereloadPort = 35729;

        this.includeNode = hasFeature('includeNode');

        if (this.includeNode) {
          this.htmlDir = answers.htmlDir;
          this.nodeStartPath = answers.nodeStartPath;

          if (!this.nodeStartPath.indexOf('/') == 0) {
            this.nodeStartPath = '/' + this.nodeStartPath;
          }
        }

        // dist site
        this.distDir = 'dist';
        this.distHost = 'localhost';
        this.distPort = 13000;

        var distSiteName = this.projName + ':dist';
        var distSiteUrl = 'http://' + this.distHost + ':' + this.distPort;
        var distSitePath = path.resolve(this.distDir);
        this._createIisExpressSite(distSiteName, distSiteUrl, distSitePath, function() {
          done();
        });
      }.bind(this));
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
        '    <!-- build:css /' + this.cssDir + '/main.css -->\r\n' +
        '    <link rel="stylesheet" href="/' + this.cssDir + '/site.css"/>\r\n' +
        '    <!-- endbuild -->\r\n'
      );
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
    }

    // comment all bundle refs
    layoutHtml = layoutHtml.replace(/(@\*\s*)?(@Scripts\.Render\(.+\)|@Styles\.Render\(.+\))(\s*\*@)?/g, '@\*$2\*@');

    // insert livereload ref
    if (layoutHtml.indexOf('//localhost:' + this.livereloadPort + '/livereload.js') == -1) {
      layoutHtml = this.append(layoutHtml, 'body',
        '    <!-- build:remove:dist -->\r\n' +
        '    <script src="//localhost:' + this.livereloadPort + '/livereload.js"></script>\r\n' +
        '    <!-- endbuild -->\r\n'
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

  webconfig: function () {
    // add mime types for scss/sass files for css source maps support in browsers
    this._addToConfig('/configuration/system.webServer/staticContent', [
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
          this.env.adapter.log('Running ' + chalk.yellow.bold('npm install') + '...');
        }
        this.npmInstall();
      } else if (!skipMessage) {
        this.env.adapter.log('Done. Run ' + chalk.yellow.bold('npm install') + ' to install the required dependencies.');
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
  },

  // async
  _getServerUrl: function(cb) {
    var proj = this.readFileAsString(this.projName + '.csproj');
    var doc = new xmldom.DOMParser().parseFromString(proj);
    var select = xpath.useNamespaces({'msbuild': 'http://schemas.microsoft.com/developer/msbuild/2003'});

    var useIisEl = select('//msbuild:UseIIS/text()', doc)[0];
    var useIis = useIisEl && useIisEl.data && useIisEl.data.toUpperCase() == 'TRUE';
    var urlNode;

    if (useIis) {
      urlNode = select('//msbuild:IISUrl/text()', doc)[0];
    } else {
      urlNode = select('//msbuild:CustomServerUrl/text()', doc)[0];
    }

    var serverUrl = urlNode ? urlNode.data : null;

    var useIisExpressEl = select('//msbuild:UseIISExpress/text()', doc)[0];
    var useIisExpress = useIisExpressEl && useIisExpressEl.data && useIisExpressEl.data.toUpperCase() == 'TRUE';

    // if iss express: create site if not exists
    if (useIis && useIisExpress) {
      var siteUrl = serverUrl.replace(/\/$/, '');
      var siteName = this.projName;
      var sitePath = process.cwd();

      this._createIisExpressSite(siteName, siteUrl, sitePath, function() {
        cb(serverUrl, useIisExpress);
      });
    } else {
      cb(serverUrl, useIisExpress);
    };
  },

  _createIisExpressSite: function(siteName, siteUrl, physicalPath, cb) {
    var iisCmdPath = 'c:/program files/iis express/appcmd.exe';
    var yo = this;

    cp.execFile(iisCmdPath, ['list', 'site', siteUrl], {}, function(err, stdout, stderr) {
      if (!err) {
        cb(); // already created
      } else {
        cp.execFile(iisCmdPath, ['add', 'site',
            '/name:' + siteName,
            '/bindings:' + siteUrl,
            '/physicalPath:' + physicalPath
          ], {},
          function(err, stdout, stderr) {
            if (!err) {
              yo.log(chalk.green('created') + ' "' + siteName + '" IIS Express site');
            } else {
              yo.log(chalk.yellow('error') + ' creating "' + siteName + '" IIS Express site');
            }
            cb();
          }
        );
      }
    });
  },

  _addToConfig: function(parent, elems) {
    var changed = 0;
    var configXml = this.readFileAsString('Web.config');
    var configDom = new xmldom.DOMParser().parseFromString(configXml);

    changed += this._safeAddXmlConfigNodes(configDom, parent, elems);

    if (changed > 0) {
      this._safeXmlWrite('Web.config', configDom, configXml);
    }
  },

  _fixDocIndent: function(doc, xml) {
    var rootComment = doc.documentElement.previousSibling;

    if (rootComment && rootComment.nodeType == 8 /* COMMENT_NODE */) {
      doc.insertBefore(doc.createTextNode('\r\n'), rootComment);
      doc.insertBefore(doc.createTextNode('\r\n'), doc.documentElement);
    }
  },

  _safeXmlWrite: function(path, doc, xml) {
      this._fixDocIndent(doc, xml);

      var xmlSerializer = new xmldom.XMLSerializer();
      var updatedXml = xmlSerializer.serializeToString(doc);

      // Fix serialization: use ' />' instead of '/>' if target config uses that style
      var noSpaceClosesCount = (xml.match(/[^ ]\/>/g) || []).length;
      var oneSpaceClosesCount = (xml.match(/ \/>/g) || []).length;

      if (oneSpaceClosesCount > noSpaceClosesCount) {
        updatedXml = updatedXml.replace(/([^ ])\/>/g, '$1 />');
      }
      
      this.write(path, updatedXml);
  },

  _safeAddXmlConfigNodes: function(doc, parent, elems) {
    var parentNode = doc.documentElement;
    var node = null;
    var indent = 1;

    // get all required parent node names
    var nodeNames = parent.replace('/' + parentNode.nodeName + '/', '').split('/');

    // insert missing parent nodes
    for (var i = 0; i < nodeNames.length; ++i) {
      var nodeName = nodeNames[i];
      node = parentNode.getElementsByTagName(nodeName)[0];

      if (!node) {
        node = doc.createElement(nodeName);
        insertAlphabetically(parentNode, [node], indent, /*last*/false);
      }

      parentNode = node;
      indent++;
    }

    var nodes = [];

    // create all missing nodes to be added
    for (var i = 0; i < elems.length; ++i) {
      var elem = elems[i];
      var existingNodes = parentNode.getElementsByTagName(elem.name);
      var nodeExists = Array.prototype.slice.call(existingNodes)
        .filter(function(node) { return sameAttrs(node, elem.attrs); })
        .length > 0;

      if (nodeExists) {
        continue;
      }

      var node = doc.createElement(elem.name);

      for (var attr in elem.attrs) {
        node.setAttribute(attr, elem.attrs[attr]);
      }

      nodes.push(node);
    }

    // add missing nodes
    if (nodes.length > 0) {
      insertAlphabetically(parentNode, nodes, indent, /*last*/true);
    }

    return nodes.length;
    // end

    function sameAttrs(node, attrs) {
      for (var attr in attrs) {
        if (node.getAttribute(attr) != attrs[attr]) {
          return false;
        }
      }

      return true;
    }

    function insertAlphabetically(parentNode, nodes, indent, isLast) {
      var inserted = false;

      // always insert last node to the end
      if (!isLast) {
        var siblings = parentNode.childNodes;
        var nodeName = nodes[0].nodeName;

        // if 'system.*' node: place together with other 'system.*' nodes
        var isSystemNode = function(node) {
          return node.nodeName.indexOf('system.') === 0;
        };
        var isSystemNodeToInsert = isSystemNode(nodes[0]);

        if (isSystemNodeToInsert) {
          var systems = [];

          for (var i = 0; i < siblings.length; ++i) {
            if (siblings[i].nodeName.indexOf('system.') === 0) {
              systems.push(siblings[i]);
            }
          }

          if (systems.length > 0) {
            siblings = systems;
          }
        }

        // find a place alphabetically and insert nodes
        for (var i = 0; i < siblings.length; ++i) {
          var isLastSibling = i == siblings.length - 1;
          var isLastSystemSibling = isLastSibling && isSystemNodeToInsert;
          var isNextSiblingNextAlphabetically = !isLastSibling
            && siblings[i + 1].nodeName.localeCompare(nodeName) > 0;

          if (isLastSystemSibling || isNextSiblingNextAlphabetically) {
            var beforeNode = siblings[i].nextSibling;

            // if has next sibling - place before indent (for correct formatting)
            if (beforeNode && beforeNode.nodeType == 3 /* TEXT_NODE */) {
              beforeNode = beforeNode.nextSibling;
            }

            insertNodes(parentNode, nodes, indent, isLast, beforeNode);
            inserted = true;
            break;
          }
        }
      }

      // if wasn't inserted yet: just add to the end
      if (!inserted) {
        insertNodes(parentNode, nodes, indent, isLast);
      }
    }

    function insertNodes(parentNode, nodes, indent, isLast, beforeNode) {
      // create indents
      var indentBefore = doc.createTextNode(Array(indent + 1).join('  '));
      var indentInner = doc.createTextNode('\r\n');
      var indentAfter = doc.createTextNode('\r\n' + Array(indent).join('  '));
      var createSiblingIndentNode = function() {
        return doc.createTextNode('\r\n' + Array(indent + 1).join('  '));
      }

      if (beforeNode) {
        // insert before with fixed indents
        parentNode.insertBefore(indentAfter, beforeNode);
        var siblingBeforeNode = indentAfter;

        for (var i = nodes.length - 1; i >= 0; --i) {
          parentNode.insertBefore(nodes[i], siblingBeforeNode);
          siblingBeforeNode = nodes[i];

          if (i > 0) {
            var siblingIndentNode = createSiblingIndentNode();
            parentNode.insertBefore(siblingIndentNode, siblingBeforeNode);
            siblingBeforeNode = siblingIndentNode;
          }
        }
        
        parentNode.insertBefore(indentBefore, siblingBeforeNode);
      } else {
        // add to the end with fixed indents
        parentNode.appendChild(indentBefore);

        for (var i = 0; i < nodes.length; ++i) {
          parentNode.appendChild(nodes[i]);

          if (i < nodes.length - 1) {
            parentNode.appendChild(createSiblingIndentNode());
          }
        }

        parentNode.appendChild(indentAfter);
      }

      // if has prev sibling - decrease indent
      var prevSibling = indentBefore.previousSibling;

      if (prevSibling && prevSibling.nodeType == 3 /* TEXT_NODE */
        && prevSibling.nodeValue.indexOf('  ') !== -1) {
        indentBefore.deleteData(0, prevSibling.nodeValue.replace('\r\n', '').length);
      }

      // if has next sibling - increase indent
      if (indentAfter.nextSibling) {
        indentAfter.appendData('  ');
      }

      // if has children - add inner indent
      if (!isLast) {
        nodes[0].appendChild(indentInner);
      }
    }
  }
});