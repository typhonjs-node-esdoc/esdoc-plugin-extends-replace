![esdoc-plugin-extends-replace](http://i.imgur.com/TSNfjDX.png)

[![NPM](https://img.shields.io/npm/v/esdoc-plugin-extends-replace.svg?label=npm)](https://www.npmjs.com/package/esdoc-plugin-extends-replace)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MIT-yellowgreen.svg?style=flat)](https://github.com/typhonjs/esdoc-plugin-extends-replace/blob/master/LICENSE)

[![Build Status](https://travis-ci.org/typhonjs/esdoc-plugin-extends-replace.svg)](https://travis-ci.org/typhonjs/esdoc-plugin-extends-replace)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs/esdoc-plugin-extends-replace.svg)](https://codecov.io/github/typhonjs/esdoc-plugin-extends-replace)
[![Dependency Status](https://www.versioneye.com/user/projects/563d84c14d415e0018000087/badge.svg?style=flat)](https://www.versioneye.com/user/projects/563d84c14d415e0018000087)

A plugin for [ESDoc](https://esdoc.org) that enables end to end Javascript ES6 documentation providing support for replacing ES6 classes `extends` target which is useful for
architectures where the target is indirectly imported. An example architecture is [backbone-es6](https://github.com/typhonjs/backbone-es6) where the main access point is a composed class, `Backbone`. In this case developers import Backbone as such:

```
import Backbone from 'backbone';

export default class MyCustomView extends Backbone.View {}
```

ESDoc has no visibility into the composed Backbone instance which occurs at runtime nor is there relevant data
to link `Backbone.View` to the actual implementing class / file in the bare source code which is parsed by ESDoc. In this example case JSPM / SystemJS is used to manage the backbone-es6 dependency. To support end to end documentation it's necessary to replace `Backbone.View` with
`<ProjectRootPath>/jspm_packages/github/typhonjs/backbone-es6@master/src/View.js`.

Latest Changes:
- 0.2.0: All matching parameters are treated as a regex string turned into a RegExp instance for pattern matching. Bare strings will still work, but consider using regex patterns for better matching. A `silent` option is also available to silence all logging output.

Installation steps:
- Install `esdoc` or `gulp-esdoc` in `devDependencies` in `package.json`.
- Install `esdoc-plugin-extends-replace` in `devDependencies` in `package.json`.
- Create an `esdoc.json` configuration file adding the plugin.
- Add `option` -> `replace` data listing the `extends` tag to replace with the partial path on the right.
- Run ESdoc then profit!

For more information view the [ESDoc tutorial](https://esdoc.org/tutorial.html) and [ESDoc Config](https://esdoc.org/config.html) documentation.

As an alternate and the preferred all inclusive installation process please see [typhonjs-core-gulptasks](https://www.npmjs.com/package/typhonjs-core-gulptasks) for a NPM package which contains several pre-defined Gulp tasks for working with JSPM / SystemJS, ESLint and ESDoc generation with all available plugins including [esdoc-plugin-jspm](https://www.npmjs.com/package/esdoc-plugin-jspm), [esdoc-plugin-extends-replace](https://www.npmjs.com/package/esdoc-plugin-extends-replace), [esdoc-importpath-plugin](https://www.npmjs.com/package/esdoc-importpath-plugin]) & [esdoc-es7-plugin](https://www.npmjs.com/package/esdoc-es7-plugin) support.

`esdoc-plugin-extends-replace` can be used independently of JSPM / SystemJS, but the sample below from
`backbone-parse-es6-demo` shows the `esdoc.json` file that uses `esdoc-plugin-extends-replace` and
[esdoc-plugin-jspm](https://www.npmjs.com/package/esdoc-plugin-jspm).

Please refer to this repo that is using this plugin to generate end to end documentation:
https://github.com/typhonjs/backbone-parse-es6-demo

```
This is the esdoc.json configuration file for the above repo:
{
   "title": "backbone-parse-es6-demo",
   "source": "src",
   "destination": "docs",
   "plugins":
   [
      {
         "name": "esdoc-plugin-jspm"
      },

      {
         "name": "esdoc-plugin-extends-replace",
         "option":
         {
            "silent": false,  // (Optional) if true then there is no logging output from the plugin.
            "replace":
            {
               "backbone~[B|b]ackbone\\.Collection": "backbone-parse-es6@[\\s\\S]+\/src\/ParseCollection",
               "backbone~[B|b]ackbone\\.Events": "backbone-es6@[\\s\\S]+\/src\/Events",
               "backbone~[B|b]ackbone\\.History": "backbone-es6@[\\s\\S]+\/src\/History",
               "backbone~[B|b]ackbone\\.Model": "backbone-parse-es6@[\\s\\S]+\/src\/ParseModel",
               "backbone~[B|b]ackbone\\.Router": "backbone-es6@[\\s\\S]+\/src\/Router",
               "backbone~[B|b]ackbone\\.View": "backbone-es6@[\\s\\S]+\/src\/View"
            }
         }
      }
   ]
}
```

In the `option.replace` object hash the left hand is a text string or regex to search for in `extends` tags available for modification in `onHandleTag`. This string is turned into a RegExp instance and its test method used for substitution matching. On the right hand side the string is turned into a RegExp instance to capture a partial path & name of the class to replace matched extend targets. Using a RegExp versus a bare string is recommend in order to capture variation particularly in the semver / version of the JSPM package / path being linked. In `onHandleTag` all tags are first processed storing the `longname` tag for the class path in question. Then a second pass is made replacing any classes `extends` tags that match the left hand side with the `longname` of the class found on the right hand side.

Another option is `silent` which if true silences any logging output from the plugin.

Of course it should be noted that using bare strings instead of regex expressions could result in potential clashes.
It's recommended to use a regex defining a partial path including the JSPM package name as shown above. Please take
note of the semver / version number or `@master` for a dependency pulling directly from the master branch of
a repository. The regex example above takes into account any semver for the JSPM packages. It also allows some
flexibility in the code matching allowing `Backbone.<class>` or `backbone.<class>` matching in the extends
statements. It also requires the import statement for Backbone to match `import Backbone from 'backbone';` or `import backbone from 'backbone';`

If installing and working directly with `esdoc-plugin-extends-replace` the following is an example integration for `package.json`:
```
{
  ...

  "devDependencies": {
    "esdoc-plugin-extends-replace": "^0.2.0",
    "esdoc-plugin-jspm": "^0.4.0",
    "jspm": "^0.16.14",
    "gulp": "^3.9.0",
    "gulp-esdoc": "^0.1.0",
  },
  
  "jspm": {
    "main": "src/ModuleRuntime.js",
    "dependencies": {
      "backbone-es6": "github:typhonjs/backbone-es6@master"
    },
     "devDependencies": {
      ....
    }
  }
}
```

For the example above the local source root is `src` and the ESDoc documentation is output to `docs`. The  `backbone-es6` JSPM package is automatically linked by `esdoc-plugin-jspm`.

You may use any version of ESDoc, but as an example here is a simple Gulp task which invokes gulp-esdoc:

```
/**
 * Create docs from ./src using ESDoc. The docs are located in ./docs
 */
gulp.task('docs', function()
{
   var esdoc = require('gulp-esdoc');
   var path = require('path');

   var esdocConfig = require('.' +path.sep +'esdoc.json');

   // Launch ESDoc
   return gulp.src(esdocConfig.source).pipe(esdoc(esdocConfig));
});
```

To suggest a feature or report a bug: https://github.com/typhonjs/esdoc-plugin-extends-replace/issues

Many thanks to the ESDoc community for creating a valuable documentation tool. 

esdoc-plugin-extends-replace (c) 2015-present Michael Leahy, TyphonRT Inc.

esdoc-plugin-extends-replace may be freely distributed under the MIT license.
