/* jshint globalstrict: true */
'use strict';

function Scope(){

  this.$$watchers = [];
}

Scope.prototype.$watch = function (watchFn,listenerFn) {
    this.$$watchers.push(
      {
        watchFn:watchFn,
        listenerFn:listenerFn
      }
    );
};
Scope.prototype.$digest = function () {
  var self = this;
  _.forEach(this.$$watchers,function(watcher){
       watcher.watchFn(self);
       watcher.listenerFn();
    });
};
