describe("InfiniScroll", function() {
  var PAGE_SIZE = 25;
  var collection,
      view,
      options,
      infini;

  beforeEach(function() {
    var Collection = Backbone.Collection.extend({
      url: "/example"
    });

    collection = new Collection([{id: 1}]);
    collection.length = 25;

    view = new Backbone.View({collection: collection});

    options = {
      success: function() { },
      error: function() { }
    };

    infini = new Backbone.InfiniScroll(collection, options);
  });

  it("should bind to Backbone.InfiniScroll", function() {
    expect(Backbone.InfiniScroll).toBeDefined();
  });

  describe("initialization", function() {
    it("should have default values when no options are passed", function() {
      var infini = new Backbone.InfiniScroll(collection);

      expect(infini.options.param).toEqual("until");
      expect(infini.options.untilAttr).toEqual("id");
      expect(infini.options.pageSize).toEqual(25);
      expect(infini.options.scrollOffset).toEqual(100);
      expect(infini.options.add).toEqual(true);
    });
  });

  describe("#fetchSuccess", function() {
    describe("with an included external success callback", function() {
      it("should call the provided success callback", function() {
        spyOn(infini.options, "success");
        spyOn(infini.options, "error");

        infini.fetchSuccess(collection, null);
        expect(infini.options.success).toHaveBeenCalledWith(collection, null);
      });

      describe("when the returned data is the same length as the page size", function() {
        it("should call enableFetch", function() {
          spyOn(infini, "enableFetch");
          collection.length = 50;

          infini.fetchSuccess(collection, null);
          expect(infini.enableFetch).toHaveBeenCalled();
        });
      });

      describe("when the returned data is less than the length of the page size", function() {
        it("should call disableFetch", function() {
          spyOn(infini, "disableFetch");
          collection.length = 25;

          infini.fetchSuccess(collection, null);
          expect(infini.disableFetch).toHaveBeenCalled();
        });
      });
    });
  });

  describe("#fetchError", function() {
    describe("with an included external error callback", function() {
      it("should call the provided error callback", function() {
        spyOn(infini.options, "success");
        spyOn(infini.options, "error");

        infini.fetchError(collection, null);
        expect(infini.options.error).toHaveBeenCalledWith(collection, null);
      });
    });
  });

  describe("#watchScroll", function() {
    var event,
        infini;

    beforeEach(function() {
      event = jQuery.Event("scroll");
      infini = new Backbone.InfiniScroll(collection);

      spyOn(collection, "fetch");
    });

    describe("when the window is scrolled above the threshold", function() {
      var queryParams,
          scrollTop;

      beforeEach(function() {
        scrollTop = 600;

        spyOn($.fn, "scrollTop").andCallFake(function(){ return scrollTop; });
        spyOn($.fn, "height").andReturn(600);

        infini.watchScroll(event);

        queryParams = { };
        queryParams[infini.options.param] = collection.last().get(infini.options.untilAttr);

        collection.length = 50;
      });

      it("should call collection fetch with the query param, until offset, success, and error callbacks", function() {
        expect(collection.fetch).toHaveBeenCalledWith({success: infini.fetchSuccess, error: infini.fetchError, data: queryParams});
      });

      it("should disable scroll watch until the fetch has returned", function() {
        expect(collection.fetch).toHaveBeenCalledWith({success: infini.fetchSuccess, error: infini.fetchError, data: queryParams});

        infini.watchScroll(event);
        expect(collection.fetch.callCount).toEqual(1);

        infini.watchScroll(event);
        expect(collection.fetch.callCount).toEqual(1);

        infini.fetchSuccess(collection, null);

        infini.watchScroll(event);
        expect(collection.fetch.callCount).toEqual(2);
      });

      describe("when the window is scrolled up", function() {
        it("should not call collection fetch", function() {
          infini.watchScroll(event);
          expect(collection.fetch).toHaveBeenCalled();

          scrollTop = 599;
          infini.enableFetch();

          infini.watchScroll(event);
          expect(collection.fetch.callCount).toEqual(1);
        });
      });
    });

    describe("when the window is scrolled bellow the threshold", function() {
      it("should not call collection fetch", function() {
        spyOn($.fn, "scrollTop").andReturn(-101); // Crazy number for stubbing
        spyOn($.fn, "height").andReturn(200);

        infini.watchScroll(event);
        expect(collection.fetch).not.toHaveBeenCalled();
      });
    });
  });
});
