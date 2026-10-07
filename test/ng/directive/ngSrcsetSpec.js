'use strict';

/* eslint-disable no-script-url */

describe('ngSrcset', function() {
  var element;

  afterEach(function() {
    dealoc(element);
  });

  it('should not result empty string in img srcset', inject(function($rootScope, $compile) {
    $rootScope.image = {};
    element = $compile('<img ng-srcset="{{image.url}} 2x">')($rootScope);
    $rootScope.$digest();
    expect(element.attr('srcset')).toBeUndefined();
  }));

  it('should sanitize good urls', inject(function($rootScope, $compile) {
    $rootScope.imageUrl = 'http://example.com/image1.png 1x, http://example.com/image2.png 2x';
    element = $compile('<img ng-srcset="{{imageUrl}}">')($rootScope);
    $rootScope.$digest();
    expect(element.attr('srcset')).toBe('http://example.com/image1.png 1x,http://example.com/image2.png 2x');
  }));

  it('should sanitize evil url', inject(function($rootScope, $compile) {
    $rootScope.imageUrl = 'http://example.com/image1.png 1x, javascript:doEvilStuff() 2x';
    element = $compile('<img ng-srcset="{{imageUrl}}">')($rootScope);
    $rootScope.$digest();
    expect(element.attr('srcset')).toBe('http://example.com/image1.png 1x,unsafe:javascript:doEvilStuff() 2x');
  }));

  it('should sanitize urls separated by long whitespace runs in linear time (ReDoS)', inject(function($rootScope, $compile) {
    // A long run of whitespace that is not followed by a descriptor and a comma caused
    // catastrophic backtracking in the regular expression previously used to split srcset.
    var whitespace = new Array(60001).join(' ');
    $rootScope.imageUrl = 'http://example.com/image1.png 1x, javascript:doEvilStuff()' + whitespace + '2x';
    element = $compile('<img ng-srcset="{{imageUrl}}">')($rootScope);

    var start = Date.now();
    $rootScope.$digest();
    var duration = Date.now() - start;

    expect(element.attr('srcset')).toBe('http://example.com/image1.png 1x,unsafe:javascript:doEvilStuff() 2x');
    expect(duration).toBeLessThan(1000);
  }));

  it('should not throw an error if undefined', inject(function($rootScope, $compile) {
    element = $compile('<img ng-attr-srcset="{{undefined}}">')($rootScope);
    $rootScope.$digest();
  }));

  it('should interpolate the expression and bind to srcset', inject(function($compile, $rootScope) {
    var element = $compile('<img ng-srcset="some/{{id}} 2x"></div>')($rootScope);

    $rootScope.$digest();
    expect(element.attr('srcset')).toBeUndefined();

    $rootScope.$apply(function() {
      $rootScope.id = 1;
    });
    expect(element.attr('srcset')).toEqual('some/1 2x');

    dealoc(element);
  }));
});
