angular.module('palaver-ui', [])
    .directive('ngAutoScroll', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

            var deregistration = scope.$watch(attrs.ngAutoScroll, function ngAutoScrollAction(){
                var jQueryElement = $(element);
                jQueryElement.animate({ scrollTop: jQueryElement.prop("scrollHeight") }, 1);
            }, true);

            element.bind('$destroy', function() {
                deregistration();
            });
        }
    };
    });