/// <reference path="../types/types.ts"/>


/* @ngInject */
function appConfig($urlRouterProvider: ng.ui.IUrlRouterProvider) {
  $urlRouterProvider.otherwise("/home");
}

angular
  .module("crumpets", [
    "templates",
    "crumpets.directives",
    "crumpets.home",
    "ui.router.state"
  ])
  .config(appConfig);
