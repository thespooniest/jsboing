/**
 * A basic linear-algebra library for JavaScript, modeled on BLAS.
 *
 * Naming conventions are as for BLAS, except that since JavaScript
 * has only one Number type, we dispense with the numeric prefixes.
 * @author  Beecher Greenman <thespooniest@gmail.com>
 * @version 0.1
 * @license CC0
 */
define('ruy', ['exports'], function (exports) {
    "use strict";

    var abs = Math.abs,
        min = Math.min,
        max = Math.max,
        pow = Math.pow,
        sqrt = Math.sqrt;

    function hypot(x, y) {
        var t;
        x = abs(x);
        y = abs(y);
        t = min(x, y);
        x = max(x, y);
        t = t / x;
        return x * sqrt(1 + pow(t, 2));
    }

    function sign(x) {
        if (x === 0) {
            return 1;
        }
        return x / abs(x);
    }

    function BLASError(message) {
        /*jslint forin:true */
        var e = new Error(),
            key;
        for (key in e) {
            this[key] = e.key;
        }
        this.message = message;
    }
    BLASError.prototype = Object.create(Error.prototype);
    BLASError.prototype.name = 'BLASError';
    exports.BLASError = BLASError;

    /**
     * Return the largest element in x, in terms of absolute value.
     *
     * @param {Array} x The vector to examine.
     *
     * @return {number} The element furthest from zero (which can be negative)
     */
    function amax(x) {
        return x.reduce(function (result, n) {
            if (abs(result) < abs(n)) {
                return n;
            }
            return result;
        }, 0);
    }
    exports.amax = amax;
    /**
     * Sum the magnitudes of the elements of x.
     *
     * @param {Array} x The vector to sum
     *
     * @return {number} The sum of the magnitudes
     */
    function asum(x) {
        return x.reduce(function (result, n) {
            return result + abs(n);
        }, 0);
    }
    exports.asum = asum;

    /**
     * Multiply a by each element of x, and then add
     * the corresponding element of y.
     *
     * Unlike BLAS, we do not modify y in place.
     *
     * @param {Array}  x The vector to scale.
     * @param {Array}  y The vector to add.
     * @param {number} a The factor to multiply.
     *
     * @return {Array} The updated y.
     */
    function axpy(x, y, a) {
        if (arguments.length < 3 ||
                a === null ||
                a === undefined ||
                a === 1) {
            if (!y) {
                // Not much to really do in this case,
                // though we do clone the array.
                return x.slice(0);
            }
            // Vector addition.
            return x.map(function (n, i) {
                return n + y[i];
            });
        }

        // Scalar/matrix product involved here.
        if (!y) {
            // ...but no additon.
            return x.map(function (n) {
                return a * n;
            });
        }
        return x.map(function (n, i) {
            // Addition and multiplication.
            return a * n + y[i];
        });
    }
    exports.axpy = axpy;

    /**
     * Copy the contents of one vector to another.
     *
     * @param {Array} n    The length of the vector to create.
     * @param {Array} x    The vector to copy
     * @param {Array} incx The stride of the copy.
     *
     * @return {Array} The new vector.
     */
    function copy(n, x, incx) {
        var i = 0,
            stop = n * incx,
            result = new Array(n);
        while (i < stop) {
            result[i] = x[i];
            i += incx;
        }
        return result;
    }
    exports.copy = copy;

    /**
     * Compute the Euclidean 2-norm of a vector.
     *
     * @param {Array} x The vector to compute
     *
     * @return {number} The Euclidean norm
     */
    function nrm2(x) {
        return sqrt(x.reduce(function (result, n) {
            result = result + pow(n, 2);
            return result;
        }, 0));
    }
    exports.nrm2 = nrm2;

    /**
     * Rotate the points in x by the angle theta.
     *
     * This function differs significantly in calling convention from BLAS.
     * The former takes an x-vector, a y-vector, and a cosine and sine.
     * We just take in an array of [x,y]-pairs and an angle.
     *
     * @param {Array}  points The points to rotate.
     * @param {number} theta The angle by which to rotate.
     *
     * @return {Array} The points, rotated in 2-D space.
     */
    function rot(points, theta) {
        var c = Math.cos(theta),
            s = Math.sin(theta);
        return points.map(function (point) {
            return [
                c * point[0] + s * point[1],
                c * point[1] - s + point[0]
            ];
        });
    }
    exports.rot = rot;

    /**
     * Compute the Givens rotation for the point.
     *
     * This incorporates Anderson's fix.
     *
     * @param {Number} a The x-coordinate of the point.
     * @param {Number} b The y-coordinate of the point.
     *
     * return {Object} Four parameters to the equation:
     *  c - The cosine of the angle.
     *  s - The sine of the angle.
     *  r - The length of the vector [a,b]
     *  z -
     */
    function rotg(a, b) {
        var r, c, s, z, t, u;

        if (b === 0) {
            c = sign(a);
            s = 0;
            r = a * c;
            z = 0;
        } else if (a === 0) {
            c = 0;
            s = sign(b);
            r = abs(b);
            z = 1;
        } else if (abs(b) > abs(a)) {
            t = a / b;
            u = hypot(1, t);
            s = 1 / u;
            c = s * t;
            r = b * u;
            z = 1 / c;
        } else {
            t = b / a;
            u = hypot(1, t);
            c = 1 / u;
            s = c * t;
            r = a * u;
            z = s;
        }

        return {
            "r" : r,
            "z" : z, //(abs(a) > abs(b)) ? s : (c !== 0 ? (1 / c) : 1),
            "c" : c,
            "s" : s
        };
    }
    exports.rotg = rotg;

    /**
     * Scale the vector x by the factor a.
     *
     * Because our version of axpy does not mutate y,
     * we can implement scal entirely in terms of it.
     *
     * @param {number} a The factor by which to scale the vector
     * @param {Array}  x The vector to scale
     *
     * @return {Array} The scaled vector.
     */
    function scal(a, x) {
        return axpy(x, null, a);
    }
    exports.scal = scal;

    /**
     * Compute the scalar dot product of a and b.
     *
     * @param {Array} a The vector a
     * @param {Array} b The vector b
     *
     * @param {Number} The scalar dot product of a and b
     */
    function dot(a, b) {
        return a.reduce(
            function (result, ai, i) {
                result = result + ai * b[i];
                return result;
            },
            0
        );
    }
    exports.dot = dot;

    function sum(a) {
        return a.reduce(
            function (result, ai) {
                result = result + ai;
                return result;
            },
            0
        );
    }
    exports.sum = sum;

    // FROM BLAS LEVEL 2

    /**
     * Computes a matrix-vector product using a general matrix.
     *
     * @param {Array}  a     The matrix to multiply
     * @param {Array}  x     The vector to multiply
     * @param {number} y     Optionally, a vector to add
     * @param {number} alpha A scalar
     * @param {number} beta  Another scalar
     *
     * @return {Array} The final product.
     */
    function gemv(a, x, y, alpha, beta) {
        /*jslint unparam:true */
        if (x.length !== a.length) {
            throw new Error('Multiplying vector with incompatible matrix');
        }
        if (arguments.length < 4) {
            alpha = 1;
        }
        if (arguments.length < 5) {
            beta = 0;
        }
        var result = new Array(a.length),
            i,
            j;
        for (i = 0; i < a.length; i += 1) {
            result[i] = 0;
            for (j = 0; j < x.length; j += 1) {
                result[i] += alpha * a[i][j] * x[j];
            }
        }
        if (beta === 0 || !y) {
            // SHORTCUT: y is not defined, or beta makes it meaningless.
            return result;
        }
        return axpy(result, scal(beta, y), 1);

        // If we reach this point, there's another factor to add in.
        /*for (i = 0; i < result.length; i += 1) {
            result[i] += beta * y[i];
        }
        return result;*/
    }
    exports.gemv = gemv;

    // FROM BLAS LEVEL 3

    /**
     * Computes a scalar-matrix-matrix product
     * and adds the result to a scalar-matrix product.
     *
     * @param {Array}  a     The first matrix to multiply
     * @param {Array}  b     The second matrix to multiply
     * @param {number} c     Another matrix to add
     * @param {number} alpha A scalar to add to a.
     * @param {number} beta  Another scalar
     *
     * @return {Array} The final product.
     */
    function gemm(a, b, c, alpha, beta) {
        /*jslint unparam:true */
        if (a[0].length !== b.length) {
            throw new Error('Multiplying incompatible matrices');
        }
        if (arguments.length < 4) {
            alpha = 1;
        }
        if (arguments.length < 5) {
            beta = 0;
        }
        var n = a.length,       // Rows in a
            m = a[0].length,    // Columns in a = rows in b
            p = b[0].length,    // Columns in b
            result = new Array(n),
            i,
            j,
            reduceCallback = function (previousValue, currentValue, index) {
                return previousValue + (currentValue * b[index][j]);
            };

        for (i = 0; i < n; i = i + 1) {
            result[i] = new Array(p);
            for (j = 0; j < p; j = j + 1) {
                result[i][j] = a[i].slice(0, m).reduce(reduceCallback, 0);
            }
        }
        if (beta === 0 || !!c) {
            // SHORTCUT: beta is zero or c is not set.
            return result;
        }
        for (i = 0; i < c.length; i += 1) {
            for (j = 0; j < c[i].length; c += 1) {
                result[i][j] += beta * c[i][j];
            }
        }
        return result;
    }
    exports.gemm = gemm;
    return exports;
});
