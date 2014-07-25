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
