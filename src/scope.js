/* jshint globalstrict: true */
'use strict';

// Since js function equals nothing BUT ITSELF, we can create and use a dum function as an initial value.
function initVal() {}

function Scope() {

    this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
    this.$$watchers.push({
        watchFn: watchFn,
        listenerFn: listenerFn,
        last: initVal
    });
};
Scope.prototype.$$digestOnce = function() {
    var self = this;
    var newValue, oldValue, dirty;
    _.forEach(this.$$watchers, function(watcher) {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;
        if (newValue !== oldValue) {
            dirty = true;
            watcher.last = newValue;
            if (typeof watcher.listenerFn === 'function') {
                watcher.listenerFn(
                    newValue,
                    oldValue === initVal ? newValue : oldValue,
                    self);
            }
        }
    });
    return dirty;
};
Scope.prototype.$digest = function() {
    var dirty;
    do {
        dirty = this.$$digestOnce();
    }
    while (dirty);
};
