(function() {
    'use strict';

    describe('Scope', function() {
        it('can be constructed and used as an object', function() {
            var scope = new Scope();
            scope.prop1 = 1;
            expect(scope.prop1).toBe(1);
        });
    });

    describe('digest', function() {
        var scope;

        beforeEach(function() {
            scope = new Scope();
        });

        it('calls listener function of a watch on first $digest', function() {

            var watchFn = function() {
                return 'wat';
            };

            var listenerFn = jasmine.createSpy();

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(listenerFn).toHaveBeenCalled();
        });

        it('calls the watch function with the scope as the argument', function() {

            var watchFn = jasmine.createSpy();

            var listenerFn = function() {};

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(watchFn).toHaveBeenCalledWith(scope);
        });

        it('calls the listener function when the watched value changes', function() {
            scope.someVal = 'a';
            scope.counter = 0;

            scope.$watch(
                function watcher() {
                    return scope.someVal;
                },
                function listener(newVal, oldVal, scope) {
                    scope.counter++;
                });

            // At first, scope does not have someVal property
            expect(scope.counter).toBe(0);

            scope.$digest();
            expect(scope.counter).toBe(1);

            // Nothing change
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.someVal = 'b';
            scope.$digest();
            expect(scope.counter).toBe(2);
        });

        it('calls when watch value is at first "undefined"', function() {
            scope.counter = 0;
            scope.$watch(
                function watcher() {
                    return scope.someVal;
                },
                function listener() {
                    scope.counter++;
                }
            );

            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it('calls listener with new value as old value the first time', function() {
            scope.someVal = 123;
            var oldValGiven;
            scope.$watch(
                function watcher() {
                    return scope.someVal;
                },
                function listener(newVal, oldVal, scope) {
                    oldValGiven = oldVal;
                }
            );

            scope.$digest();
            expect(oldValGiven).toBe(123);
        });

        it('may have watcher that does not come with listener funciton', function() {

            var watchFn = jasmine.createSpy().and.returnValue('something');

            scope.$watch(watchFn);

            scope.$digest();

            expect(watchFn).toHaveBeenCalled();
        });

        it('triggers chained watchers in the same digest', function() {
            scope.name = 'Jane';

            scope.$watch(
                function watch() {
                    return scope.nameUpper;
                },
                function(newVal, oldVal, scope) {
                    if (newVal) {
                        scope.initial = newVal.substring(0, 1) + '.';
                    }
                });

            scope.$watch(
                function watch() {
                    return scope.name;
                },
                function(newVal, oldVal, scope) {
                    if (newVal) {
                        scope.nameUpper = newVal.toUpperCase();
                    }
                });

            scope.$digest();
            expect(scope.initial).toBe('J.');

            scope.name = 'Bob';
            scope.$digest();
            expect(scope.initial).toBe('B.');
        });

        it('gives up on watches upon 10 iterations', function() {
            scope.valA = 0;
            scope.valB = 0;

            scope.$watch(
                function watcher() {
                    return scope.valB;
                },
                function listener(newVal, oldVal, scope) {
                    scope.valA++;
                }
            );

            scope.$watch(
                function watcher() {
                    return scope.valA;
                },
                function listener(newVal, oldVal, scope) {
                    scope.valB++;
                }
            );

            expect((function() {
                scope.$digest();
            })).toThrow();
        });

        it('ends the digest when the last watch is clean', function() {
            scope.array = _.range(100);
            var watchExecutions = 0;

            _.times(100, function(i) {
                scope.$watch(
                    function watch(scope) {
                        watchExecutions++;
                        return scope.array[i];
                    },
                    function listender(newVal, oldVal, scope) {

                    });
            });

            scope.$digest();
            expect(watchExecutions).toBe(200);

            scope.array[0] = 420;
            scope.$digest();
            expect(watchExecutions).toBe(301);
        });

        it("does not end digest so that new watches are not run", function() {
            scope.aValue = 'abc';
            scope.counter = 0;

            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.$watch(
                        function(scope) {
                            return scope.aValue;
                        },
                        function(newValue, oldValue, scope) {
                            scope.counter++;
                        }
                    );
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("compares based on value if enabled", function() {
            scope.aValue = [1, 2, 3];
            scope.counter = 0;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                },
                true
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
            
            scope.aValue.push(4);
            scope.$digest();
            expect(scope.counter).toBe(2);
        });

    });

})();
