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


        it("correctly handle NaNs", function() {
            scope.number = 0 / 0; // will be NaN;
            scope.counter = 0;

            scope.$watch(
                function(scope) {
                    return scope.number;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("executes $eval'ed function and returns result", function() {
            scope.aValue = 42;
            var result = scope.$eval(function(scope) {
                console.log(arguments);
                return scope.aValue;
            });
            expect(result).toBe(42);
        });

        it("passes the second (and more) $eval argument straight through", function() {
            scope.aValue = 42;
            var result = scope.$eval(function(scope, arg) {
                console.log(arg);
                return scope.aValue + arg;
            }, 2);
            expect(result).toBe(44);

            result = scope.$eval(function(scope, arg1, arg2) {
                return scope.aValue + arg1 + arg2;
            }, 1, 2);
            expect(result).toBe(45);

            result = scope.$eval(function(scope, arg1, arg2, arg3) {
                var sum = arg3.reduce(function(a, b) {
                    return a + b;
                });
                return scope.aValue + arg1 + arg2 + sum;
            }, 1, 2, [0, 5]);
            expect(result).toBe(50);
        });

        it("executes $apply'ed function and starts the digest", function() {
            scope.aValue = 'someValue';
            scope.counter = 0;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$apply(function(scope) {
                scope.aValue = 'someOtherValue';
            });
            expect(scope.counter).toBe(2);
        });

        it("executes $evalAsync'ed function later in the same cycle", function() {
            scope.aValue = [1, 2, 3];
            scope.asyncEvaluated = false;
            scope.asyncEvaluatedImmediately = false;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.$evalAsync(function(scope) {
                        scope.asyncEvaluated = true;
                    });
                    scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
                }
            );
            scope.$digest();
            expect(scope.asyncEvaluated).toBe(true);
            expect(scope.asyncEvaluatedImmediately).toBe(false);
        });

        it("executes $evalAsync'ed functions added by watch functions", function() {
            scope.aValue = [1, 2, 3];
            scope.asyncEvaluated = false;
            scope.$watch(
                function(scope) {
                    if (!scope.asyncEvaluated) {
                        scope.$evalAsync(function(scope) {
                            scope.asyncEvaluated = true;
                        });
                    }
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {}
            );
            scope.$digest();
            expect(scope.asyncEvaluated).toBe(true);
        });

        it("executes $evalAsync'ed functions even when not dirty", function() {
            scope.aValue = [1, 2, 3];
            scope.asyncEvaluatedTimes = 0;
            scope.$watch(
                function(scope) {
                    if (scope.asyncEvaluatedTimes < 2) {
                        scope.$evalAsync(function(scope) {
                            scope.asyncEvaluatedTimes++;
                        });
                    }
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {}
            );
            scope.$digest();
            expect(scope.asyncEvaluatedTimes).toBe(2);
        });

        it("eventually halts $evalAsyncs added by watches", function() {
            scope.aValue = [1, 2, 3];
            scope.$watch(
                function(scope) {
                    scope.$evalAsync(function(scope) {});
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {}
            );
            expect(function() {
                scope.$digest();
            }).toThrow();
        });

        it("has a $$phase field whose value is the current digest phase", function() {
            scope.aValue = [1, 2, 3];
            scope.phaseInWatchFunction = undefined;
            scope.phaseInListenerFunction = undefined;
            scope.phaseInApplyFunction = undefined;
            scope.$watch(
                function(scope) {
                    scope.phaseInWatchFunction = scope.$$phase;
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.phaseInListenerFunction = scope.$$phase;
                }
            );
            scope.$apply(function(scope) {
                scope.phaseInApplyFunction = scope.$$phase;
            });
            expect(scope.phaseInWatchFunction).toBe('$digest');
            expect(scope.phaseInListenerFunction).toBe('$digest');
            expect(scope.phaseInApplyFunction).toBe('$apply');
        });

        it('allow async apply with $applyAsync', function(done) {
            scope.counter = 0;

            scope.$watch(
                function watchExpr(scope) {
                    return scope.aValue;
                },
                function listener(newValue, oldValue, scope) {
                    scope.counter++;
                });

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$applyAsync(function(scope) {
                scope.aValue = 'abc';
            });
            expect(scope.counter).toBe(1);

            setTimeout(
                function() {
                    expect(scope.counter).toBe(2);
                    done();
                }, 50);
        });

        it("never executes $applyAsync'ed function in the same cycle", function(done) {
            scope.aValue = [1, 2, 3];
            scope.asyncApplied = false;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.$applyAsync(function(scope) {
                        scope.asyncApplied = true;
                    });
                }
            );
            scope.$digest();
            expect(scope.asyncApplied).toBe(false);
            setTimeout(function() {
                expect(scope.asyncApplied).toBe(true);
                done();
            }, 50);
        });
        
    });

})();
