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
                    currentDownNext,
                    currentNext
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
