export const sounds = {
    shuffle: new Audio('data:audio/mpeg;base64,...'),
    flip: new Audio('data:audio/mpeg;base64,...'),
    win: new Audio('data:audio/mpeg;base64,...'),
    bgMusic: new Audio('data:audio/mpeg;base64,...')
};
sounds.bgMusic.loop = true;
export let muted = false;

export function playSound(type) {
    if (!muted) sounds[type].play();
}

export function toggleMute() {
    muted = !muted;
    if (muted) sounds.bgMusic.pause();
    else sounds.bgMusic.play();
}
