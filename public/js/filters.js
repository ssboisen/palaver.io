angular.module('palaver-filters', [])
    .filter('newline',function() {
        return function(text){
            return text.replace(/\r\n/g, '<br/>');
        };
    });