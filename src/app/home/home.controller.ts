/// <reference path="../../types/types.ts"/>


class HomeController implements core.IHomeController {
  greeting: string;

  /* @ngInject */
  constructor(private $scope: ng.IScope, private $location: ng.ILocationService) {
    $scope.greeting = "hello 2";

    $scope.$watch(function() { return $location.search(); }, function () {
      $scope.greeting = $location.search()[ "greeting" ] || "";
    });

    $scope.$watch(function() { return $scope.greeting; }, function() {
      $location.search("greeting", $scope.greeting);
    });
  }
}

angular
  .module("home.index", [])
  .controller("HomeController", HomeController);
