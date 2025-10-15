import * as THREE from 'three';

let backgroundSound;
let pickupSound;

class Audio {
    constructor() {
        const audioListener = new THREE.AudioListener();
        camera.add(audioListener);
        backgroundSound = new THREE.Audio(audioListener);
        pickupSound = new THREE.Audio(audioListener);
        scene.add(backgroundSound);
        scene.add(pickupSound);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(
            'res/background.mp3',
            function (audioBuffer) {
                backgroundSound.setBuffer(audioBuffer);
                backgroundSound.setLoop(true);
            },
        );
        audioLoader.load(
            'res/pickup.wav',
            function (audioBuffer) {
                pickupSound.setBuffer(audioBuffer);
            },
        );
    }

    tick(isPlaying) {
        if (isPlaying === true) {
            if (backgroundSound.isPlaying === false) {
                backgroundSound.play();
            }
        } else {
            if (backgroundSound.isPlaying === true) {
                backgroundSound.pause();
            }
        }
    }

    playPickup() {
        if (pickupSound.isPlaying === true) {
            pickupSound.stop();
        }
        
        pickupSound.play();
    }
}

export { Audio }