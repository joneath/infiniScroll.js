# infiniScroll.js

## Description

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

#### destory()
Removes target scroll binding. Call this when you are removing your view.

#### enableFetch()
Enables infiniScroll

#### disableFetch()
Disables infiniScroll
    
### Options
    options = {
      success: function(){ },
      error: function(){ },
      target: $(window),
      param: "until",
      until_attr: "id",
      pageSize: collection.length,
      scrollOffset: 100,
      add: true
    }

#### success (no_op)
Success callback function called when `collection.fetch` is successful

#### error (no_op)
Error callback function called when `collection.fetch` raises error

#### target (window)
Target element to watch scroll. Change this if you have an internal scrolling element to infinite scroll.

#### param ("until")
GET param used when `collection.fetch` is called

#### until_attr ("id")
The GET param attribute used when `collection.fetch` is called. Finds last record in collection and uses this param as key.

#### pageSize (`collection.length`)
Used internally to determine when fetching of pages is completed.

#### scrollOffset (100px)
Pixel count from bottom of page to offset the scroll for when to trigger `collection.fetch`

#### add (true)
Passed to collection fetch to either add new records to the collection of perform a normal reset