import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { getActiveCamera, isGameOver, isMobileDevice } from './Core.js';
import { GAME_TIME, BOUNCE_RECOVERY_TIME } from './GameParams.js';

const loader = new FontLoader();

let font;
let gui;
let xrGui;
let lastGuiRefresh = 0;
let crosshair;
let xrCrosshair;
let bouncePlane;
let xrBouncePlane;
let bounceTimer;

class UI {
    constructor() {
        loader.load('../node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function (response) {
            font = response;
            createText();
        } );

        document.body.appendChild(VRButton.createButton(renderer));

        const crosshairGeometry = new THREE.RingGeometry(0.0125, 0.025, 32);
        const crosshairMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        crosshair = new THREE.Mesh(crosshairGeometry, crosshairMaterial);
        camera.add(crosshair);
        crosshair.position.z = -5;
        crosshair.rotation.y = Math.sin(Math.PI);

        const geometry = new THREE.PlaneGeometry(5, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
        bouncePlane = new THREE.Mesh(geometry, material);
        camera.add(bouncePlane);
        bouncePlane.position.z = -1.1;
        bouncePlane.rotation.y = Math.sin(Math.PI);

        bounceTimer = new THREE.Clock(false);

        window.addEventListener('resize', this.onWindowResize);
    }

    bounced() {
        if (bounceTimer.running === true) {
            bounceTimer.stop();
        }
        bounceTimer.start();
        bouncePlane.opacity = 0;
        if (xrBouncePlane !== undefined) {
            xrBouncePlane.opacity = 0;
        }
    }
    
    refreshUi(lastPoints, totalPoints) {
        if (gui !== undefined) {
            if (timer.getElapsedTime() - lastGuiRefresh > 1 && GAME_TIME - timer.getElapsedTime() > -3) {
                gui.geometry = createTextGeometry(lastPoints, totalPoints);
                if (xrGui === undefined) {
                    let xrCamera = renderer.xr.getCamera();
                    if (xrCamera.cameras.length > 0) {
                        xrGui = gui.clone();
                        xrCamera.cameras[0].add(xrGui);
                    }
                } else {
                    xrGui.geometry = createTextGeometry(lastPoints, totalPoints);
                }
    
                lastGuiRefresh = timer.getElapsedTime();
            }
        }
    
        if (xrCrosshair === undefined) {
            let xrCamera = renderer.xr.getCamera();
            if (xrCamera.cameras.length > 0) {
                xrCrosshair = crosshair.clone();
                xrCamera.cameras[0].add(xrCrosshair);
            }
        }
        if (xrBouncePlane === undefined) {
            let xrCamera = renderer.xr.getCamera();
            if (xrCamera.cameras.length > 0) {
                xrBouncePlane = bouncePlane.clone();
                xrCamera.cameras[0].add(xrBouncePlane);
            }
        }
        
        if (bounceTimer.running === true) {
            let opacity = 1.0 - (bounceTimer.getElapsedTime() / BOUNCE_RECOVERY_TIME);
            bouncePlane.material.opacity = opacity;
            if (xrBouncePlane !== undefined) {
                xrBouncePlane.material.opacity = opacity;
            }
            if (bounceTimer.getElapsedTime() > BOUNCE_RECOVERY_TIME) {
                bounceTimer.stop();
            }
        }
    }

    showScore(scores) {
        let scoreText = 'Highscore (Top 10)\n';
        for (var i = 0; i < Math.min(scores.length, 10); i++) {
            scoreText += `${scores[i].name}: ${scores[i].score.toFixed(1)}\n`;
        }
        let scoreGeometry = new THREE.ShapeGeometry(font.generateShapes(
            scoreText,
            0.03
        ));
        let scoreMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        let scoreMesh = new THREE.Mesh(scoreGeometry, scoreMaterial);
        scoreMesh.position.z = -1;
        scoreMesh.position.y = 0.3;
        camera.add(scoreMesh);
        if (renderer.xr.isPresenting === true) {
            let xrCamera = renderer.xr.getCamera();
            if (xrCamera.cameras.length > 0) {
                let xrScoreMesh = scoreMesh.clone();
                xrCamera.cameras[0].add(xrScoreMesh);
            }
        }
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function createTextGeometry(lastPoints, totalPoints) {
    let refCamera = getActiveCamera();
    let speed = -refCamera.position.z;
    if (isMobileDevice()) {
        speed = 1;
    }
    return new THREE.ShapeGeometry(font.generateShapes(
        `last points:   ${lastPoints.toFixed(1)}\n` +
        `total points: ${totalPoints.toFixed(1)}\n` +
        `speed:         ${speed.toFixed(1)}\n` +
        `time left:      ${(isGameOver() ? 'GAME OVER!' : (GAME_TIME - timer.getElapsedTime()).toFixed(1))}`,
        0.03
    ));
}

function createText() {
    let textGeo = createTextGeometry(0, 0);
    let textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    gui = new THREE.Mesh(textGeo, textMaterial);
    gui.position.z = -1;
    gui.position.x = -0.6;
    gui.position.y = 0.3;
    camera.add(gui);
}

export { UI }