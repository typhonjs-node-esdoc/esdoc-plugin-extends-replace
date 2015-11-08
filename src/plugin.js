/**
 * esdoc-plugin-extends-replace -- Provides support for replacing an ES6 classes extends target which is useful for
 * architectures where the target is indirectly imported. An example architecture is backbone-es6
 * (https://github.com/typhonjs/backbone-es6) where the main access point is a composed class, `Backbone`. In this case
 * developers import Backbone as such:
 *
 * ```
 * import Backbone from 'backbone';
 *
 * export default class MyCustomView extends Backbone.View {}
 * ```
 *
 * ESDoc has no visibility into the composed Backbone instance which occurs at runtime nor is there relevant data
 * to link `Backbone.View` to the actual implementing class / file in the bare source code which is parsed by ESDoc. In
 * this example case JSPM / SystemJS is used to manage the backbone-es6 dependency. To support end to end documentation
 * it's necessary to replace `Backbone.View` with
 * `<ProjectRootDir>/jspm_packages/github/typhonjs/backbone-es6@master/src/View.js`.
 *
 * `esdoc-plugin-extends-replace` can be used independently of JSPM / SystemJS, but the sample below from
 * `backbone-parse-es6-demo` shows the `esdoc.json` file that uses `esdoc-plugin-extends-replace` and
 * `esdoc-plugin-jspm`.
 *
 * Please refer to this repo that is using this plugin to generate end to end documentation:
 * https://github.com/typhonjs/backbone-parse-es6-demo
 *
 * ```
 * This is the esdoc.json configuration file for the above repo:
 * {
 *    "title": "backbone-parse-es6-demo",
 *    "source": "src",
 *    "destination": "docs",
 *    "plugins":
 *    [
 *       {
 *          "name": "esdoc-plugin-jspm"
 *       },
 *
 *       {
 *          "name": "esdoc-plugin-extends-replace",
 *          "option":
 *          {
 *             "silent": false,  // (Optional) if true then there is no logging output from the plugin.
 *             "replace":
 *             {
 *                "backbone~[B|b]ackbone\\.Collection": "backbone-parse-es6@[\\s\\S]+\/src\/ParseCollection",
 *                "backbone~[B|b]ackbone\\.Events": "backbone-es6@[\\s\\S]+\/src\/Events",
 *                "backbone~[B|b]ackbone\\.History": "backbone-es6@[\\s\\S]+\/src\/History",
 *                "backbone~[B|b]ackbone\\.Model": "backbone-parse-es6@[\\s\\S]+\/src\/ParseModel",
 *                "backbone~[B|b]ackbone\\.Router": "backbone-es6@[\\s\\S]+\/src\/Router",
 *                "backbone~[B|b]ackbone\\.View": "backbone-es6@[\\s\\S]+\/src\/View"
 *             }
 *          }
 *       }
 *    ]
 * }
 *```
 *
 * In the `option.replace` object hash the left hand is a text string or regex to search for in `extends` tags available
 * for modification in `onHandleTag`. This string is turned into a RegExp instance and it's test method used for
 * substitution matching. On the right hand side the string is turned into a RegExp instance to capture a partial path
 * & name of the class to replace matched extend targets. Using a RegExp versus a bare string is recommend in order to
 * capture variation particularly in the semver / version of the JSPM package / path being linked. In `onHandleTag` all
 * tags are first processed storing the `longname` tag for the class path in question. Then a second pass is made
 * replacing any classes `extends` tags that match the left hand side with the `longname` of the class found on the
 * right hand side.
 *
 * Another option is `silent` which if true silences any logging output from the plugin.
 *
 * Of course it should be noted that using bare strings instead of regex expressions could result in potential clashes.
 * It's recommended to use a regex defining a partial path including the JSPM package name as shown above. Please take
 * note of the semver / version number or `@master` for a dependency pulling directly from the master branch of
 * a repository. The regex example above takes into account the semver of the JSPM packages. It also allows some
 * flexibility in the code matching allowing `Backbone.<class>` or `backbone.<class>` matching in the extends
 * statements. It also requires the import statement for Backbone to match `import Backbone from 'backbone';` or
 * `import backbone from 'backbone';`
 */

var forwardLookup = {};    // Stores forward lookup RegExp instances to match against `extends` statements.
var reverseLookup = {};    // Stores reverse lookup RegExp instances to link against any class processed by ESDoc.
var classData = {};        // Stores by left hand key string the linked classes resolved by the first pass lookup.
var silent;                // Stores option that if true silences logging output.

// ESDoc plugin callbacks -------------------------------------------------------------------------------------------

/**
 * Stores the option data from the plugin configuration converting all pattern matching strings into RegExp instances.
 *
 * @param {object}   ev - Event from ESDoc containing data field.
 */
exports.onStart = function(ev)
{
   var option = ev.data.option || {};
   option.replace = option.replace || {};
   silent = option.silent || false;

   // Create forward and reverse RegExp instances
   for (var key in option.replace)
   {
      forwardLookup[key] = new RegExp(key);
      reverseLookup[key] = new RegExp(option.replace[key]);
   }
};

/**
 * Replaces class `extends` tag entries with the `longname` of classes found in a first pass.
 *
 * @param {object}   ev - Event from ESDoc containing data field
 */
exports.onHandleTag = function(ev)
{
   // Perform first pass through all tags matching the `longname` of a class with the `option.replace` right
   // hand side / class path & name partial.
   for (var cntr = 0; cntr < ev.data.tag.length; cntr++)
   {
      var tag = ev.data.tag[cntr];

      // Only process tags where the kind is `class` that also have a longname.
      if (tag.kind && tag.longname && tag.kind === 'class')
      {
         // Iterate over all reverse lookup RegExp
         for (var key in reverseLookup)
         {
            // If a match is found store the tag.longname by left hand key string.
            if (reverseLookup[key].test(tag.longname))
            {
               classData[key] = tag.longname;

               if (!silent)
               {
                  console.log("esdoc-plugin-extends-replace - Info: linked '" +reverseLookup[key] +"' to '"
                   +tag.longname +"'");
               }
            }
         }
      }
   }

   // Perform a second pass through all tags replacing class `extends` entries that match the left hand side of
   // `option.replace` data with the `longname` of the class from the first pass above.
   for (cntr = 0; cntr < ev.data.tag.length; cntr++)
   {
      tag = ev.data.tag[cntr];

      // Only process tags where the kind is `class` that also have an `extends` entry.
      if (tag.kind && tag.extends && tag.kind === 'class')
      {
         // Iterate through all extends entries.
         for (var cntr2 = 0; cntr2 < tag.extends.length; cntr2++)
         {
            var extendsTag = tag.extends[cntr2];

            // Iterate over all forward lookup RegExp.
            for (key in forwardLookup)
            {
               // If a match is found then replace the extends entry with the linked class path.
               if (forwardLookup[key].test(extendsTag))
               {
                  if (typeof classData[key] === 'undefined')
                  {
                     if (!silent)
                     {
                        console.log("esdoc-plugin-extends-replace - Warning: aborting, regex '" +forwardLookup[key]
                         +"' matched '" + extendsTag +"' but there is no linked class path data.'");
                     }
                  }
                  else
                  {
                     tag.extends[cntr2] = classData[key];

                     if (!silent)
                     {
                        console.log("esdoc-plugin-extends-replace - Info: replaced '" + extendsTag +"' to '"
                         +classData[key] +"'");
                     }
                  }
               }
            }
         }
      }
   }
};