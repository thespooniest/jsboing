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

    var min = Math.min;

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
        //pointPrime[2] += 10;
        finalX = (canvas.width / 2) + (pointPrime[0] * d / pointPrime[2]);
        finalY = (canvas.height / 2) + (pointPrime[1] * d / pointPrime[2]);
        return [finalX, finalY, pointPrime[2]];
    }

    /**
     * Project a 3-D point onto a 2-D plane.
     *
     * This is an orthographic projection.
     *
     * @param {Array}  point [x,y,z] coordinates
     * @param {Number} d Distance from camera to origin
     * @param {Array}  rotationMatrix The rotation matrix.
     */
    function projectOrthographic(point, scale, offset) {
        /*return [
            scale[0] * point[0] + offset[0],
            scale[2] * point[2] + offset[2]
        ];*/
        var pointPrime = ruy.gemv(
                [
                    [scale[0], 0, 0, 0],
                    [0, scale[1], 0, 0],
                    [0, 0, scale[2], 0],
                    [0, 0, 0, 1]
                ],
                point,
                offset
            );
        return pointPrime.slice(0, 3);
    }

    function drawModelFlat(canvas, model, dFactor, rotationMatrix) {
        /*jslint unparam:true */
        var context = canvas.getContext("2d"),
            projected = model.vertices.map(function (point) {
                var p = project(
                    point,
                    dFactor,
                    rotationMatrix,
                    canvas
                );
                /*var p = projectOrthographic(
                    point,
                    //[dFactor, dFactor, dFactor],
                    [10, 10, 10],
                    [0, 0, 0]
                );*/
                return [p[0] | 0, p[1] | 0];
            }),
            faces = model.faces.slice(0);
        // Sort the faces so that back-most faces get sorted first.
        faces.sort(function (a, b) {
            var za = min.apply(undefined, a.vertices.map(function (point) {
                    return model.vertices[point][2];
                })),
                zb = min.apply(undefined, b.vertices.map(function (point) {
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
        });
    }

    function drawModelWire(canvas, model, dFactor, rotationMatrix) {
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
            faceSorter = function (backmost, point) {
                if (projected[point][2] < backmost) {
                    return point[2];
                }
                return backmost;
            },
            faces = model.faces.slice(0);
        // Sort the faces so that back-most faces get sorted first.
        faces.sort(function (a, b) {
            var za = a.vertices.reduce(faceSorter, Infinity),
                zb = b.vertices.reduce(faceSorter, Infinity);
            if (za < zb) {
                return 1;
            }
            if (za > zb) {
                return -1;
            }
            return 0;
        });
        faces.slice(0, faces.length / 2 | 0).forEach(function (face) {
            var i = 1,
                vertices = face.vertices,
                stop = vertices.length;
            context.beginPath();
            context.strokeStyle = face.material.ambient;
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
            context.stroke();
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
    exports.projectOrthographic = projectOrthographic;
    exports.drawModelLines = drawModelLines;
    exports.drawModelFlat = drawModelFlat;
    exports.drawModelWire = drawModelWire;
    exports.drawModelShadow = drawModelShadow;

    return exports;
});
