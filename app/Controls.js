import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { SPEED_CHANGE } from './GameParams.js';

let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

class Controls {
    constructor() {
        controls = new PointerLockControls(camera, document.body);
        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');
        instructions.addEventListener('click', function () {
            controls.lock();
        });

        controls.addEventListener('lock', function () {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });

        controls.addEventListener('unlock', function () {
            blocker.style.display = 'block';
            instructions.style.display = '';
        });

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);

        scene.add(controls.object);
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
            case 'ShiftLeft':
                moveDown = true;
                break;
            case 'Space':
                moveUp = true;
                break;
        }
    };

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
            case 'ShiftLeft':
                moveDown = false;
                break;
            case 'Space':
                moveUp = false;
                break;
        }
    };

    tick() {
        const time = performance.now();
    
        if (controls.isLocked === true && renderer.xr.isPresenting === false) {
            const delta = (time - prevTime) / 1000;
    
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.y -= velocity.y * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;
    
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.y = Number(moveDown) - Number(moveUp);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize(); // this ensures consistent movements in all directions
    
            if (moveForward || moveBackward) velocity.z -= direction.z * SPEED_CHANGE * delta;
            if (moveUp || moveDown) velocity.y -= direction.y * SPEED_CHANGE * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * SPEED_CHANGE * delta;
    
            controls.moveRight(-velocity.x * delta);
            controls.moveForward(-velocity.z * delta);
    
            controls.object.position.y += (velocity.y * delta);
            prevTime = time;
        }
    }

    isPlaying() {
        return controls.isLocked === true || renderer.xr.isPresenting === true;
    }

    isLocked() {
        return controls.isLocked;
    }

    getDirection(outVector) {
        return controls.getDirection(outVector);
    }
}

export { Controls };