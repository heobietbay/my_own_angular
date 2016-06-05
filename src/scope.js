/* jshint globalstrict: true */
'use strict';

// Since js function equals nothing BUT ITSELF, we can create and use a dum function as an initial value.
function initVal() {}

function Scope() {

    this.$$watchers = [];
    this.$$lastDirtyWatch = function(){};
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
            self.$$lastDirtyWatch = watcher;
            watcher.last = newValue;
            if (typeof watcher.listenerFn === 'function') {
                watcher.listenerFn(
                    newValue,
                    oldValue === initVal ? newValue : oldValue,
                    self);
            }
        }
        else // clean watch encounter
        {
            if(self.$$lastDirtyWatch === watcher)
            {
                return false;
            }
        }
    });
    return dirty;
};

Scope.prototype.$digest = function() {
    var dirty;
    var maxDigestIteration = 10;
    this.$$lastDirtyWatch = function(){};
    do {
        dirty = this.$$digestOnce();
        maxDigestIteration--;

        if(dirty && maxDigestIteration === 0 )
        {
            throw "10 iteration for digesting reached."; 
        }
    }
    while (dirty);
};
