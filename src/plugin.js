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
 * `<ProjectRootPath>/jspm_packages/github/typhonjs/backbone-es6@master/src/View.js`.
 *
 * `esdoc-plugin-extends-replace` can be used independently of JSPM / SystemJS, but the sample below from
 * `backbone-parse-es6-demo` shows the `esdoc.json` file that uses `esdoc-plugin-extends-replace` and
 * `esdoc-plugin-jspm`.
 *
 * Please refer to this repo that is using this plugin to generate end to end documentation:
 * https://github.com/typhonjs/backbone-parse-es6-demo
 *
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
 *             "replace":
 *             {
 *                "Backbone.Collection": "ParseCollection",
 *                "Backbone.Events": "Events",
 *                "Backbone.History": "History",
 *                "Backbone.Model": "ParseModel",
 *                "Backbone.Router": "Router",
 *                "Backbone.View": "View"
 *             }
 *          }
 *       }
 *    ]
 * }
 *
 * In the `option.replace` object hash the left hand is a text string to search for in `extends` tags available for
 * modification in `onHandleTag`. Presently it's just a bare string checked by `indexOf`. In the future it may be
 * upgraded to regex matching. On the right hand side is the name of the class to replace matched extend targets.
 * In `onHandleTag` all tags are first processed storing the `longname` tag for the class name in question. Then a
 * second pass is made replacing any classes `extends` tags that match the left hand side with the `longname` of the
 * class found on the right hand side.
 *
 * Of course it should be noted that currently the parsing is very basic and there will be clashes if one duplicates
 * class names.
 */

var option;
var reverseLookup = {};

// ESDoc plugin callbacks -------------------------------------------------------------------------------------------

/**
 * Stores the option data from the plugin configuration and provides empty defaults as necessary.
 *
 * @param {object}   ev - Event from ESDoc containing data field.
 */
exports.onStart = function(ev)
{
   option = ev.data.option || {};
   option.replace = option.replace || {};

   for (var regex in option.replace)
   {
      reverseLookup[option.replace[regex]] = '';
   }
};

/**
 * Replaces class `extends` tag entries with the `longname` of classes found in a first pass.
 *
 * @param {object}   ev - Event from ESDoc containing data field
 */
exports.onHandleTag = function(ev)
{
   // Perform first pass through all tags matching the name of a class with the `option.replace` right
   // hand side / class name.
   for (var cntr = 0; cntr < ev.data.tag.length; cntr++)
   {
      var tag = ev.data.tag[cntr];

      if (tag.kind && tag.name && tag.longname && tag.kind === 'class')
      {
         if (typeof reverseLookup[tag.name] === 'string')
         {
            reverseLookup[tag.name] = tag.longname;
         }
      }
   }

   // Perform a second pass through all tags replacing class `extends` entries that match the left hand side of
   // `option.replace` data with the `longname` of the class from the first pass above.
   for (cntr = 0; cntr < ev.data.tag.length; cntr++)
   {
      tag = ev.data.tag[cntr];

      if (tag.kind && tag.extends && tag.kind === 'class')
      {
         for (var cntr2 = 0; cntr2 < tag.extends.length; cntr2++)
         {
            var extendsTag = tag.extends[cntr2];

            for (var replace in option.replace)
            {
               if (extendsTag.indexOf(replace) >= 0)
               {
                  tag.extends[cntr2] = reverseLookup[option.replace[replace]];
               }
            }
         }
      }
   }
};