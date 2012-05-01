// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT license
// Version 0.1

(function() {
  Backbone.InfiniScroll = function(collection, options) {
    options = options || { };

    var self = { },
        fetchOn,
        page,
        pageSize,
        prevScrollY = 0;

    pageSize = collection.length || 25;

    self.collection = collection;
    self.options = _.defaults(options, {
      success: function(){ },
      error: function(){ },
      onFetch: function(){ },
      target: $(window),
      param: "until",
      untilAttr: "id",
      pageSize: pageSize,
      scrollOffset: 100,
      add: true,
      strict: false,
      includePage: false
    });

    var initialize = function() {
      fetchOn = true;
      page = 1;

      $(self.options.target).on("scroll", self.watchScroll);
    };

    self.destroy = function() {
      $(self.options.target).off("scroll", self.watchScroll);
    };

    self.enableFetch = function() {
      fetchOn = true;
    };

    self.disableFetch = function() {
      fetchOn = false;
    };

    self.onFetch = function() {
      self.options.onFetch();
    };

    self.fetchSuccess = function(collection, response) {
      if ((self.options.strict && collection.length >= (page + 1) * self.options.pageSize) || (!self.options.strict && response.length > 0)) {
        self.enableFetch();
        page += 1;
      } else {
        self.disableFetch();
      }
      self.options.success(collection, response);
    };

    self.fetchError = function(collection, response) {
      self.enableFetch();

      self.options.error(collection, response);
    };

    self.watchScroll = function(e) {
      var scrollY = $(self.options.target).scrollTop() + $(self.options.target).height(),
          docHeight = $(document).height();

      if (scrollY >= docHeight - self.options.scrollOffset && fetchOn && prevScrollY <= scrollY) {
        var lastModel = self.collection.last();
        if (!lastModel) { return; }

        self.onFetch();
        self.disableFetch();
        self.collection.fetch({
          success: self.fetchSuccess,
          error: self.fetchError,
          add: self.options.add,
          data: buildQueryParams(lastModel)
        });
      }
      prevScrollY = scrollY;
    };

    function buildQueryParams(model) {
      var params = { };

      params[self.options.param] = typeof(model[self.options.untilAttr]) === "function" ? model[self.options.untilAttr]() : model.get(self.options.untilAttr);

      if (self.options.includePage) {
        params["page"] = page + 1;
      }

      return params;
    }

    initialize();

    return self;
  };
})( );
