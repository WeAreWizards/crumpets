/// <reference path="../../types/types.ts" />

class MultifixDirective {

  static prefix(): ng.IDirective {
    var link = function(
      scope: ng.IScope,
      element: ng.IAugmentedJQuery,
      attrs: ng.IAttributes,
      controller: any
    ) {
      var prefixValue = attrs["wawPrefix"];

      var format = (value) => {
        return prefixValue + " " + value;
      };

      var parse = (value) => {
        var numberValue = parseFloat(value.replace(prefixValue, "")) || 0;
        controller.$setViewValue(format(numberValue));
        controller.$render();
        return numberValue;
      };

      controller.$formatters.push(format);
      controller.$parsers.push(parse);
    };

    return {
      restrict: "A",
      require: "ngModel",
      link: link
    };
  }

  // @vincent: not convinced about that one from a UX perspective
  static postfix(): ng.IDirective {
    var link = function(
      scope: ng.IScope,
      element: ng.IAugmentedJQuery,
      attrs: ng.IAttributes,
      controller: any
    ) {
      var postfixValue = attrs["wawPostfix"];

      var format = (value) => {
        return value + " " + postfixValue;
      };

      var parse = (value) => {
        // it will start with a number supposedly, parseFloat itself
        // should do the trick
        var numberValue = parseFloat(value) || 0;
        controller.$setViewValue(format(numberValue));
        controller.$render();
        return numberValue;
      };

      controller.$formatters.push(format);
      controller.$parsers.push(parse);
    };

    return {
      restrict: "A",
      require: "ngModel",
      link: link
    };
  }
}


angular
  .module("crumpets.directives", [])
  .directive("wawPrefix", MultifixDirective.prefix)
  .directive("wawPostfix", MultifixDirective.postfix);
