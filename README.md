Yeoman PowerMvc generator
=========================

PowerMvc is a [Yeoman](http://yeoman.io/) generator that adds [Grunt](http://gruntjs.com/)-based front-end build stack to your **ASP.NET MVC** projects. Out-of-box it provides support for [Bower](http://bower.io/), [Sass](http://sass-lang.com/), [Require.js](http://requirejs.org/), live reload, CDNs, minification, bundling, source maps and revisioning. It is also integrated with MsBuild and MsDeploy. See the [full list of features](#features) below.

The goal of this generator is to help people getting started with Grunt in MVC projects and to provide a good starting point to make your own front-end setup. Inspired by official [webapp](https://github.com/yeoman/generator-webapp) generator.

 - *NuGet package update (0.5) is coming soon*
 - *ASP.NET vNext support is the goal for the next version*


Getting Started
---------------

You need [Node.js](http://nodejs.org/), `bower`, `grunt` and `yo` installed first.

 - Install the generator: `npm install -g generator-powermvc`
 - Run it in MVC project dir: `yo powermvc`
 - Run `grunt` for building and `grunt serve` for live reloading


Commands
--------

There are four main groups of tasks. You can create your own Grunt tasks or change existing in `Gruntfile.js`.

All **install** tasks are handled by `npm` and `bower`:

 - `npm install`: restore all `npm` modules configured in `package.json`
 - `npm install {package} --save`: install new Grunt plugin or other `npm` module and update `package.json`
 - `bower install {package} --save`: install a client-side js library and update `bower.json`

Note that by default `npm` is configured to restore `bower` components together with `npm` modules (using `postinstall` script) for your convenience.

Grunt **build** task is used to automate front-end building tasks for development or production use. It can also be used to build MVC project from command line.

 - `grunt`: runs `grunt build` with `jshint` (js validation)
 - `grunt build`: builds all front-end stuff for development
 - `grunt build:proj`: builds entire project (front-end and back-end)
 - `grunt build:proj:clean`: rebuilds the project
 - `grunt build:dist`: builds all front-end stuff for production use (minified and bundled)

Grunt **serve** task is used to start a web server and enable live reloading.

 - `grunt serve`: starts the server (if IIS Express), opens the app in the browser and turns on live reloading
 - `grunt serve:node`: starts Node.js server for html mockup with live reloading
 - `grunt serve:dist`: starts IIS Express for `dist` site (minified local app)

Grunt **publish** task is used to preview minified/bundled local app and deploy the app to other servers.

 - `grunt publish`: publishes the app using MsDeploy profile (`dist` by default)
 - `grunt publish:dist`: builds a local copy of minified/bundled app and serves it with IIS Express


Deployment
----------

Generator includes `Properties/Yeoman/Yeoman.Deploy.targets` file with MsBuild scripts to build release versions of all client-side files during MsDeploy execution (when publishing in Visual Studio or running the build server) and put all these files into the deployment package.

Basically MsBuild just executes `npm install` and `grunt build:dist` commands, and replaces css/js/images/html files in the deployment package by their optimized versions.


Features
--------

Here is the list of generator features:

 - Easy installation to MVC projects
 - Configurable paths to all front-end dirs (css/js/images/fonts)
 - Greatly optimized grunt speed with [jit-grunt](https://github.com/shootaroo/jit-grunt)
 - [Bower](http://bower.io/) integration
 - Sass ([LibSass](http://libsass.org/)) with [autoprefixer](https://github.com/postcss/autoprefixer)
 - [Require.js](http://requirejs.org/) with configured [r.js](https://github.com/jrburke/r.js/) optimizer and tiny [almond](https://github.com/jrburke/almond) replacement for production
 - [Google CDN](https://developers.google.com/speed/libraries/devguide) support
 - Live reload
 - IIS/IIS Express servers support
 - Node.js [Connect](https://github.com/senchalabs/connect) server as a lightweight cross-platform alternative for html mockup hosting and live reload
 - Js/css/images minification, bundling and revisioning
 - Js/css source maps
 - Js linting
 - Automatic replace of js/css/image refs to optimized and revisioned files in html
 - Optimized app preview in IIS Express
 - MsBuild integration to build the project from command line
 - MsDeploy integration to run grunt tasks during publishing and publish the app from command line
 - Partial Mac support (all front-end tools and html mockup)
 - `vs.js` file with Visual Studio and MVC project helpers for your own Yeoman generators


------------------------------------------------------
© 2015 Pavel Nezhencev