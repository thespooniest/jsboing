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
