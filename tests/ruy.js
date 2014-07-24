/**
 * Ruy level 1 test suite
 *
 * Ported from DBLAT1, at <http://www.netlib.org/blas/dblat1>
 */
(function() {
    "use strict";
    
    var abs = Math.abs,
        max = Math.max,
        min = Math.min,
        sqrt = Math.sqrt,
        tolerance = 9.765625e-4,
        commonTest1 = [
            [[0.1, 0.1], [0.3, 0.3], [3.0, 0.3],  [0.2, 2.0],  [0.1, 0.1]],
            [[2.0, 8.0], [3.0, 9.0], [-0.4, 2.0], [-0.6, 3.0], [-0.3, 4.0]],
            [[2.0, 8.0], [3.0, 9.0], [4.0, -0.4], [0.3, -0.6], [0.5, -0.3]],
            [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 5.0],  [-0.1, 6.0]],
            [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 0.3],  [0.6, -0.5]],
            [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 2.0],  [0.6, 7.0]],
            [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 2.0],  [0.6, -0.1]],
            [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 2.0],  [0.6, 3.0]]
        ];

    QUnit.assert.withinTolerance = function (actual, expected, tolerance, message) {
        var difference = actual - expected;
        if ((abs(expected) + abs(tolerance * difference)) - abs(expected) === 0) {
            QUnit.push(true, actual, expected, "Difference within tolerance");
        } else {
            QUnit.push(false, actual, expected, "Difference outside tolerance");
        }
    };

    function check0Provider() {
        return [
            [[0.3, 0.4], { "c" : 0.6, "s" : 0.8, "r" : 0.5, "z" : 1/0.6 }],
            [[0.4, 0.3], { "c" : 0.8, "s" : 0.6, "r" : 0.5, "z" : 0.6 }],
            [[-0.3, 0.4], { "c" : -0.6, "s" : 0.8, "r" : 0.5, "z" : -1/0.6 }],
            [[-0.4, 0.3], { "c" : 0.8, "s" : -0.6, "r" : -0.5, "z" : -0.6 }],
            [[-0.3, -0.4], { "c" : 0.6, "s" : 0.8, "r" : -0.5, "z" : 1/0.6 }],
            [[0, 0], { "c" : 1, "s" : 0, "r" : 0, "z" : 0 }],
            [[0, 1], { "c" : 0, "s" : 1, "r" : 1, "z" : 1 }],
            [[1, 0], { "c" : 1, "s" : 0, "r" : 1, "z" : 0 }],
        ];
    }

    QUnit.test('ruy exists', function (assert) {
        assert.ok(!!ruy, 'Passed!');
    });

    // CHECK0: test rotg
    QUnit.module('CHECK0');
    check0Provider().forEach(function (test, testIndex) {
        var input = test[0],
            expected = test[1];
        QUnit.test('Data set ' + testIndex + ' (' + input[0] + ', ' + input[1] + ')', function (assert) {
            var actual = ruy.rotg.apply(undefined, input);
            
            // STANDARD: Check external consistency against the BLAST-style values.
            // Test values against BLAST-approved checks.
            assert.withinTolerance(actual.r, expected.r, tolerance);
            assert.withinTolerance(actual.z, expected.z, tolerance);
            assert.withinTolerance(actual.c, expected.c, tolerance);
            assert.withinTolerance(actual.s, expected.s, tolerance);
    
        });
    });

    //CHECK1: Check a number of factors.
    function check1Provider() {
        return [[[1337, 7331]]];
    };
    QUnit.module('CHECK1');
    check1Provider().forEach(function (test, testIndex) {
        var input = test[0],
            expected = test[1];

        QUnit.test('Data set ' + testIndex + ' (' + input[0] + ', ' + input[1] + ')', function (assert) {
            var sa = [-0.3, -1, 0, 1, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
                dv = [
                    [[0.1, 0.1], [0.3, 0.3], [3.0, 0.3],  [0.2, 2.0],  [0.1, 0.1]],
                    [[2.0, 8.0], [3.0, 9.0], [-0.4, 2.0], [-0.6, 3.0], [-0.3, 4.0]],
                    [[2.0, 8.0], [3.0, 9.0], [4.0, -0.4], [0.3, -0.6], [0.5, -0.3]],
                    [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 5.0],  [-0.1, 6.0]],
                    [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 0.3],  [0.6, -0.5]],
                    [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 2.0],  [0.6, 7.0]],
                    [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 2.0],  [0.6, -0.1]],
                    [[2.0, 8.0], [3.0, 9.0], [4.0, 2.0],  [5.0, 2.0],  [0.6, 3.0]]
                ],
                dTrue1 = [0.0, 0.3, 0.5, 0.7, 0.6],
                dTrue3 = [0.0, 0.3, 0.7, 1.1, 1.0],
                dTrue5 = [
                     0.10,  2.00,  2.00,  2.00,  2.00,  2.00,  2.00,  2.00,
                    -0.30,  3.00,  3.00,  3.00,  3.00,  3.00,  3.00,  3.00,
                     0.00,  0.00,  4.00,  4.00,  4.00,  4.00,  4.00,  4.00,
                     0.20, -0.60,  0.30,  5.00,  5.00,  5.00,  5.00,  5.00,
                     0.03, -0.09,  0.15, -0.03,  6.00,  6.00,  6.00,  6.00,

                     0.10,  8.00,  8.00,  8.00,  8.00,  8.00,  8.00,  8.00,
                     0.09,  9.00,  9.00,  9.00,  9.00,  9.00,  9.00,  9.00,
                     0.09,  2.00, -0.12,  2.00,  2.00,  2.00,  2.00,  2.00,
                     0.06,  3.00, -0.18,  5.00,  0.09,  2.00,  2.00,  2.00,
                     0.03,  4.00, -0.09,  6.00, -0.15,  7.00, -0.03,  3.00
                ],
                iTrue2 = [0, 1, 2, 2, 3],
                // Scalars in common
                iCase,
                incX,
                incY,
                mode,
                n,
                // Local Scalars
                i,
                len,
                np1,
                sx;
            for (incX = 0; incX < 2; incX = incX + 1) {
                for (np1 = 0; np1 < 5; np1 = np1 + 1) {
                    len = 2 * max(np1, 1);
                    sx = new Array(len);
                    for (i = 0; i < len; i = i + 1) {
                        sx[i] = dv[i][np1][incX];

                    }
                    console.debug('After build array', sx, [
                        //ruy.nrm2(sx),
                        //ruy.asum(sx),
                        //ruy.scal(n, sx),
                        ruy.amax(sx)
                    ]);
                    //assert.withinTolerance(ruy.nrm2(sx), dTrue1[np1], tolerance);
                    //assert.withinTolerance(ruy.asum(sx), dTrue1[np1], tolerance);
                    //assert.withinTolerance(ruy.nrm2(sx), dTrue1[np1], tolerance);
                    assert.withinTolerance(ruy.amax(sx), iTrue2[np1], tolerance);
                }
            }
        });
    });
}());
