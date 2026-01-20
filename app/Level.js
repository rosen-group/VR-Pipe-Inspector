import * as THREE from 'three';
import { getActiveCamera, isMobileDevice } from './Core.js';
import { PIPE_RADIUS, PIPE_LENGTH, ANOMALIES_PER_PIPE, VALVES_PER_PIPE, VALVE_RADIUS, MIN_ANOMALY_SIZE, MAX_ANOMALY_SIZE,
    SPEED_MULTIPLIER, ANIMATION_TIME, BOUNCE_BACK_MULTIPLIER, BOUNCE_RECOVERY_TIME } from './GameParams.js';

const pipelineMaterial = new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/pipeline.png'), side: THREE.DoubleSide });
const corosionMaterial = new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/corosion.png'), transparent: true });
const crackMaterial = new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/cracks.png'), transparent: true });
const waxMaterial = new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/wax.png'), transparent: true });
const gulliMaterials = [
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/gulli_side.png') }),
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/gulli.png') })];
const dataCloudMaterial = [
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/data_cloud.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/data_cloud_1.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/data_cloud_2.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/data_cloud_3.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: getTexturesFromAtlasFile('res/data_cloud_dark.png'), transparent: true })
];

let anomalyMaterials = [];
let pipelines = [];
let anomalies = [];
let animations = [];
let valves = [];
let pipeEnd;
let bounceTimer;

class Level {
    constructor() {
        if (pipelines.length > 0)
        {
            pipelines.forEach(p => {
                scene.remove(p);
            });

            pipelines = [];
        }

        if (valves.length > 0)
        {
            valves.forEach(v => {
                scene.remove(v);
            });

            valves = [];
        }

        if (anomalies.length > 0)
        {
            anomalies.forEach(a => {
                scene.remove(a);
            });

            anomalies = [];
        }

        if (animations.length > 0)
        {
            animations.forEach(a => {
                scene.remove(a);
            });

            animations = [];
        }

        if (pipeEnd !== undefined) {
            scene.remove(pipeEnd);
        }

        scene.add(new THREE.AmbientLight(0x404040));

        anomalyMaterials.push(corosionMaterial);
        anomalyMaterials.push(crackMaterial);
        anomalyMaterials.push(waxMaterial);

        pipelines.push(this.createPipeline(0));
        pipelines.push(this.createPipeline(-PIPE_LENGTH));

        const geometry = new THREE.CircleGeometry(10, 32);
        pipeEnd = new THREE.Mesh(geometry, gulliMaterials[1]);
        pipeEnd.position.z = PIPE_LENGTH / 2;
        pipeEnd.rotateX(Math.PI);
        scene.add(pipeEnd);

        bounceTimer = new THREE.Clock(false);
    }

    shiftObjects(offset) {
        if (pipeEnd.position.z + offset < 0.1) {
            offset = 0.1 - pipeEnd.position.z;
        }
        for (var i = 0; i < pipelines.length; i++) {
            pipelines[i].position.z += offset;
        }
    
        for (var i = 0; i < anomalies.length; i++) {
            anomalies[i].position.z += offset;
            if (anomalies[i].userData.animationObject) {
                anomalies[i].userData.animationObject.position.z += offset;
            }
        }
    
        for (var i = 0; i < valves.length; i++) {
            valves[i].position.z += offset;
        }
    
        pipeEnd.position.z += offset;
    }

    getIntersectedAnomalies(raycaster) {
        return raycaster.intersectObjects(anomalies);
    }

    getValves() {
        return valves;
    }
    
    animateObjects(isPlaying) {
        let refCamera = getActiveCamera();
    
        if (isPlaying) {
            let bounceMultiplier = 1.0;
            let baseSpeed = refCamera.position.z;
            if (isMobileDevice()) {
                baseSpeed = -1;
            }
            if (bounceTimer.running === true) {
                bounceMultiplier = bounceTimer.getElapsedTime() / BOUNCE_RECOVERY_TIME;
                if (bounceTimer.getElapsedTime() > BOUNCE_RECOVERY_TIME) {
                    bounceTimer.stop();
                }
            }

            for (var i = 0; i < pipelines.length; i++) {
                pipelines[i].position.z -= baseSpeed * SPEED_MULTIPLIER * bounceMultiplier;
            }
    
            for (var i = 0; i < anomalies.length; i++) {
                anomalies[i].position.z -= baseSpeed * SPEED_MULTIPLIER * bounceMultiplier;
                if (anomalies[i].userData.animationObject) {
                    anomalies[i].userData.animationObject.position.z -= baseSpeed * SPEED_MULTIPLIER * bounceMultiplier;
                }
            }
    
            for (var i = 0; i < valves.length; i++) {
                valves[i].position.z -= baseSpeed * SPEED_MULTIPLIER * bounceMultiplier;
            }
    
            pipeEnd.position.z -= baseSpeed * SPEED_MULTIPLIER * bounceMultiplier;
    
            const lastPipeline = pipelines[pipelines.length - 1];
            if (lastPipeline.position.z > -PIPE_LENGTH) {
                pipelines.push(this.createPipeline(lastPipeline.position.z - PIPE_LENGTH));
            }	
        }
    }
    
    animateAnimations() {
        for (var i = 0; i < animations.length; i++) {
            if (animations[i].userData.animationIndex < 4 && animations[i].userData.animationClock.getElapsedTime() - (animations[i].userData.animationIndex * ANIMATION_TIME) > 0) {
                animations[i].userData.animationIndex++;
                animations[i].material = dataCloudMaterial[animations[i].userData.animationIndex].clone();
            }
        }
    }

    createValve(zOffset) {
        let vec = this.getRandomPipeWallPosition(zOffset);
        let pipeShortening = 0;

        if (isMobileDevice()) {
            pipeShortening = 2;
        }
        const geometry = new THREE.CylinderGeometry(VALVE_RADIUS, VALVE_RADIUS, PIPE_RADIUS - pipeShortening, 32, 32); 
        const valve = new THREE.Mesh(geometry, gulliMaterials);
        valve.position.x = vec.v.x * 0.5;
        valve.position.y = vec.v.y * 0.5;
        valve.position.z = vec.v.z;
    
        valve.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        valve.rotateOnAxis(new THREE.Vector3(0, 0, 1), vec.a);
        
        valves.push(valve);
        scene.add(valve);
    }
    
    createAnomaly(zOffset) {
        let vec = this.getRandomPipeWallPosition(zOffset);
        
        const size = Math.random() * (MAX_ANOMALY_SIZE - MIN_ANOMALY_SIZE) + MIN_ANOMALY_SIZE;
        const geometry = new THREE.PlaneGeometry(size, size);
        const plane = new THREE.Mesh(geometry, anomalyMaterials[Math.floor(Math.random() * anomalyMaterials.length)].clone());
        plane.position.x = vec.v.x;
        plane.position.y = vec.v.y;
        plane.position.z = vec.v.z;
        plane.lookAt(0, 0, vec.v.z);
        plane.userData.analyzed = false;
        plane.userData.size = size;
        anomalies.push(plane);
        
        scene.add(plane);
    }

    getRandomPipeWallPosition(zOffset) {
        let z = (Math.random() * -PIPE_LENGTH) + (PIPE_LENGTH / 2) + zOffset;
        let angle = Math.random() * 2 * Math.PI;
        let vec = new THREE.Vector3(PIPE_RADIUS - 0.2, 0, 0);
        vec.add(new THREE.Vector3(0, 0, z));
        vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        return { v: vec, a: angle };
    }

    bounced() {
        this.shiftObjects(camera.position.z * BOUNCE_BACK_MULTIPLIER);
        if (bounceTimer.running === true) {
            bounceTimer.stop();
        }
        bounceTimer.start();
    }

    createPipeline(zOffset) {
        const geometry = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, PIPE_LENGTH, 32, 32, true); 
        const cylinder = new THREE.Mesh(geometry, pipelineMaterial);
        cylinder.position.z = zOffset;
        cylinder.rotateX(Math.PI / 2);
        scene.add(cylinder);
    
        for (var i = 0; i < ANOMALIES_PER_PIPE; i++) {
            this.createAnomaly(zOffset);
        }
        if (zOffset < 0)
        {
            for (var i = 0; i < VALVES_PER_PIPE; i++) {
                this.createValve(zOffset);
            }
        }
    
        return cylinder;
    }

    createPointsAnimation(anomaly) {
        const size = anomaly.userData.size * 2.0;
        const geometry = new THREE.PlaneGeometry(size, size);
        const plane = new THREE.Mesh(geometry, dataCloudMaterial[1].clone());
        plane.position.x = anomaly.position.x;
        plane.position.y = anomaly.position.y;
        plane.position.z = anomaly.position.z;
        plane.lookAt(0, 0, anomaly.position.z);
        plane.userData.animationIndex = 1;
        plane.userData.animationClock = new THREE.Clock();
        animations.push(plane);
        anomaly.userData.animationObject = plane;
        scene.add(plane);
    }
}

function getTexturesFromAtlasFile(atlasImgUrl) {
    const texture = new THREE.Texture();
    new THREE.ImageLoader()
        .load(atlasImgUrl, image => {
            let canvas, context;
            const tileHeight = image.height;
            const tileWidth = image.width;
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.height = tileHeight;
            canvas.width = tileWidth;
            context.drawImage(image, 0, 0, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.image = canvas;
            texture.needsUpdate = true;
        });

    return texture;
}

export { Level }