# infiniScroll.js

infiniScroll.js is a Backbone.js module to add infinite scrolling to your backbone views. Simply create an `InfiniScroll` object passing the desired collection and success callback.

## Usage
###Backbone.InfiniScroll(collection, options)

Instantiate a new `InfiniScroll` object after your Backbone view has been rendered.

    myView = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this, "render");

        this.render();
        this.infiniScroll = new Backbone.InfiniScroll(this.collection, {success: this.appendRender});
      }
    )};

### methods

* `destroy()` - Removes target scroll binding. Call this when you're removing the view.
* `enableFetch()` - Enables infiniScroll
* `disableFetch()` - Disables infiniScroll

### Options
    options = {
      success: function(){ },
      error: function(){ },
      target: $(window),
      param: "until",
      extraParams: {},
      pageSizeParam: "page_size",
      untilAttr: "id",
      pageSize: collection.length,
      scrollOffset: 100,
      add: true,
      strict: false,
      includePage: false
    }

* `success` - Success callback function called when `collection.fetch` is successful
* `error` - Error callback function called when `collection.fetch` raises error
* `target` - Target element to watch scroll. Change this if you have an internal scrolling element to infinite scroll.
* `param` - GET param used when `collection.fetch` is called
* `extraParams` - extra GET params used when `collection.fetch` is called
* `untilAttr` - The GET param attribute used when `collection.fetch` is called. Finds last record in collection and uses this param as key. Can be a function name on the model, which can be used as a computed property.
* `pageSize` - Used internally to determine when fetching of pages is completed.
* `pageSizeParam` - GET param used to send page size when `collection.fetch` is called.
* `scrollOffset` - Pixel count from bottom of page to offset the scroll for when to trigger `collection.fetch`
* `add` - Passed to collection fetch to either add new records to the collection of perform a normal reset
* `strict` - Used to determine when to stop fetching. Setting strict on will fetch until the response size is less than the page size (This can save one extra request being made to the server, but requires the response size to be consistent). Setting strict off will fetch until the response length is equal to 0 (better for varying page size responses).
* `includePage` - Boolean to include the next page in the query params eg. "&page=2".
