'use strict';
const arcadeLink = document.querySelector('a.back');
if (arcadeLink && window.parent !== window) {
  arcadeLink.addEventListener('click', event => {
    event.preventDefault();
    window.parent.postMessage('anirudh:close-game', window.location.origin);
  });
}
