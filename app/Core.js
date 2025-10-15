import { GAME_TIME } from "./GameParams.js";

export function getActiveCamera() {
    if (renderer.xr.isPresenting === true) {
        return renderer.xr.getCamera();
    }
    return camera;
}

export function isGameOver() {
    return GAME_TIME - timer.getElapsedTime() < 0;
}

export function isMobileDevice() {
    return navigator.userAgentData.mobile;
}