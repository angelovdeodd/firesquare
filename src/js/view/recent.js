define([
  'text!template/recent.html',
  'text!template/checkin.html',
  'view/drawer',
  'view/venue',
  'view/searchVenue',
  'collection/recent',
  'model/venue'
], function (template, checkinTemplate, Drawer, Venue, SearchVenue, Recent, VenueModel) {
  'use strict';
  var _drawer,
    _recent,
    _fetch,
    _remove,
    _add,
    _update;

  function _searchVenue(event) {
    event.preventDefault();
    return new SearchVenue(_drawer);
  }

  /**
    method is called when Login object is initialised.

    @method _initialize
    @namespace View
    @for Recent
    @static
    @private
  */
  function _initialize() {
    _drawer = new Drawer(_remove, _update);
    _drawer.setTitle('Recent checkins');
    _drawer.setContent(_.template(template));

    _recent = new Recent();
    _recent.on('add', _add);
    _fetch = _recent.fetch();

    $('.update').on('click', _update);
    $('body > section > header').prepend('<menu type="toolbar"><a href="#"><span class="icon icon-add">add</span></a></menu>');
    $('body > section > header > menu > a').on('click', _searchVenue);
  }

  /**
    method is called when user click's on update button.

    @method _update
    @for Recent
    @static
    @private
  */
  _update = function () {

    function _success() {
      $('p[role="status"]').hide('fast');
    }

    function _error() {
      var _text = $('p[role="status"] > span').text();
      $('p[role="status"] > span').text('Update failed!');
      $('p[role="status"]').hide('slow', function () {
        $('p[role="status"] > span').text(_text);
      });
    }

    $('div[role="main"]').scrollTop(0);
    $('p[role="status"]').show('fast', function () {
      if (_fetch !== undefined &&
          typeof (_fetch.abort) === 'function') {
        _fetch.abort();
      }
      _fetch = _recent.fetch({
        remove: false,
        success: _success,
        error: _error
      });
    });
  };

  function _showVenue(element) {
    element.preventDefault();

    return new Venue(
      new VenueModel(
        _recent.get($(element.currentTarget).attr('id')).get('venue')
      ),
      _drawer
    );
  }

  /**
    method is called when new object is added to checkin's collection.

    @method _add
    @for Recent
    @static
    @private
  */
  _add = function (checkin) {

    //check before each element should be put new element.
    $('.recent li').each(function() {
      if ($('.recent li[created-at="' + parseInt(checkin.get('createdAt'), 10) + '"]').get(0) === undefined &&
          parseInt($(this).attr('created-at'), 10) < parseInt(checkin.get('createdAt'), 10)) {
        $(this).before(_.template(checkinTemplate, checkin));
        return;
      }
    });

    //if element is not yet in DOM it should be put at the end of the list
    if ($('.recent li[created-at="' + parseInt(checkin.get('createdAt'), 10) + '"]').get(0) === undefined) {
      $('.recent').append(_.template(checkinTemplate, checkin));
    }

    //Add on click event
    $('.recent li').off('click', _showVenue);
    $('.recent li').on('click', _showVenue);
  };

  /**
    method removes Recent from DOM and unbinds events.

    @method _remove
    @for Recent
    @static
    @private
  */
  _remove = function () {
    if (_fetch !== undefined &&
        typeof (_fetch.abort) === 'function') {
      _fetch.abort();
    }
    _recent.off('add', _add);
    $('body > section > header > menu > a').off('click', _searchVenue);
    $('body > section > header > menu').remove();
    $('.recent li').off('click', _showVenue);
  };

  /**
    Recent view that is extension of [Backbone.View](http://backbonejs.org/#View).

    @class Recent
    @namespace View
    @extends Backbone.View
  */
  return Backbone.View.extend({
    initialize: _initialize,
    remove:     _remove
  });
});
