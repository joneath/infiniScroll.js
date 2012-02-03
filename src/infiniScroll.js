// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT licence
// Version 0.1

(function() {
  Backbone.InfiniScroll = function(collection, options){
    options = options || { };

    var self = { },
        fetchOn,
        page;

    self.collection = collection;
    self.options = _.defaults(options, {
      success: function(){ },
      error: function(){ },
      param: "until",
      until_attr: "id",
      pageSize: 25,
      scrollOffset: 100,
      add: true
    });

    var initialize = function() {
      fetchOn = true;
      page = 1;

      $(window).on("scroll", self.watchScroll);
    };

    self.enableFetch = function() {
      fetchOn = true;
    };

    self.disableFetch = function() {
      fetchOn = false;
    };

    self.fetchSuccess = function(collection, response) {
      if (collection.length >= page * self.options.pageSize){
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
          scrollY = $(window).scrollTop() + $(window).height(),
          docHeight = $(document).height();

      if (scrollY >= docHeight - self.options.scrollOffset && fetchOn){
        queryParams = { };
        queryParams[self.options.param] = self.collection.last()[self.options.until_attr];

        self.disableFetch();
        self.collection.fetch({
          success: self.fetchSuccess,
          error: self.fetchError
        }, queryParams);
      }
    };

    initialize();

    return self;
  };
}).call(this);
