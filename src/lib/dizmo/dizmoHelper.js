/**
 * @class Controller used by dizmos that want to be controlled
 *
 * @description
 * This class provides a simple interface for any dizmo that has scenes and thus can be controlled by another dizmo, like the Navigator. It does not need to be instantiated and provides, through static functions and events, a common interface that can be used to listen to changes from the outside to step through scenes.
 * Although it does not need to be instantiated, it needs to be initialized (only once). By calling Dizmo.Presentation.Listener.initialize(eventObj), you will pass the event object you want all the events being attached to, to the class. Further usage does not need any other initialization and the class can be used by calling the functions in the same way as the initialize function has been called.
 */
Class('DizmoHelper.Presentation.Controller', {
    my: {
        has: {
            initialized: {
                is: 'rw',
                init: false
            },

            stepCallback: {
                is: 'rw',
                init: null,

                setterName: 'onStep'
            },

            nextStepCallback: {
                is: 'rw',
                init: null,

                setterName: 'onNextStep'
            },

            previousStepCallback: {
                is: 'rw',
                init: null,

                setterName: 'onPreviousStep'
            },

            lastStepCallback: {
                is: 'rw',
                init: null,

                setterName: 'onLastStep'
            },

            firstStepCallback: {
                is: 'rw',
                init: null,

                setterName: 'onFirstStep'
            },

            animationChangedCallback: {
                is: 'rw',
                init: null,

                setterName: 'onAnimationChanged'
            },

            globalTimerStoppedCallback: {
                is: 'rw',
                init: null,

                setterName: 'onGlobalTimerStopped'
            },

            globalTimerStartedCallback: {
                is: 'rw',
                init: null,

                setterName: 'onGlobalTimerStarted'
            }
        },

        methods: {
            /**
             * Initialize the controller. Only call this once, every additional call will be ignored.
             * @public
             */
            init: function() {
                var self = this;

                if (self.getInitialized()) {
                    return;
                }

                dizmo.publicStorage.setProperty('presentation/totalSteps', 0);
                dizmo.publicStorage.setProperty('presentation/step', 0);
                dizmo.publicStorage.setProperty('presentation/animationRunning', false);
                dizmo.publicStorage.setProperty('presentation/globalTimerRunning', false);
                dizmo.publicStorage.setProperty('presentation/hasGlobalTimer', false);

                self.initEvents();

                self.setInitialized(true);
            },

            /**
             * Initialize the events
             * @private
             */
            initEvents: function() {
                var self = this;

                var pubStore = dizmo.publicStorage;

                pubStore.subscribeToProperty('presentation/step', function(path, val, oldVal) {
                    var cb;
                    var step = parseInt(val);
                    var oldStep = parseInt(oldVal);
                    var maxSteps = dizmo.publicStorage.getProperty('presentation/totalSteps');
                    maxSteps = parseInt(maxSteps);

                    if (isNaN(step) || isNaN(maxSteps)) {
                        return;
                    }
                    if (step > maxSteps || step < 1) {
                        return;
                    }

                    if (isNaN(oldStep)) {
                        oldStep = 1;
                    }

                    cb = self.getStepCallback();
                    if (typeof cb === 'function') {
                        cb.call(self, step, oldStep);
                    }

                    if (step === 1) {
                        cb = self.getFirstStepCallback();
                        if (typeof cb === 'function') {
                            cb.call(self, step, oldStep);
                        }
                        return;
                    }
                    if (step >= maxSteps) {
                        cb = self.getLastStepCallback();
                        if (typeof cb === 'function') {
                            cb.call(self, step, oldStep);
                        }
                        return;
                    }
                    if (step < oldStep) {
                        cb = self.getPreviousStepCallback();
                        if (typeof cb === 'function') {
                            cb.call(self, step, oldStep);
                        }
                        return;
                    }
                    if (step > oldStep) {
                        cb = self.getNextStepCallback();
                        if (typeof cb === 'function') {
                            cb.call(self, step, oldStep);
                        }
                        return;
                    }
                });

                pubStore.subscribeToProperty('presentation/animationRunning', function(path, val, oldVal) {
                    var cb = self.getAnimationChangedCallback();

                    if (typeof oldVal === 'undefined') {
                        oldVal = 'false';
                    }

                    if (oldVal !== 'true' && oldVal !== 'false') {
                        oldVal = 'false';
                        return;
                    }

                    if (oldVal === val) {
                        return;
                    }

                    if (val === 'true') {
                        if (typeof cb === 'function') {
                            cb.call(self, 'finished');
                        }
                    } else if (val === 'false') {
                        if (typeof cb === 'function') {
                            cb.call(self, 'started');
                        }
                    } else {
                        console.log('The set animation value is wrong. It should be either true or false.');
                    }
                });

                pubStore.subscribeToProperty('presentation/globalTimerRunning', function(path, val, oldVal) {
                    if (!dizmo.publicStorage.getProperty('presentation/hasGlobalTimer')) {
                        console.log('You have to enable the global timer first!');
                        return;
                    }

                    var stoppedCallback = self.getGlobalTimerStoppedCallback();
                    var startedCallback = self.getGlobalTimerStartedCallback();

                    if (typeof oldVal === 'undefined') {
                        oldVal = 'false';
                    }

                    if (oldVal !== 'true' && oldVal !== 'false') {
                        oldVal = 'false';
                        return;
                    }

                    if (oldVal === val) {
                        return;
                    }

                    if (val === 'false') {
                        if (typeof stoppedCallback === 'function') {
                            stoppedCallback.call(self);
                        }
                    } else if (val === 'true') {
                        if (typeof startedCallback === 'function') {
                            startedCallback.call(self);
                        }
                    } else {
                        console.log('The global timer flag value is wrong. It should be either true or false.');
                        return;
                    }
                });
            },

            /**
             * Provide a function, which is called whenever a step occurs. The function provided receives
             * two parameters: The current step and the old step.
             * @param  {function} func The function to call
             * @public
             */
            onStep: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onStep callback!');
                    return;
                }

                self.stepCallback = func;
            },

            /**
             * Provide a function, which is called whenever the first step occurs. The function provided receives
             * two parameters: The current step and the old step.
             * @param  {function} func The function to call
             * @public
             */
            onFirstStep: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onFirstStep callback!');
                    return;
                }

                self.firstStepCallback = func;
            },

            /**
             * Provide a function, which is called whenever a previous step occurs. The function provided receives
             * two parameters: The current step and the old step.
             * @param  {function} func The function to call
             * @public
             */
            onPreviousStep: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onPreviousStep callback!');
                    return;
                }

                self.previousStepCallback = func;
            },

            /**
             * Provide a function, which is called whenever a next step occurs. The function provided receives
             * two parameters: The current step and the old step.
             * @param  {function} func The function to call
             * @public
             */
            onNextStep: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onNextStep callback!');
                    return;
                }

                self.nextStepCallback = func;
            },

            /**
             * Provide a function, which is called whenever the last step occurs. The function provided receives
             * two parameters: The current step and the old step.
             * @param  {function} func The function to call
             * @public
             */
            onLastStep: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onLastStep callback!');
                    return;
                }

                self.lastStepCallback = func;
            },

            /**
             * Provide a function, which is called whenever the animation change occurs. The function provided receives
             * one parameter: The current state of the animation, either 'finished' or 'started'.
             * @param  {function} func The function to call
             * @public
             */
            onAnimationChanged: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onAnimationChanged callback!');
                    return;
                }

                self.animationChangedCallback = func;
            },

            /**
             * Provide a function, which is called whenever the global timer has been started.
             * @param  {function} func The function to call
             * @public
             */
            onGlobalTimerStarted: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onGlobalTimerStarted callback!');
                    return;
                }

                self.globalTimerStartedCallback = func;
            },

            /**
             * Provide a function, which is called whenever the global timer has been stopped.
             * @param  {function} func The function to call
             * @public
             */
            onGlobalTimerStopped: function(func) {
                var self = this;

                if (typeof func !== 'function') {
                    console.log('Please provide a function as the onGlobalTimerStopped callback!');
                    return;
                }

                self.globalTimerStoppedCallback = func;
            },

            /**
             * Set the total steps available for this dizmo
             * @param {Number} steps The total number of steps available
             * @public
             */
            setTotalSteps: function(steps) {
                steps = parseInt(steps);

                if (isNaN(steps)) {
                    throw {
                        'name': 'NotANumberError',
                        'message': 'Please provide a number as the total steps!'
                    };
                }

                dizmo.publicStorage.setProperty('presentation/totalSteps', steps);
            },

            /**
             * @return {Number} The total number of steps available to this dizmo
             * @public
             */
            getTotalSteps: function() {
                var totalSteps = dizmo.publicStorage.getProperty('presentation/totalSteps');
                totalSteps = parseInt(totalSteps);

                if (isNaN(totalSteps)) {
                    return 0;
                }

                return totalSteps;
            },

            /**
             * Set the current step of the dizmo
             * @param {Number} step The current step
             * @public
             */
            setStep: function(step) {
                step = parseInt(step);

                if (isNaN(step)) {
                    throw {
                        'name': 'NotANumberError',
                        'message': 'Please provide a number as a step!'
                    };
                }

                dizmo.publicStorage.setProperty('presentation/step', step);
            },

            /**
             * Get the current step
             * @return {Number} The current step
             * @public
             */
            getStep: function() {
                var step = dizmo.publicStorage.getProperty('presentation/step');
                step = parseInt(step);

                if (isNaN(step)) {
                    return 0;
                }

                return step;
            },

            /**
             * Go to the first step
             * @public
             */
            firstStep: function() {
                var self = this;

                self.setStep(1);
            },

            /**
             * Go to the previous step
             * @public
             */
            previousStep: function() {
                var self = this;

                var step = dizmo.publicStorage.getProperty('presentation/step');
                step = parseInt(step);

                if (isNaN(step)) {
                    throw {
                        'name': 'NotANumberError',
                        'message': 'The step property does not seem to be a number!'
                    };
                }

                if (step - 1 <= 1) {
                    self.firstStep();
                    return;
                }

                self.setStep(--step);
            },

            /**
             * Go to the next step
             * @public
             */
            nextStep: function() {
                var self = this;

                var step = dizmo.publicStorage.getProperty('presentation/step');
                var totalSteps = dizmo.publicStorage.getProperty('presentation/totalSteps');
                step = parseInt(step);
                totalSteps = parseInt(totalSteps);

                if (isNaN(step) || isNaN(totalSteps)) {
                    throw {
                        'name': 'NotANumberError',
                        'message': 'The step property does not seem to be a number!'
                    };
                }

                if (step + 1 >= totalSteps) {
                    self.lastStep();
                    return;
                }

                self.setStep(++step);
            },

            /**
             * Go to the last step
             * @public
             */
            lastStep: function() {
                var self = this;

                var totalSteps = dizmo.publicStorage.getProperty('presentation/totalSteps');
                totalSteps = parseInt(totalSteps);

                if (isNaN(totalSteps)) {
                    throw {
                        'name': 'NotANumberError',
                        'message': 'The total steps property does not seem to be a number!'
                    };
                }

                self.setStep(totalSteps);
            },

            /**
             * Start the animation
             * @public
             */
            startAnimation: function() {
                dizmo.publicStorage.setProperty('presentation/animationRunning', true);
            },

            /**
             * End the animation
             * @public
             */
            stopAnimation: function() {
                dizmo.publicStorage.setProperty('presentation/animationRunning', false);
            },

            /**
             * @return {Boolean} Returns wether the global timer is running or not.
             * @public
             */
            globalTimerRunning: function() {
                var globalTimer = dizmo.publicStorage.getProperty('presentation/globalTimerRunning');
                return globalTimer;
            },

            /**
             * Start the global timer.
             * @public
             */
            startGlobalTimer: function() {
                if (!dizmo.publicStorage.getProperty('presentation/hasGlobalTimer')) {
                    console.log('You have to enable the global timer first!');
                    return;
                }

                dizmo.publicStorage.setProperty('presentation/globalTimerRunning', true);
            },

            /**
             * Stop the global timer.
             * @public
             */
            stopGlobalTimer: function() {
                if (!dizmo.publicStorage.getProperty('presentation/hasGlobalTimer')) {
                    console.log('You have to enable the global timer first!');
                    return;
                }

                dizmo.publicStorage.setProperty('presentation/globalTimerRunning', false);
            },

            /**
             * Set the flag for the global timer usage. This has to be true for the global timer callback working when
             * controlled from another dizmo.
             * @param {Boolean} value True or false for global timer flag
             * @public
             */
            setGlobalTimer: function(value) {
                if (typeof value !== 'boolean') {
                    value = false;
                }

                if (value) {
                    dizmo.publicStorage.setProperty('presentation/hasGlobalTimer', true);
                } else {
                    dizmo.publicStorage.setProperty('presentation/hasGlobalTimer', false);
                }
            },

            /**
             * @return {Boolean} The state of the global timer flag.
             * @public
             */
            hasGlobalTimer: function() {
                var value = dizmo.publicStorage.getProperty('presentation/hasGlobalTimer');

                return value;
            }
        }
    }
});

/**
 * @class Controller class for remote dizmos
 *
 * @description
 * Every dizmo that wants to control another dizmo through the presentation properties can use this class. It is designed to allow easy access to stepping through scenes of another dizmo and provide a common interface for things like animation running flags and total steps inside another dizmo. The Navigator for example makes heavy use of this class. It needs to be instantiated with the dizmo that should be controlled. If one wants to be notified of changes to the animation property of the controlled dizmo, one can provide the onAnimationChanged property with a function.
 */
Class('DizmoHelper.Presentation.RemoteController', {
    has: {
        dizmo: {
            is: 'rw',
            init: null
        },

        totalSteps: {
            is: 'rw',
            init: 0
        },

        step: {
            is: 'rw',
            init: 0,

            getterName: 'getStep',
            setterName: 'setStep'
        },

        animationChangedCallback: {
            is: 'rw',
            init: null
        },

        globalTimerStoppedCallback: {
            is: 'rw',
            init: null
        },

        globalTimerStartedCallback: {
            is: 'rw',
            init: null
        }
    },

    after: {
        /**
         * Control another dizmo with this class. The dizmo is provided through the
         * config object.
         * @param  {Object} config The configuration for the controller
         *                         {
         *                             dizmo:                {Object}   The dizmo which needs to be controlled
         *                             onAnimationChanged:   {Function} A function that is called when the animation has changed.
         *                                                              Receives the state as the parameter: 'strted' or 'finished'.
         *                             onGlobalTimerStarted: {Function} A function that is called when the global timer
         *                                                              of the controlled dizmo has started running.
         *                             onGlobalTimerStopped: {Function} A function that is called when the global timer
         *                                                              of the controlled dizmo has stopped running.
         *                         }
         * @constructs
         */
        initialize: function(config) {
            var self = this;
            var totalSteps = null;
            var step = null;

            if (typeof config.dizmo !== 'object') {
                console.log('You need to provide a dizmo object.');
                return null;
            }

            if (typeof config.onAnimationChanged === 'function') {
                self.setAnimationChangedCallback(config.onAnimationChanged);
            }

            if (typeof config.onGlobalTimerStarted === 'function') {
                self.setGlobalTimerStartedCallback(config.onGlobalTimerStarted);
            }

            if (typeof config.onGlobalTimerStopped === 'function') {
                self.setGlobalTimerStoppedCallback(config.onGlobalTimerStopped);
            }

            self.setDizmo(config.dizmo);

            totalSteps = self.getDizmo().publicStorage.getProperty('presentation/totalSteps');
            if (typeof totalSteps !== 'undefined') {
                totalSteps = parseInt(totalSteps);
                if (!isNaN(totalSteps)) {
                    self.setTotalSteps(totalSteps);
                }
            }

            step = self.getDizmo().publicStorage.getProperty('presentation/step');
            if (typeof step !== 'undefined') {
                step = parseInt(step);
                if (!isNaN(step)) {
                    self.setStep(step);
                }
            }

            self.initEvents();
        }
    },

    methods: {
        /**
         * Initialize all the events
         * @private
         */
        initEvents: function() {
            var self = this;

            var dizmo = self.getDizmo();
            var pubStore = dizmo.publicStorage;

            pubStore.subscribeToProperty('presentation/totalSteps', function(path, val, oldVal) {
                var steps = parseInt(val);

                if (isNaN(steps)) {
                    self.setTotalSteps(0);
                }

                self.setTotalSteps(steps);
            });

            pubStore.subscribeToProperty('presentation/step', function(path, val, oldVal) {
                var step = parseInt(val);

                if (isNaN(step)) {
                    self.step = 0;
                }

                self.step = step;
            });

            pubStore.subscribeToProperty('presentation/animationRunning', function(path, val, oldVal) {
                var cb = self.getAnimationChangedCallback();

                if (typeof oldVal === 'undefined') {
                    oldVal = 'false';
                }

                if (oldVal !== 'true' && oldVal !== 'false') {
                    oldVal = 'false';
                    return;
                }

                if (oldVal === val) {
                    return;
                }

                if (val === 'true') {
                    if (typeof cb === 'function') {
                        cb.call(self, 'finished');
                    }
                } else if (val === 'false') {
                    if (typeof cb === 'function') {
                        cb.call(self, 'started');
                    }
                } else {
                    console.log('The set animation value is wrong. It should be either true or false.');
                }
            });

            pubStore.subscribeToProperty('presentation/globalTimerRunning', function(path, val, oldVal) {
                if (!self.hasGlobalTimer()) {
                    console.log('You have to enable the global timer first!');
                    return;
                }

                var stoppedCallback = self.getGlobalTimerStoppedCallback();
                var startedCallback = self.getGlobalTimerStartedCallback();

                if (typeof oldVal === 'undefined') {
                    oldVal = 'false';
                }

                if (oldVal !== 'true' && oldVal !== 'false') {
                    oldVal = 'false';
                    return;
                }

                if (oldVal === val) {
                    return;
                }

                if (val === 'false') {
                    if (typeof stoppedCallback === 'function') {
                        stoppedCallback.call(self);
                    }
                } else if (val === 'true') {
                    if (typeof startedCallback === 'function') {
                        startedCallback.call(self);
                    }
                } else {
                    console.log('The global timer flag value is wrong. It should be either true or false.');
                    return;
                }
            });
        },

        /**
         * Set the step to this value
         * @param {Number/String} step The step to set the controlled dizmo to. Can either be
         *                             a number or a number as a string.
         * @public
         */
        setStep: function(step) {
            var self = this;

            step = parseInt(step);

            if (isNaN(step)) {
                console.log('The provided step parameter is neither a number nor a valid string.');
                return;
            }
            if (step > self.getTotalSteps()) {
                console.log('The provided step is bigger than the total steps accepter by this dizmo');
                return;
            }

            self.getDizmo().publicStorage.setProperty('presentation/step', step);
            self.step = step;
        },

        /**
         * @return {Number} The current step
         * @public
         */
        getStep: function() {
            var self = this;

            return self.step;
        },

        /**
         * Go to the first step of the dizmo
         * @public
         */
        firstStep: function() {
            var self = this;

            var dizmo = self.getDizmo();
            var step = self.getStep();

            if (step === 0) {
                return;
            }

            self.setStep(1);
        },

        /**
         * Go the the previous step of the dizmo
         * @public
         */
        previousStep: function() {
            var self = this;

            var dizmo = self.getDizmo();
            var step = self.getStep();

            if (step - 1 === 0) {
                self.firstStep();
                return;
            }

            self.setStep(--step);
        },

        /**
         * Go to the next step of the dizmo
         * @public
         */
        nextStep: function() {
            var self = this;

            var dizmo = self.getDizmo();
            var step = self.getStep();
            var totalSteps = self.getTotalSteps();

            if (step + 1 === totalSteps) {
                self.lastStep();
                return;
            }

            self.setStep(++step);
        },

        /**
         * Go the the last step of the dizmo
         * @public
         */
        lastStep: function() {
            var self = this;

            var dizmo = self.getDizmo();
            var step = self.getStep();
            var totalSteps = self.getTotalSteps();

            if (step === totalSteps) {
                return;
            }

            self.setStep(totalSteps);
        },

        /**
         * Start the global timer of the controlled dizmo
         */
        stopGlobalTimer: function() {
            var self = this;

            self.getDizmo().publicStorage.setProperty('presentation/globalTimerRunning', 'false');
        },

        /**
         * Stop the global timer of the controlled dizmo
         */
        startGlobalTimer: function() {
            var self = this;

            self.getDizmo().publicStorage.setProperty('presentation/globalTimerRunning', 'true');
        },

        /**
         * @return {Boolean} Return wether the controlled dizmo has a global timer or not
         */
        hasGlobalTimer: function() {
            var self = this;

            var value = self.getDizmo().publicStorage.getProperty('presentation/hasGlobalTimer');
            if (value === 'true') {
                return true;
            } else {
                return false;
            }
        },

        globalTimerRunning: function() {
            var self = this;

            var value = self.getDizmo().publicStorage.getProperty('presentation/globalTimerRunning');
            if (value === 'true') {
                return true;
            } else {
                return false;
            }
        }
    }
});

/**
 * @class Utils class for some simple tasks
 *
 * @description
 * This class is already instantiated and can be access through the global object "utils". It offer a few simple functions like randomized strings and the position of a dizmo to another dizmo. There might be more added to this class as the development continues.
 */
Class('DizmoHelper.Utils', {
    my: {
        methods: {
            /**
             * Get the side on which the docked dizmo has docked.
             * @param  {Object} otherDizmo A complete dizmo object (as provided by onDock, onUndock, canDock)
             * @return {String}            A string with either 'left', 'right', 'top', 'bottom'
             */
            getDizmoPosition: function(mydizmo, otherdizmo) {
                var myRight = null;
                var myLeft = null;
                var myTop = null;
                var myBottom = null;
                var otherRight = null;
                var otherLeft = null;
                var otherTop = null;
                var otherBottom = null;


                if (typeof otherDizmo !== 'object') {
                    throw {
                        name: 'mustBeADizmoObject',
                        message: 'You need to provide a dizmo object, as provided by onDock, onUndock or canDock.'
                    };
                }

                try {
                    myLeft = mydizmo.getAttribute('geometry/x');
                    myRight = myLeft + mydizmo.getAttribute('geometry/width');
                    myTop = mydizmo.getAttribute('geometry/y');
                    myBottom = myTop - mydizmo.getAttribute('geometry/height');
                } catch (e) {
                    throw {
                        name: 'mustBeADizmoObject',
                        message: 'You need to provide a dizmo object, as provided by onDock, onUndock or canDock.'
                    };
                }

                try {
                    otherLeft = otherdizmo.getAttribute('geometry/x');
                    otherRight = otherLeft + otherdizmo.getAttribute('geometry/width');
                    otherTop = otherdizmo.getAttribute('geometry/y');
                    otherBottom = otherTop - otherdizmo.getAttribute('geometry/height');
                } catch (e) {
                    throw {
                        name: 'mustBeADizmoObject',
                        message: 'You need to provide a dizmo object, as provided by onDock, onUndock or canDock.'
                    };
                }

                if (otherRight <= myLeft) {
                    return 'left';
                }

                if (otherLeft >= myRight) {
                    return 'right';
                }

                if (otherBottom <= myTop) {
                    return 'top';
                }

                if (otherTop >= myBottom) {
                    return 'bottom';
                }
            },

            /**
             * Returns a random alphanumeric string with the requested length. Contains dupes unless
             * the nodupes flag is set to false.
             * @param  {Number}  length  The length of the random string
             * @param  {Boolean} nodupes True if no dupes should be produced
             * @return {String}          A random alphanumeric string
             */
            randomString: function(length, nodupes) {
                if (jQuery.type(length) !== 'number') {
                    throw 'Length is not a number';
                }
                if (length < 1) {
                    throw 'Length must be greater or equal to 1';
                }
                if (jQuery.type(nodupes) !== 'boolean') {
                    if (jQuery.type(nodupes) === 'undefined') {
                        nodupes = false;
                    } else {
                        throw 'Nodupes must be either a boolean or undefined';
                    }
                }

                var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                var output = '';
                var used = '';

                if (nodupes && length > chars.length) {
                    throw 'Length must be smaller than ' + chars.length + ' if used with nodupes.';
                }

                do {
                    var randnum = Math.floor(Math.random() * chars.length);
                    var chr = chars.charAt(randnum);

                    if (nodupes === true) {
                        var added = (used.indexOf(chr) !== -1);

                        if (added === true) {
                            continue;
                        }

                        used += chr;
                    }

                    output += chr;
                } while (output.length < length);

                return output;
            }
        }
    }
});


