angular.module("fileInputDirective", [])

.directive('fileInput', ['$parse', function($parse) {
    return {
      require: "ngModel",
      link: function postLink(scope,elem,attrs,ngModel) {
        elem.on("change", function(e) {
          var file = elem[0].files[0];
          //var parsedFile = $parse(file);
          ngModel.$setViewValue(file);
        })
      }
    }
}]);
/*
.directive('fileInputUpload', ['$parse', function ($parse) {
    return {
      restrict: 'A', // restrict to attributes
      link: function(scope, element, attrs) {
          var parsedFile = $parse(attrs.fileInputUpload);    // var to save parsed file
          var parsedFileSetter = parsedFile.assign;

          element.bind('change', function() {     // any time the element changes, parse the file and update the scope
              scope.$apply(function() {     //do the update
                  parsedFileSetter(scope, element[0].files[0]);   // take first element in file list of file input(which is a file)
              });
          });
      }
    };
}]);
*/
