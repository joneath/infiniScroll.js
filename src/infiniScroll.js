// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT licence
// Version 0.1

(function() {
  Backbone.InfiniScroll = function(collection, options){
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
      target: $(window),
      param: "until",
      untilAttr: "id",
      pageSize: pageSize,
      scrollOffset: 100,
      add: true
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

    self.fetchSuccess = function(collection, response) {
      if (collection.length >= (page + 1) * self.options.pageSize){
        self.enableFetch();
        page += 1;
      }
      else{
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
          scrollY = $(self.options.target).scrollTop() + $(self.options.target).height(),
          docHeight = $(document).height();

      if (scrollY >= docHeight - self.options.scrollOffset && fetchOn && prevScrollY <= scrollY){
        var lastModel = self.collection.last();
        if (!lastModel) { return; }

        queryParams = { };
        queryParams[self.options.param] = lastModel.get(self.options.untilAttr);

        self.disableFetch();
        self.collection.fetch({
          success: self.fetchSuccess,
          error: self.fetchError,
          add: self.options.add,
          data: queryParams
        });
      }
      prevScrollY = scrollY;
    };

    initialize();

    return self;
  };
}).call(this);
