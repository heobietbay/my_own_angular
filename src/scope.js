/* jshint globalstrict: true */
'use strict';

// Since js function equals nothing BUT ITSELF, we can create and use a dum function as an initial value.
function initVal() {}

function lastDirtyWatchInitVal() {}

function Scope() {
    this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn, deepCompare) {
    // Give lastDirtyWatch an initial value
    this.$$lastDirtyWatch = lastDirtyWatchInitVal;
    this.$$watchers.push({
        watchFn: watchFn,
        listenerFn: listenerFn,
        last: initVal,
        deepCompare: !!deepCompare
    });
};

Scope.prototype.$apply = function(expr) {
    try {
        return this.$eval(expr);
    } finally {
        this.$digest();
    }
};

Scope.prototype.$eval = function(expr) {
    // Read more about apply here : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
    // for $eval, the arguments is something like this: [expr,arg1,args...]
    // We only want to pass the scope, as well as arg1, arg2 to expr
    // since in $eval, scope is this, we will do something like below
    return expr.apply(null, [this].concat(Array.prototype.slice.call(arguments, 1)));
};

Scope.prototype.$digest = function() {
    var dirty;
    var maxDigestIteration = 10;
    do {
        dirty = this.$$digestOnce();
        maxDigestIteration--;

        if (dirty && maxDigestIteration === 0) {
            throw "10 iteration for digesting reached.";
        }
    }
    while (dirty);
    // reset lastDirtyWatch
    this.$$lastDirtyWatch = lastDirtyWatchInitVal;
};

Scope.prototype.$$digestOnce = function() {
    var self = this;
    var newValue, oldValue, dirty;
    _.forEach(this.$$watchers, function(watcher) {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;
        if (!self.$$areEqual(newValue, oldValue, watcher.deepCompare)) {
            dirty = true;
            self.$$lastDirtyWatch = watcher;
            watcher.last = (watcher.deepCompare ? _.cloneDeep(newValue) : newValue);
            if (typeof watcher.listenerFn === 'function') {
                watcher.listenerFn(
                    newValue,
                    oldValue === initVal ? newValue : oldValue,
                    self);
            }
        } else // clean watch encounter
        {
            if (self.$$lastDirtyWatch === watcher) {
                return false;
            }
        }
    });
    return dirty;
};

Scope.prototype.$$areEqual = function(newValue, oldValue, deepCompare) {
    if (deepCompare) {
        return _.isEqual(newValue, oldValue);
    } else {
        if (typeof newValue === 'number' && typeof oldValue === 'number' && isNaN(newValue) && isNaN(oldValue))
            return true;
        return newValue === oldValue;
    }
};
