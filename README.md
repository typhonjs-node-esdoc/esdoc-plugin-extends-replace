Provides support for replacing an ES6 classes extends target which is useful for
architectures where the target is indirectly imported. An example architecture is [backbone-es6](https://github.com/typhonjs/backbone-es6) where the main access point is a composed class, `Backbone`. In this case developers import Backbone as such:

```
import Backbone from 'backbone';

export default class MyCustomView extends Backbone.View {}
```

ESDoc has no visibility into the composed Backbone instance which occurs at runtime nor is there relevant data
to link `Backbone.View` to the actual implementing class / file in the bare source code which is parsed by ESDoc. In this example case JSPM / SystemJS is used to manage the backbone-es6 dependency. To support end to end documentation it's necessary to replace `Backbone.View` with
`<ProjectRootPath>/jspm_packages/github/typhonjs/backbone-es6@master/src/View.js`.

Installation steps:
- Install `esdoc` or `gulp-esdoc` in `devDependencies` in `package.json`.
- Install `esdoc-plugin-extends-replace` in `devDependencies` in `package.json`.
- Create an `esdoc.json` configuration file adding the plugin.
- Add `option` -> `replace` data listing the `extends` tag to replace with the partial path on the right.
- Run ESdoc then profit!

For more information view the [ESDoc tutorial](https://esdoc.org/tutorial.html) and [ESDoc Config](https://esdoc.org/config.html) documentation.

As an alternate and the preferred all inclusive installation process please see [typhonjs-core-gulptasks](https://www.npmjs.com/package/typhonjs-core-gulptasks) for a NPM package which contains several pre-defined Gulp tasks for working with JSPM / SystemJS, ESLint and ESDoc generation with `esdoc-plugin-extends-replace` and `esdoc-plugin-jspm` support.

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
            "replace":
            {
               "Backbone.Collection": "backbone-parse-es6@master/src/ParseCollection",
               "Backbone.Events": "backbone-es6@master/src/Events",
               "Backbone.History": "backbone-es6@master/src/History",
               "Backbone.Model": "backbone-parse-es6@master/src/ParseModel",
               "Backbone.Router": "backbone-es6@master/src/Router",
               "Backbone.View": "backbone-es6@master/src/View"
            }
         }
      }
   ]
}
```

In the `option.replace` object hash the left hand is a text string to search for in `extends` tags available for
modification in `onHandleTag`. Presently it's just a bare string checked by `indexOf`. In the future it may be
upgraded to regex matching. On the right hand side is the partial path & name of the class to replace matched extend targets. In `onHandleTag` all tags are first processed storing the `longname` tag for the class path in question. Then a second pass is made replacing any classes `extends` tags that match the left hand side with the `longname` of the class found on the right hand side.

Of course it should be noted that currently the parsing is very basic and there will be clashes if one uses just
the class name. It's recommended to use a partial path including the JSPM module name as shown above. Please take
note of the semver / version number or `@master` for a dependency pulling directly from the master branch of
a repository.

If installing and working directly with `esdoc-plugin-extends-replace` the following is an example integration for `package.json`:
```
{
  ...

  "devDependencies": {
    "esdoc-plugin-extends-replace": "^0.1.0",
    "esdoc-plugin-jspm": "^0.3.0",
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
