/**
 * Super-basic shim for AMD.
 * Probably too limited to even fairly be called an AMD shim.
 */
(function (GLOBALS) {
    "use strict";
    var toString = GLOBALS.Object.prototype.toString,
        modules = {};

    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    function define(id, dependencies, factory) {
        var argv = [],
            i;

        // Attempt to gather dependencies. If we can't, then
        // push to pending and break out.
        for (i = 0; i < dependencies.length; i += 1) {
            if (dependencies[i] === 'exports') {
                argv[i] = {};
            } else {
                argv[i] = modules[dependencies[i]];
            }
        }
        if (isFunction(factory)) {
            modules[id] = factory.apply(undefined, argv);
        } else {
            modules[id] = factory;
        }
    }

    function require(dependencies, callback) {
        var argv = [],
            i;
        if (arguments.length === 1) {
            // one-argument form
            return modules[dependencies];
        }
        for (i = 0; i < dependencies.length; i += 1) {
            argv[i] = modules[dependencies[i]];
        }
        callback.apply(undefined, argv);
    }

    GLOBALS.define = define;
    GLOBALS.require = require;
}(this));
define('Machine', [], function () {
    "use strict";

    var requestAnimationFrame = window.requestAnimationFrame.bind(window),
        cancelAnimationFrame = window.cancelAnimationFrame.bind(window);

    function Machine(elem) {
        // Set up the screen.
        var viewport = document.getElementById('viewport'),
            newLayer;
        this.screen = {
            "width"     : elem.width,
            "height"    : elem.height,
            "layers"    : [elem]
        };
        viewport.style.height = elem.height + 'px';
        viewport.style.width = elem.width + 'px';

        // Set up the layers.
        newLayer = document.createElement('canvas');
        newLayer.width = elem.width;
        newLayer.height = elem.height;
        document.getElementById('viewport').appendChild(newLayer);
        this.screen.layers.push(newLayer);

        newLayer = document.createElement('canvas');
        newLayer.width = elem.width;
        newLayer.height = elem.height;
        document.getElementById('viewport').appendChild(newLayer);
        this.screen.layers.push(newLayer);

        newLayer = document.createElement('canvas');
        newLayer.width = elem.width;
        newLayer.height = elem.height;
        document.getElementById('viewport').appendChild(newLayer);
        this.screen.layers.push(newLayer);

        this.boundTick = this.tick.bind(this);
        this.worlds = [];
        this.isRunning = false;
        this.frameRequest = null;
        document.getElementById('viewport').addEventListener('click', this.toggle.bind(this), false);
        document.body.addEventListener('blur', this.pause.bind(this), false);
        document.body.addEventListener('focus', this.play.bind(this), false);
        this.reset();
    }

    Machine.prototype.load = function (newWorld) {
        this.worlds.push(newWorld);
        newWorld.reset();
    };

    Machine.prototype.reset = function () {
        var i = 0;

        for (i = 0; i < this.worlds.length; i += 1) {
            this.worlds[i].reset();
        }
        this.clearAllScreens();
        this.lastFrame = this.now();
        this.play();
    };

    Machine.prototype.pause = function () {
        if (this.isRunning) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
            this.isRunning = false;
        }
    };

    Machine.prototype.play = function () {
        if (!this.isRunning) {
            this.lastFrame = this.now();
            this.isRunning = true;
            this.wait();
        }
    };

    Machine.prototype.toggle = function () {
        if (this.isRunning) {
            this.pause();
        } else {
            this.play();
        }
    };

    Machine.prototype.tick = function (thisFrame) {
        var dt = (thisFrame - this.lastFrame) / 1000,
            i;
        if (this.isRunning) {
            for (i = 0; i < this.worlds.length; i += 1) {
                this.worlds[i].update(dt);
            }
            for (i = 0; i < this.worlds.length; i += 1) {
                this.worlds[i].render(dt);
            }
            this.wait();
        }
        this.lastFrame = thisFrame;
    };

    Machine.prototype.getLayer = function (layerNumber) {
        return this.screen.layers[layerNumber].getContext("2d");
    };

    /**
     * Wait for the next tick to pass by.
     *
     * Putting this in a separate function seems to help GC.
     */
    Machine.prototype.wait = function () {
        this.frameRequest = requestAnimationFrame(this.boundTick);
    };

    Machine.prototype.now = window.performance.now.bind(window.performance);

    Machine.prototype.clearAllScreens = function () {
        var i,
            layer;
        for (i = 0; i < this.screen.layers.length; i += 1) {
            layer = this.getLayer(i);
            layer.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    };

    return Machine;
});
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
/**
 * 3-D utilities for JavaScript.
 *
 * Matrix-multiplication and 3D-projection algorithms
 * taken from MacDevCenter, "Build a Simple 3D Pipeline
 * in Tcl", by Michael J. Norton,
 * <http://www.macdevcenter.com/pub/a/mac/2005/08/12/tcl.html>
 *
 * Depends heavily on ruy.
 */
define('pipeline3D', ['ruy', 'exports'], function (ruy, exports) {
    "use strict";

    //var min = Math.min;

    function Material() {
        this.ambient = null;
    }

    function Face() {
        this.vertices = [];
        this.material = null;
    }

    function Model() {
        this.vertices = [];
        this.faces = [];
    }

    /**
     * Create an identity matrix.
     *
     * @return {Array} The order-4 identity matrix.
     */
    function createIdentityMatrix() {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    /**
     * Create a generic translation matrix.
     *
     * @param {number} x Translation factor along the x-axis
     * @param {number} y Translation factor along the y-axis
     * @param {number} z Translation factor along the z-axis
     *
     * @return {Array} A matrix representing the proper scaling.
     */
    function createTranslationMatrix(x, y, z) {
        return [
            [0, 0, 0, x],
            [0, 0, 0, y],
            [0, 0, 0, z],
            [0, 0, 0, 1]
        ];
    }

    /**
     * Create a generic scaling matrix.
     *
     * @param {number} x Scaling factor along the x-axis
     * @param {number} y Scaling factor along the y-axis
     * @param {number} z Scaling factor along the z-axis
     *
     * @return {Array} A matrix representing the proper scaling.
     */
    function createScalingMatrix(x, y, z) {
        return [
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]
        ];
    }

    /**
     * Create a generic rotation matrix.
     *
     * @param {Number} alpha Rotation about the x axis.
     * @param {Number} theta Rotation about the y axis.
     * @param {Number} phi Rotation about the z axis
     *
     * @return {Array} A matrix representing the proper rotation.
     */
    function createRotationMatrix(alpha, theta, phi) {
        var sin = Math.sin,
            cos = Math.cos,
            sinAlpha = sin(alpha),
            cosAlpha = cos(alpha),
            sinTheta = sin(theta),
            cosTheta = cos(theta),
            sinPhi = sin(phi),
            cosPhi = cos(phi),
            rotationX = [
                [1, 0, 0, 0],
                [0, cosAlpha, -sinAlpha, 0],
                [0, sinAlpha, cosAlpha, 0],
                [0, 0, 0, 1]
            ],
            rotationY = [
                [cosTheta, 0, -sinTheta, 0],
                [0, 1, 0, 0],
                [sinTheta, 0, cosTheta, 0],
                [0, 0, 0, 1]
            ],
            rotationZ = [
                [cosPhi, -sinPhi, 0, 0],
                [sinPhi, cosPhi, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        return ruy.gemm(
            rotationZ,
            ruy.gemm(
                rotationX,
                rotationY
            )
        );
    }

    /**
     * Project a 3-D point onto a 2-D plane (like, say, the screen)
     *
     * @param {Array}  point [x,y,z] coordinates
     * @param {Number} d Distance from camera to origin
     * @param {Array}  rotationMatrix The rotation matrix.
     */
    function project(point, d, rotationMatrix, canvas) {
        //return [point[0] / point[2], point[1] / point[2]];
        var pointPrime = ruy.gemv(
                rotationMatrix,
                point,
                [0, 0, 10, 0],
                1,
                1
            ),
            finalX,
            finalY;
        finalX = (canvas.width / 2) + (pointPrime[0] * d / pointPrime[2]);
        finalY = (canvas.height / 2) + (pointPrime[1] * d / pointPrime[2]);
        return [finalX, finalY, pointPrime[2]];
    }

    function isBackface(vertices, face) {
        /*jslint unparam:true*/
        return false;
    }

    function drawModelFlat(canvas, model, dFactor, rotationMatrix) {
        var context = canvas.getContext("2d"),
            projected = model.vertices.map(function (point) {
                var p = project(
                    point,
                    dFactor,
                    rotationMatrix,
                    canvas
                );
                return [p[0] | 0, p[1] | 0, p[2] | 0];
            }),
            faces = model.faces.slice(0);
        console.debug(projected);
        faces.forEach(function (face) {
            var i = 1,
                vertices = face.vertices,
                stop = vertices.length;
            context.beginPath();
            if (!isBackface(vertices, face)) {
                // Cull all backfaces.
                context.fillStyle = face.material.ambient;
                context.moveTo(
                    (projected[vertices[0]][0] | 0) + 0.5,
                    (projected[vertices[0]][1] | 0) + 0.5
                );
                while (i < stop) {
                    context.lineTo(
                        (projected[vertices[i]][0] | 0) + 0.5,
                        (projected[vertices[i]][1] | 0) + 0.5
                    );
                    i = i + 1;
                }
                context.closePath();
                context.fill();
                context.stroke();
            }
        });
    }

    function drawModelShadow(canvas, model, dFactor, rotationMatrix, material) {
        var context = canvas.getContext("2d"),
            projected = model.vertices.map(function (point) {
                var p = project(
                    point,
                    dFactor,
                    rotationMatrix,
                    canvas
                );
                return [p[0], p[1]];
            }),
            faces = model.faces.slice(0);
        context.fillStyle = material.ambient;
        // Sort the faces so that back-most faces get sorted first.
        faces.sort(function (a, b) {
            var za = Math.min.apply(undefined, a.vertices.map(function (point) {
                    return model.vertices[point][2];
                })),
                zb = Math.min.apply(undefined, b.vertices.map(function (point) {
                    return model.vertices[point][2];
                }));
            if (za < zb) {
                return 1;
            }
            if (za > zb) {
                return -1;
            }
            return 0;
        });
        faces.forEach(function (face) {
            var i = 1,
                vertices = face.vertices,
                stop = vertices.length;
            context.beginPath();
            context.moveTo(
                (projected[vertices[0]][0] | 0) + 0.5,
                (projected[vertices[0]][1] | 0) + 0.5
            );
            while (i < stop) {
                context.lineTo(
                    (projected[vertices[i]][0] | 0) + 0.5,
                    (projected[vertices[i]][1] | 0) + 0.5
                );
                i = i + 1;
            }
            context.closePath();
            context.fill();
        });
    }

    function drawModelLines(canvas, model, dFactor, rotationMatrix, color) {
        var ctx = canvas.getContext("2d"),
            i = 0,
            stop = model.vertices.length,
            point,
            projectedPoint;
        ctx.beginPath();
        ctx.strokeStyle = color;
        while (i < stop) {
            point = model.vertices[i];
            projectedPoint = project(
                point,
                dFactor,
                rotationMatrix,
                canvas
            );
            ctx.moveTo(
                (projectedPoint[0] | 0) + 0.5,
                (projectedPoint[1] | 0) + 0.5
            );
            i = i + 1;
            point = model.vertices[i];
            projectedPoint = project(
                point,
                dFactor,
                rotationMatrix,
                canvas
            );
            ctx.lineTo(
                (projectedPoint[0] | 0) + 0.5,
                (projectedPoint[1] | 0) + 0.5
            );
            i = i + 1;
        }
        ctx.stroke();
    }

    exports.Face = Face;
    exports.Material = Material;
    exports.Model = Model;
    exports.createIdentityMatrix = createIdentityMatrix;
    exports.createTranslationMatrix = createTranslationMatrix;
    exports.createScalingMatrix = createScalingMatrix;
    exports.createRotationMatrix = createRotationMatrix;
    exports.project = project;
    exports.drawModelLines = drawModelLines;
    exports.drawModelFlat = drawModelFlat;
    exports.drawModelShadow = drawModelShadow;

    return exports;
});
/**
 * Assets for jsBoing.
 *
 * Everything but the audio is actually generated
 * programmatically.
 *
 * assets depends on ruy and pipeline3d.
 */
define('assets', ['pipeline3D', 'exports'], function (pipeline3D, exports) {
    "use strict";

    // Define the initial values for our assets.
    // 3-D models
    exports.models = {};
    exports.models.grid = null;
    exports.models.ball = null;

    // 3-D materials
    exports.materials = {};

    // Pictures
    exports.pictures = {};
    exports.pictures.background = null;

    // Sprites
    exports.sprites = {};
    exports.sprites.ball = [];
    exports.sprites.shadow = [];

    // Background

    /**
     * Generate a list of grid points.
     *
     * This is a "wriggly snake" model. Once the renderer moves to
     * the initial point, the remainder of the wireframe should be
     * drawable using only lineTo operations.
     *
     * @return Array The points needed to create a grid.
     */
    function generateGridModel(rows, columns, voxes) {
        /*jslint unparam:true */
        // Start at the top, right, far corner.
        var x = -1,
            y = -1,
            z = -1,
            boxWidth = 2 / columns,
            boxHeight = 2 / rows,
            boxVol = 2 / voxes,
            result = new pipeline3D.Model();

        // First, draw the vertical and outward lines.
        while (x <= 1) {
            result.vertices.push(
                [x, 1, -1, 1],
                [x, -1, -1, 1],
                [x, -1, -1, 1],
                [x, -1, 1, 1]
            );
            x += boxWidth;
        }
        if (result.vertices[result.vertices.length - 1][0] < 1) {
            result.vertices.push(
                [1, 1, -1, 1],
                [1, -1, -1, 1],
                [1, -1, -1, 1],
                [1, -1, 1, 1]
            );
        }
        // Next, draw the back horizontal lines.
        while (y <= 1) {
            result.vertices.push(
                [-1, y, -1, 1],
                [1, y, -1, 1]
            );
            y += boxHeight;
        }
        if (result.vertices[result.vertices.length - 1][1] < 1) {
            result.vertices.push(
                [-1, 1, -1, 1],
                [1, 1, -1, 1]
            );
        }

        // Lastly, draw the floor horizontal lines.
        while (z <= 1) {
            result.vertices.push(
                [-1, -1, z, 1],
                [1, -1, z, 1]
            );
            z += boxVol;
        }
        if (result.vertices[result.vertices.length - 1][2] < 1) {
            result.vertices.push(
                [-1, -1, 1, 1],
                [1, -1, 1, 1]
            );
        }
        return result;
    }

    /**
     * Generate a list of ball points.
     * The ball is inscribed in its own space, so r = 1.
     * That simplifies a number of things.
     *
     * @param meridians The number of "vertical" bands.
     * @param parallels The number of "horizontal" bands.
     */
    function generateBallModel(meridians, parallels) {
        var result = new pipeline3D.Model(),
            azimuth = 0,
            altitude = 0,
            facesPerBand = meridians * 2,
            azimuthFactor = Math.PI / meridians,
            altitudeFactor = Math.PI / (parallels + 1),
            sin = Math.sin,
            cos = Math.cos,
            azimuths = [],
            altitudes = [],
            ringStart = 1,
            lastFace = facesPerBand - 1,
            current,
            currentDown,
            currentDownNext,
            currentNext,
            currentFace,
            i,
            j,
            drawAlternate = false,
            flipLast = !(parallels % 2);
        result.vertices.push([0, 1, 0, 1]);
        // Precalculate the azimuth sines and cosines. This way
        // we only have to do it once, rather than once per ring.
        // Note that we do this twice per meridian.
        for (i = 0; i < meridians * 2; i = i + 1) {
            azimuth = i * azimuthFactor;
            azimuths.push([sin(azimuth), cos(azimuth)]);
        }
        // Similar story for altitudes, though we only have to do it
        // once per altitude.
        for (i = 1; i <= parallels; i = i + 1) {
            altitude = i * altitudeFactor;
            altitudes.push([sin(altitude), cos(altitude)]);
        }

        // Now to generate the actual ball model.
        for (altitude = 0; altitude < altitudes.length; altitude += 1) {
            for (azimuth = 0; azimuth < azimuths.length; azimuth += 1) {
                result.vertices.push([
                    altitudes[altitude][0] * azimuths[azimuth][1],
                    altitudes[altitude][1],
                    altitudes[altitude][0] * azimuths[azimuth][0],
                    1
                ]);
            }
        }
        // ...and we're done, save for the last ball coordinate...
        result.vertices.push([0, -1, 0, 1]);

        // ...or, at least, we're done with the vertices. On to the faces.
        // Notice that while the vertices are specified in a
        // counterclockwise spiral around the model, we specify the ball's
        // faces as vertical slices.
        for (i = 0; i < meridians * 2; i = i + 1) {
            ringStart = i + 1;
            current = ringStart;
            currentDown = current + facesPerBand;
            if (i === lastFace) {
                // Last face, so connect back around to the first.
                currentNext = 1;
            } else {
                currentNext = ringStart + 1;
            }
            currentDownNext = currentNext + facesPerBand;
            // Start with the top wedge.
            currentFace = new pipeline3D.Face();
            currentFace.vertices = [0, current, currentNext];
            if (!!drawAlternate) {
                currentFace.material = exports.materials.ballA;
            } else {
                currentFace.material = exports.materials.ballB;
            }
            drawAlternate = !drawAlternate;
            result.faces.push(currentFace);

            // Next, draw the band.
            for (j = 0; j < parallels - 1; j = j + 1) {
                currentFace = new pipeline3D.Face();
                currentFace.vertices = [
                    current,
                    currentDown,
                    currentDownNext
                ];
                if (!!drawAlternate) {
                    currentFace.material = exports.materials.ballA;
                } else {
                    currentFace.material = exports.materials.ballB;
                }
                result.faces.push(currentFace);
                currentFace = new pipeline3D.Face();
                currentFace.vertices = [
                    currentDownNext,
                    currentNext,
                    current
                ];
                if (!!drawAlternate) {
                    currentFace.material = exports.materials.ballA;
                } else {
                    currentFace.material = exports.materials.ballB;
                }
                result.faces.push(currentFace);
                drawAlternate = !drawAlternate;
                current = currentDown;
                currentNext = currentDownNext;
                currentDown = current + facesPerBand;
                currentDownNext = currentNext + facesPerBand;
            }
            // End with the bottom wedge.
            currentFace = new pipeline3D.Face();
            currentFace.vertices = [
                result.vertices.length - 1,
                current,
                currentNext
            ];
            result.faces.push(currentFace);
            if (!!drawAlternate) {
                currentFace.material = exports.materials.ballA;
            } else {
                currentFace.material = exports.materials.ballB;
            }
            if (flipLast) {
                // Flip one last time, but ONLY if the
                // number of parallels is even.
                drawAlternate = !drawAlternate;
            }
        }
        return result;
    }

    /**
     * Create an image of the grid.
     *
     * Because the grid is static, we cheat a little by caching
     * a single image of it on startup. Then we can just blit it
     * straight to the screen on each frame.
     *
     * @return HTMLCanvasElement A Canvas containing the grid.
     */
    function createBackground(screen, model, distance, rotationMatrix, color) {
        var result = document.createElement('canvas');
        result.height = screen.canvas.height;
        result.width = result.height;

        // Draw the actual grid.
        pipeline3D.drawModelLines(
            result,
            model,
            distance,
            rotationMatrix,
            color
        );

        // ...and we're done.
        return result;
    }

    /** Create a single sprite.
     */
    function createBallSprite(screen, model, distance, rotationMatrix) {
        var result = document.createElement('canvas');
        result.width = Math.min(screen.canvas.height, screen.canvas.width) / 2;
        result.height = result.width;
        pipeline3D.drawModelFlat(
            result,
            model,
            distance,
            rotationMatrix
        );
        return result;
    }

    function createShadowSprite(screen, model, distance, rotationMatrix, material) {
        var result = document.createElement('canvas');
        result.width = Math.min(screen.canvas.height, screen.canvas.width) / 2;
        result.height = result.width;
        pipeline3D.drawModelShadow(
            result,
            model,
            distance,
            rotationMatrix,
            material
        );
        return result;
    }

    exports.generateGridModel = generateGridModel;
    exports.generateBallModel = generateBallModel;
    exports.createBackground = createBackground;
    exports.createBallSprite = createBallSprite;
    exports.createShadowSprite = createShadowSprite;
    return exports;
});
/**
 * jsBoing
 *
 * Concept inspired by "Boing!", by R.J. Mical and Dale Luck
 *
 * depends on assets.
 *
 * @version 0.1
 * @author  Beecher Greenman <thespooniest@gmail.com>
 * @license CC0
 */
define('BoingWorld', ['assets', 'pipeline3D'], function (assets, pipeline3D) {
    "use strict";
    /*jslint bitwise:true */

    // Configuration variables
    var rows = 15,            // How many horizontal rows in the grid
        columns = 15,         // How many vertical columns in the grid
        voxes = 4,           // How many "forward" volumes in the grid
        meridians = 8,        // How many vertical dividers in the ball
        parallels = 8,        // How many horizontal dividers in the ball
        gridColor = "#606",   // The color of the grid
        shadowColor = "#666", // The color of the ball's shadow.
        ballColorA = "#F00",  // One color for the ball
        ballColorB = "#FFF",  // Another color for the ball

        showGuide = false,    // Show the debug guide.
        ballPitch = 0,        // The ball's yaw is not controllable,
        ballRoll = Math.PI / 8,

        // Cached function copies.
        abs = Math.abs,

        // Constants
        numberOfFrames = 8,
        TAU = Math.PI * 2;

    function BoingWorld(machine) {
        this.machine = machine;
    }

    BoingWorld.reconfigure = function (options) {
        // Color options

        if (!!options.gridColor) {
            gridColor = String(options.gridColor);
            assets.materials.grid = new pipeline3D.Material();
            assets.materials.grid.ambient = gridColor;
            assets.pictures.background = null;
        }
        if (!!options.shadowColor) {
            shadowColor = String(options.shadowColor);
            assets.materials.shadow = new pipeline3D.Material();
            assets.materials.shadow.ambient = shadowColor;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }
        if (!!options.ballColorA) {
            ballColorA = String(options.ballColorA);
            assets.materials.ballA = new pipeline3D.Material();
            assets.materials.ballA.ambient = ballColorA;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }
        if (!!options.ballColorB) {
            ballColorB = String(options.ballColorB);
            assets.materials.ballB = new pipeline3D.Material();
            assets.materials.ballB.ambient = ballColorB;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }

        // Numeric options

        if (!!options.rows && !isNaN(options.rows)) {
            rows = options.rows | 0;
            assets.models.grid = null;
            assets.pictures.background = null;
        }
        if (!!options.columns && !isNaN(options.columns)) {
            columns = options.columns | 0;
            assets.models.grid = null;
            assets.pictures.background = null;
        }
        if (!!options.voxes && !isNaN(options.voxes)) {
            voxes = options.voxes | 0;
            assets.models.grid = null;
            assets.pictures.background = null;
        }
        if (!!options.meridians && !isNaN(options.meridians)) {
            meridians = options.meridians | 0;
            assets.models.ball = null;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }
        if (!!options.parallels && !isNaN(options.parallels)) {
            parallels = options.parallels | 0;
            assets.models.ball = null;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }
        if (!!options.ballPitch && !isNaN(options.ballPitch)) {
            ballPitch = (Math.PI / 16) * options.ballPitch | 0;
            assets.models.ball = null;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }
        if (!!options.ballRoll && !isNaN(options.ballRoll)) {
            ballRoll = (Math.PI / 16) * (options.ballRoll | 0);
            assets.models.ball = null;
            assets.sprites.shadow = [];
            assets.sprites.ball = [];
        }
        showGuide = !!options.showGuide;
    };

    BoingWorld.prototype.reset = function () {
        var rotationMatrix = pipeline3D.createRotationMatrix(Math.PI, 0, 0, 0),
            elem = this.machine.screen.layers[0];

        this.height = this.machine.screen.height;
        this.width = this.machine.screen.width;
        this.gridDistance = this.height * 4.75;
        this.ballDistance = this.gridDistance / 2;
        this.ballSize = this.height / 2;
        this.topY = pipeline3D.project([0, 1, 0, 1], this.gridDistance, rotationMatrix, elem)[1] | 0;
        this.leftX = pipeline3D.project([-1, 0, 0.5, 1], this.gridDistance, rotationMatrix, elem)[0] | 0;
        this.rightX = (pipeline3D.project([1, 0, 0.5, 1], this.gridDistance, rotationMatrix, elem)[0] - this.ballSize) | 0;
        //rightX = leftX + 109;
        this.bottomY = (pipeline3D.project([0, -1, 0, 1], this.gridDistance, rotationMatrix, elem)[1] - this.ballSize) | 0;
        //bottomY = topY + 101;
        this.shadowOffset = this.ballSize / 4;
        this.x = this.width / 2;
        this.y = this.topY;
        this.lastX = this.x;
        this.lastY = this.y;
        this.dx = 30; // 17;
        this.dy = 30; // 17;
        this.isReady = false;
    };

    BoingWorld.prototype.render = function () {
        var frame;
        // Clear the screen.
        this.machine.getLayer(0).clearRect(
            this.lastX + this.shadowOffset - 5,
            this.lastY - 5,
            this.ballSize + 10,
            this.ballSize + 10
        );
        this.machine.getLayer(2).clearRect(
            this.lastX - 5,
            this.lastY - 5,
            this.ballSize + 10,
            this.ballSize + 10
        );
        if (!this.isReady) {
            this.renderBoot(this.machine.getLayer(0));
        } else {
            // RUN MODE: Draw the demo.
            frame = abs(this.x | 0) % numberOfFrames;
            // Draw the ball's shadow.
            this.machine.getLayer(0).drawImage(
                assets.sprites.shadow[frame],
                (this.x + this.shadowOffset) | 0,
                this.y | 0
            );
            // Draw the ball.
            this.machine.getLayer(2).drawImage(
                assets.sprites.ball[frame],
                this.x | 0,
                this.y | 0
            );
        }

        // A development guide.
        if (!!showGuide) {
            this.renderGuide(this.machine.getLayer(3));
        }
    };

    BoingWorld.prototype.renderBoot = function (ctx) {
        var progress;
        // BOOT MODE: Show a splash and progress bar.
        if (!!assets.pictures.background) {
            progress = 3;
        } else if (!!assets.models.ball) {
            progress = 2;
        } else if (!!assets.models.grid) {
            progress = 1;
        }
        progress = progress + assets.sprites.ball.length;
        ctx.strokeStyle = gridColor;
        ctx.fillStyle = ballColorB;
        ctx.fillRect(
            this.leftX,
            this.height / 2 - 5,
            this.rightX + this.ballSize - this.leftX,
            10
        );
        ctx.strokeRect(
            this.leftX,
            this.height / 2 - 5,
            this.rightX + this.ballSize - this.leftX,
            10
        );
        ctx.fillStyle = ballColorA;
        ctx.fillRect(
            this.leftX + 3,
            (this.height / 2) - 3,
            ((this.rightX + this.ballSize - this.leftX) - 6) * (assets.sprites.ball.length / numberOfFrames),
            6
        );
    };

    BoingWorld.prototype.renderGuide = function (ctx) {
        ctx.clearRect(0, this.topY, this.leftX, this.bottomY - this.topY);
        ctx.clearRect(this.leftX, 0, this.rightX - this.leftX, this.topY);
        // Note the top and bottom extremes.
        ctx.beginPath();
        ctx.strokeStyle = "#00F";
        ctx.moveTo(0, this.bottomY);
        ctx.lineTo(this.width, this.bottomY);
        ctx.moveTo(0, this.topY);
        ctx.lineTo(this.width, this.topY);

        // Note the left and right extremes.
        ctx.moveTo(this.rightX, 0);
        ctx.lineTo(this.rightX, this.height);
        ctx.moveTo(this.leftX, 0);
        ctx.lineTo(this.leftX, this.height);
        ctx.closePath();
        ctx.stroke();

        // Lastly, show the extreme edges of where the ball touches.
        ctx.beginPath();
        ctx.strokeStyle = "#FF0";
        ctx.moveTo(0, this.bottomY + this.ballSize);
        ctx.lineTo(this.width, this.bottomY + this.ballSize);
        ctx.moveTo(this.rightX + this.ballSize, 0);
        ctx.lineTo(this.rightX + this.ballSize, this.height);
        ctx.closePath();
        ctx.stroke();

        // Note the current position of the ball.
        ctx.beginPath();
        ctx.strokeStyle = "#0F0";
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, this.topY);
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.leftX, this.y);
        ctx.closePath();
        ctx.stroke();
    };

    BoingWorld.prototype.update = function (dt) {
        if (!this.isReady) {
            this.build();
            return;
        }
        // Move the ball.
        this.lastX = this.x;
        this.lastY = this.y;
        this.x += this.dx * dt; // left/right
        if (this.y < this.topY + 10) {
            this.y += this.dy * dt; // up/down: NB down is positive
        } else if (this.y < this.topY + 30) {
            this.y += this.dy * dt * 2;
        } else if (this.y < this.topY + 60) {
            this.y += this.dy * dt * 3;
        } else {
            this.y += this.dy * dt * 4;
        }

        // Clamp and bounce if necessary, left/right.
        if (this.x >= this.rightX) {
            this.x = this.rightX;
            this.dx *= -1;
        } else if (this.x <= this.leftX) {
            this.x = this.leftX;
            this.dx *= -1;
        }

        // Bounce the ball back up when it hits bottom.
        // If we just reverse direction, then rounding errors
        // will gradually slow the ball to a stop. The effect
        // is actually a fairly nice simulation of energy loss,
        // but it doesn't fit this demo well, so we "throw"
        // the ball back up at a constant velocity instead.
        if ((this.y) > this.bottomY) {
            this.y = this.bottomY;
            this.dy *= -1;
        }
        if (this.y < this.topY) {
            this.y = this.topY;
            this.dy *= -1;
        }
    };

    /**
     * Build the next item in the boot sequence.
     */
    BoingWorld.prototype.build = function () {
        var rotationMatrix;
        // BOOT SEQUENCE
        if (!assets.materials.shadow) {
            assets.materials.unknown = new pipeline3D.Material();
            assets.materials.unknown.ambient = "#FFF";
            assets.materials.grid = new pipeline3D.Material();
            assets.materials.grid.ambient = gridColor;
            assets.materials.shadow = new pipeline3D.Material();
            assets.materials.shadow.ambient = shadowColor;
            assets.materials.ballA = new pipeline3D.Material();
            assets.materials.ballA.ambient = ballColorA;
            assets.materials.ballB = new pipeline3D.Material();
            assets.materials.ballB.ambient = ballColorB;
        } else if (!assets.models.grid) {
            assets.models.grid = assets.generateGridModel(
                rows,
                columns,
                voxes
            );
        } else if (!assets.models.ball) {
            assets.models.ball = assets.generateBallModel(
                meridians,
                parallels
            );
        } else if (!assets.pictures.background) {
            // Initialize the background canvas.
            assets.pictures.background = assets.createBackground(
                this.machine.getLayer(0),
                assets.models.grid,
                this.gridDistance,
                pipeline3D.createRotationMatrix(Math.PI, 0, 0),
                gridColor
            );
        } else if (assets.sprites.ball.length < numberOfFrames) {
            rotationMatrix = pipeline3D.createRotationMatrix(
                ballPitch,
                TAU / (meridians * numberOfFrames) * assets.sprites.ball.length,
                ballRoll
            );
            assets.sprites.ball.push(
                assets.createBallSprite(
                    this.machine.getLayer(0),
                    assets.models.ball,
                    this.ballDistance,
                    rotationMatrix
                )
            );
            assets.sprites.shadow.push(
                assets.createShadowSprite(
                    this.machine.getLayer(0),
                    assets.models.ball,
                    this.ballDistance,
                    rotationMatrix,
                    assets.materials.shadow
                )
            );
        } else {
            // Draw the back grid.
            this.machine.getLayer(0).clearRect(0, 0, this.width, this.height);
            this.machine.getLayer(1).clearRect(0, 0, this.width, this.height);
            this.machine.getLayer(2).clearRect(0, 0, this.width, this.height);
            this.machine.getLayer(3).clearRect(0, 0, this.width, this.height);
            this.machine.getLayer(1).drawImage(assets.pictures.background, (this.width - assets.pictures.background.width) / 2, 0);
            this.isReady = true;
        }
    };

    return BoingWorld;
});
/** Test */
require(['Machine', 'BoingWorld'], function (Machine, BoingWorld) {
    "use strict";
    function loadConfig() {
        BoingWorld.reconfigure({
            'gridColor' : document.getElementById('gridColor').value,
            'shadowColor' : document.getElementById('shadowColor').value,
            'ballColorA' : document.getElementById('ballColorA').value,
            'ballColorB' : document.getElementById('ballColorB').value,
            'rows' : document.getElementById('rows').value,
            'columns' : document.getElementById('columns').value,
            'voxes' : document.getElementById('voxes').value,
            'parallels' : document.getElementById('parallels').value,
            'meridians' : document.getElementById('meridians').value,
            'ballPitch' : document.getElementById('ballPitch').value,
            'ballRoll' : document.getElementById('ballRoll').value
        });
    }
    function init() {
        var machine = new Machine(document.getElementById('screen')),
            boing = new BoingWorld(machine);
        document.getElementById('showGuide').addEventListener(
            'change',
            function (evt) {
                if (evt.target.id === 'showGuide') {
                    BoingWorld.reconfigure({
                        'showGuide': evt.target.checked
                    });
                    evt.stopPropagation();
                    machine.getLayer(3).clearRect(0, 0, machine.screen.width, machine.screen.height);
                    return false;
                }
            },
            false
        );
        document.getElementById('resetMachine').addEventListener(
            'click',
            function (evt) {
                if (evt.target.id === 'resetMachine') {
                    loadConfig();
                    machine.reset();
                    evt.preventDefault();
                    evt.stopPropagation();
                    return false;
                }
            },
            false
        );
        loadConfig();
        BoingWorld.reconfigure({
            'showGuide': !!document.getElementById('showGuide').checked
        });
        machine.load(boing);
    }
    window.addEventListener('DOMContentLoaded', init, false);
    return true;
});
