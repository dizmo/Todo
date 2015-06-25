//= require CustomAssertions
//= require test_dizmo

QUnit.begin(function() {
    // setup before running tests
});

QUnit.done(function() {
    // things to be done once tests are run
    dizmo.setAttribute('geometry/width', 1000);
    dizmo.setAttribute('geometry/height', 490);

    jQuery('#front').height(dizmo.getAttribute('geometry/height') - 20);
    jQuery('#front').width(dizmo.getAttribute('geometry/width') - 20);
});

dizmo.canDock(false)
