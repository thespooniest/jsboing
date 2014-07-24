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
