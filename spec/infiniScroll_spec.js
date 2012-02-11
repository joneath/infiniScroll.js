describe("InfiniScroll", function() {
  var PAGE_SIZE = 25;
  var collection,
      model,
      view,
      options,
      infini;

  beforeEach(function() {
    var Collection = Backbone.Collection.extend({
      url: "/example"
    });

    var Model = Backbone.Model.extend({
      calculatedParam: function() { }
    });

    model = new Model({id: 1});

    collection = new Collection([model]);
    collection.length = 25;

    view = new Backbone.View({collection: collection});

    options = {
      success: function() { },
      error: function() { },
      onFetch: function() { }
    };

    infini = new Backbone.InfiniScroll(collection, options);
  });

  afterEach(function() {
    infini.destroy();
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
    beforeEach(function() {
      collection.length = PAGE_SIZE;
    });

    describe("with an included external success callback", function() {
      it("should call the provided success callback", function() {
        spyOn(infini.options, "success");
        spyOn(infini.options, "error");

        infini.fetchSuccess(collection, []);
        expect(infini.options.success).toHaveBeenCalledWith(collection, []);
      });
    });

    describe("when in strict mode", function() {
      var infini;

      beforeEach(function() {
        infini = new Backbone.InfiniScroll(collection, {strict: true});
        spyOn(infini, "enableFetch");
        spyOn(infini, "disableFetch");
      });

      it("should disable fetch when the response page size is less than the requested page size", function() {
        collection.length = PAGE_SIZE * 1.5;
        infini.fetchSuccess(collection, [{id: 1}]);
        expect(infini.disableFetch).toHaveBeenCalled();
      });
    });

    describe("when not in strict mode", function() {
      var infini;

      beforeEach(function() {
        infini = new Backbone.InfiniScroll(collection, {strict: false});
        spyOn(infini, "enableFetch");
        spyOn(infini, "disableFetch");
      });

      it("should disable fetch when the response page size is 0", function() {
        infini.fetchSuccess(collection, []);
        expect(infini.disableFetch).toHaveBeenCalled();
      });

      it("should not disable fetch when the response size is greater than 0", function() {
        infini.fetchSuccess(collection, [{id: 1}]);
        expect(infini.enableFetch).toHaveBeenCalled();
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
    var event;

    beforeEach(function() {
      event = jQuery.Event("scroll");
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
        expect(collection.fetch).toHaveBeenCalledWith({success: infini.fetchSuccess, error: infini.fetchError, add: true, data: queryParams});
      });

      it("should disable scroll watch until the fetch has returned", function() {
        expect(collection.fetch).toHaveBeenCalledWith({success: infini.fetchSuccess, error: infini.fetchError, add: true, data: queryParams});

        infini.watchScroll(event);
        expect(collection.fetch.callCount).toEqual(1);

        infini.watchScroll(event);
        expect(collection.fetch.callCount).toEqual(1);

        infini.fetchSuccess(collection, [{id: 1}]);

        infini.watchScroll(event);
        expect(collection.fetch.callCount).toEqual(2);
      });

      describe("when untilAttr is a function", function() {
        it("should call the untilAttr function", function() {
          spyOn(model, "calculatedParam");
          options.untilAttr = "calculatedParam";
          var infini = new Backbone.InfiniScroll(collection, options);
          infini.watchScroll(event);

          expect(model.calculatedParam).toHaveBeenCalled();
        });
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
