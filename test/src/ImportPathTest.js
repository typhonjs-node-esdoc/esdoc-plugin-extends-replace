import { assert } from 'chai';
import fs         from 'fs-extra';

/**
 * This test confirms that the Backbone-ES6 JSPM package is properly linked with the local source. In this case
 * a successful result is when TestCollection properly extends Collection and the inheritance link is made
 * in documentation for TestCollection.
 *
 * @test {onHandleCode}
 */
describe('Import Path', () =>
{
   it('TestCollection extends Backbone.Collection', () =>
   {
      const html = fs.readFileSync('./test/fixture/docs/class/fixture/TestCollection.js~TestCollection.html', 'utf-8');

      assert(html.indexOf('fixture/BackboneShim.js~Collection.html">Collection</a></span> &#x2192; TestCollection<')
       >= 0);
   });

   it('TestEvents extends Backbone.Events', () =>
   {
      const html = fs.readFileSync('./test/fixture/docs/class/fixture/TestEvents.js~TestEvents.html', 'utf-8');

      assert(html.indexOf('fixture/BackboneShim.js~Events.html">Events</a></span> &#x2192; TestEvents<') >= 0);
   });

   it('TestHistory extends Backbone.History', () =>
   {
      const html = fs.readFileSync('./test/fixture/docs/class/fixture/TestHistory.js~TestHistory.html', 'utf-8');

      assert(html.indexOf('fixture/BackboneShim.js~History.html">History</a></span> &#x2192; TestHistory<') >= 0);
   });

   it('TestRouter extends Backbone.Router', () =>
   {
      const html = fs.readFileSync('./test/fixture/docs/class/fixture/TestRouter.js~TestRouter.html', 'utf-8');

      assert(html.indexOf('fixture/BackboneShim.js~Router.html">Router</a></span> &#x2192; TestRouter<') >= 0);
   });

   it('TestView extends Backbone.View', () =>
   {
      const html = fs.readFileSync('./test/fixture/docs/class/fixture/TestView.js~TestView.html', 'utf-8');

      assert(html.indexOf('fixture/BackboneShim.js~View.html">View</a></span> &#x2192; TestView<') >= 0);
   });
});