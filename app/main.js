// Three.js REVISION 171
import * as THREE from 'three';
import { Controls } from './Controls.js';
import { UI } from './UI.js';
import { Audio } from './Audio.js';
import { Level } from './Level.js';
import { getActiveCamera, isGameOver } from './Core.js';
import { MIN_ANOMALY_SIZE, MAX_ANOMALY_SIZE, MAX_POINTS_PER_ANOMALY, VALVE_RADIUS } from './GameParams.js';

const raycaster = new THREE.Raycaster();
let lastPoints = 0;
let totalPoints = 0;
let gameEnded = false;

let controls;
let ui;
let audio;
let level;

init();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.layers.enable(1);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    
    controls = new Controls();
    level = new Level();
    ui = new UI();
    audio = new Audio();    

    timer = new THREE.Clock(false);
}

function compareScores(a, b) {
    if (a.score < b.score) {
        return 1;
    }
    if (a.score > b.score) {
        return -1;
    }
    return 0;
}

function animate() {
    if (!isGameOver()) {
        controls.tick();
        level.animateObjects(controls.isPlaying());
        tickIntersections();
    } else if (gameEnded === false) {
        gameEnded = true;
        let scores = JSON.parse(localStorage.getItem('scores'));
        if (scores === null) {
            scores = [];
        }
        let name = params.name;
        if (name === null) {
            name = 'Anonymous';
        }
        scores.push({ name: name, score: totalPoints });
        localStorage.setItem('scores', JSON.stringify(scores));
        scores.sort(compareScores);

        ui.showScore(scores);
    }
    level.animateAnimations();
    ui.refreshUi(lastPoints, totalPoints);
    audio.tick(controls.isPlaying());
    if (controls.isPlaying()) {
        if (timer.running === false) {
            timer.start();
        }
    }

    renderer.render(scene, camera);
}

function tickIntersections() {
    let refCamera = getActiveCamera();
    let lookDirection = new THREE.Vector3();
    
    if (controls.isLocked() === true) {
        controls.getDirection(lookDirection);
        raycaster.set(camera.position, lookDirection);
    }
    if (renderer.xr.isPresenting === true) {
        let xrCamera = renderer.xr.getCamera();
        xrCamera.getWorldDirection(lookDirection);
        raycaster.set(xrCamera.position, lookDirection);
    }
    const intersects = level.getIntersectedAnomalies(raycaster);
    for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].object.userData.analyzed === false) {
            intersects[i].object.userData.analyzed = true;
            lastPoints = MAX_POINTS_PER_ANOMALY - (MAX_POINTS_PER_ANOMALY * ((intersects[i].object.userData.size - MIN_ANOMALY_SIZE) / (MAX_ANOMALY_SIZE - MIN_ANOMALY_SIZE)));
            totalPoints += lastPoints;
            audio.playPickup();
            level.createPointsAnimation(intersects[i].object);
        }
    }
    
    if (refCamera) {
        const valves = level.getValves();
        for (var i = 0; i < valves.length; i++) {
            if (camera.position.z > valves[i].position.z - VALVE_RADIUS && camera.position.z < valves[i].position.z + VALVE_RADIUS) {
                var boxMatrixInverse = valves[i].matrixWorld.clone();
                boxMatrixInverse.invert();

                var inverseBox = valves[i].clone();
                var inversePoint = refCamera.position.clone();

                inverseBox.applyMatrix4(boxMatrixInverse);
                inversePoint.applyMatrix4(boxMatrixInverse);

                var bb = new THREE.Box3().setFromObject(inverseBox);

                if (bb.containsPoint(inversePoint)) {
                    level.bounced();
                    ui.bounced();
                }
            }
        }
    }
}

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
