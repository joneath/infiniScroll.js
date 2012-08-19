// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT license
// Version 0.1

(function() {
  Backbone.InfiniScroll = function(collection, options) {
    options = options || { };

    var self = { },
        $target,
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
      pageSizeParam: "page_size",
      pageSize: pageSize,
      includePageSize: true,
      offsetParam: "offset",
      includeOffset: false,
      pageParam: "page",
      param: "until",
      untilAttr: "id",
      includeUntil: true,
      scrollOffset: 100,
      add: true,
      strict: false,
      includePage: false,
      extraParams: {}
    });

    var initialize = function() {
      $target = $(self.options.target);
      fetchOn = true;
      page = 1;

      $target.on("scroll", self.watchScroll);
    };

    self.destroy = function() {
      $target.off("scroll", self.watchScroll);
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
      var queryParams,
          scrollY = $target.scrollTop() + $target.height(),
          docHeight = $target.get(0).scrollHeight;

      if (!docHeight) {
        docHeight = $(document).height();
      }

      if (scrollY >= docHeight - self.options.scrollOffset && fetchOn && prevScrollY <= scrollY) {
        var lastModel = self.collection.last();
        if (!lastModel) { return; }

        self.onFetch();
        self.disableFetch();
        self.collection.fetch({
          success: self.fetchSuccess,
          error: self.fetchError,
          add: self.options.add,
          data: $.extend(buildQueryParams(lastModel), self.options.extraParams)
        });
      }
      prevScrollY = scrollY;
    };

    function buildQueryParams(model) {
      var params = { };

      if (self.options.includeUntil) {
          params[self.options.param] = typeof(model[self.options.untilAttr]) === "function" ? model[self.options.untilAttr]() : model.get(self.options.untilAttr);
      }

      if (self.options.includePageSize) {
        params[self.options.pageSizeParam] = self.options.pageSize
      }

      if (self.options.includePage) {
        params[self.options.pageParam] = page + 1;
      }

      if (self.options.includeOffset) {
        params[self.options.offsetParam] = (page + 1) * self.options.pageSize;
      }

      return params;
    }

    initialize();

    return self;
  };
})( );
