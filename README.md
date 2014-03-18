Yeoman PowerMvc generator
=========================

Yeoman PowerMvc generator provides out-of-box support for [Compass](http://compass-style.org/), [Require.js](http://requirejs.org/), live reload,
CDNs, minification, bundling and revisioning - everything tied together with [Bower](http://bower.io/) and fully
configurable via [Grunt](http://gruntjs.com/) scripts.

Basically, this generator is similar to official [webapp](https://github.com/yeoman/generator-webapp) generator, but with Require.js
integrated, created specifically for ASP.NET MVC apps and integrated with Visual Studio and
MsBuild/MsDeploy.


Usage
-----

To scaffold your ASP.NET MVC app with powerfull front-end features, run the next command in
the command prompt, from your web project location:

    D:\MyProject> yo aspnet-powermvc

**Note**: make sure you have `.bin` dir in your `PATH` (should be added automatically during Yeoman
NuGet package installation), or run `yo` tool using it's path, eg `.bin\yo` from the project
dir.

Follow further generator instructions during its execution.


Overview
--------

The core of installation is `Gruntfile.js`, where all features and entire front-end build process
are configured.

All specific Grunt tasks are grouped into four main purpose tasks:

 - `build`: builds the app for development. Installs bower dependencies, configures Require.js,
   runs MsBuild and compiles scss/sass files.

 - `build:dist`: builds the app for production use. Runs `build` task, minifies css/js/images,
   handles CDNs, files revisioning, replaces all dev refs to optimized files in html and
   minifies all html.
   
 - `serve`: opens the app in the browser, starts watching for file changes and will reload the
   app after css/js/images/html/configs or MVC C# files were changed.
   
 - `default` (if grunt called without task): runs js validator and `build` task.

Usual workflow:

 - you run `grunt` after code pulls if live reload wasn't started yet.
 - you run `grunt serve` during development to activate live reload.
 - you or a build server runs `grunt build:dist` to build everything for production use.


Automation
----------

Generator includes `Properties\Yeoman\Yeoman.Deploy.targets` file with MsBuild scripts to build
release versions of all client-side files during MsDeploy execution (when creating a local
package or WMSVC deploy).

By default, MsBuild just executes `npm install` and `grunt build:dist` commands, and replaces
css/js/images/html in the deployment package by their optimized versions. The build process
itself is described in `Gruntfile.js`.


Features
--------

Here is a short overview of all general features of the generator:

 - **live reload**: automatically reloads your app in the browser during development. It also
   builds the project after C# files changes, compiles scss/sass files, runs js code checker,
   installs and configures missing bower modules with require.js.
   
 - **require.js support**: bower integration, configured r.js optimizer, CDNs support, tiny
   almond.js replacement for production use.
   
 - **compass support**, integrated with live reload.

 - js/css/images/html **minification and revisioning**.
 
 - **automatic replaces** of all js/css/images refs to optimized and revisioned files in html.
 
 - **msbuild/msdeploy**: automated release builds of all client-side files during publishing.


------------------------------------------------------
© 2014 Pavel Nezhencev
