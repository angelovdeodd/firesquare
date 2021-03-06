define([
  'model/service'
], function (service) {
  'use strict';

  /**
    Venue model that is extension of [Backbone.Model](http://backbonejs.org/#Model).

    @class Venue
    @namespace Model
    @extends Backbone.Model
  */
  return Backbone.Model.extend({
    /**
      Overrides default model `urlRoot`.

      @method urlRoot
      @return {String} Recent model API endpoint with current access_token and object id.
    */
    urlRoot: function() {
      return 'https://api.foursquare.com/v2/venues/'
        + this.get('id') + '?oauth_token=' + service.foursquare.get('access_token') + '&';
    },
    /**
      Overrides default model `parse` function. Data returned form foursquare API endpoint differs from backbone expectations.

      @method parse
      @param {Object} data
      @return {Object} User object.
    */
    parse: function(data) {
      //when data is from service it has response that contains true data
      if (data.response !== undefined) {
        return data.response.venue;
      }
      //when data is just data
      return data;
    },
    /**
      Preforms the checkin action.

      @method checkin
      @param {function} success callback
      @param {function} error callback
    */
    checkin: function(success, error) {
      return $.ajax({
        url: 'https://api.foursquare.com/v2/checkins/add',
        data: {
          venueId:      this.get('id'),
          oauth_token:  service.foursquare.get('access_token')//,
          //TODO: shout:        'Nie ma mnie tu! - to tylko test!'
        },
        success: success,
        error: error,
        type: 'POST'
      });
    }
  });

});
