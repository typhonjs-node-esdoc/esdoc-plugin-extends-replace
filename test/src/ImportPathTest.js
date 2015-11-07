var assert = require('power-assert');
var fs = require('fs-extra');

/**
 * This test confirms that the Backbone-ES6 JSPM package is properly linked with the local source. In this case
 * a successful result is when TestCollection properly extends Collection and the inheritance link is made
 * in documentation for TestCollection.
 *
 * @test {onHandleCode}
 */
describe('Import Path', function()
{
   it('TestCollection extends Backbone.Collection', function()
   {
      var html = fs.readFileSync(
       './test/fixture/docs/class/esdoc-plugin-extends-replace/test/fixture/TestCollection.js~TestCollection.html').toString();

      assert(html.indexOf('src/Collection.js~Collection.html">Collection</a></span> &#x2192; TestCollection<') >= 0);
   });

   it('TestEvents extends Backbone.Events', function()
   {
      var html = fs.readFileSync(
       './test/fixture/docs/class/esdoc-plugin-extends-replace/test/fixture/TestEvents.js~TestEvents.html').toString();

      assert(html.indexOf('src/Events.js~Events.html">Events</a></span> &#x2192; TestEvents<') >= 0);
   });

   it('TestHistory extends Backbone.History', function()
   {
      var html = fs.readFileSync(
       './test/fixture/docs/class/esdoc-plugin-extends-replace/test/fixture/TestHistory.js~TestHistory.html').toString();

      assert(html.indexOf('src/History.js~History.html">History</a></span> &#x2192; TestHistory<') >= 0);
   });

   it('TestRouter extends Backbone.Router', function()
   {
      var html = fs.readFileSync(
       './test/fixture/docs/class/esdoc-plugin-extends-replace/test/fixture/TestRouter.js~TestRouter.html').toString();

      assert(html.indexOf('src/Router.js~Router.html">Router</a></span> &#x2192; TestRouter<') >= 0);
   });

   it('TestView extends Backbone.View', function()
   {
      var html = fs.readFileSync(
       './test/fixture/docs/class/esdoc-plugin-extends-replace/test/fixture/TestView.js~TestView.html').toString();

      assert(html.indexOf('src/View.js~View.html">View</a></span> &#x2192; TestView<') >= 0);
   });
});