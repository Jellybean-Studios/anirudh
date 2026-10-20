# Falling Blocks

Adapted from [Jake Gordon's javascript-tetris](https://github.com/jakesgordon/javascript-tetris), available under the MIT license. The exact upstream copyright and permission notice is preserved in `LICENSE` and the game has visible source attribution.

All runtime files are in this folder: `index.html`, `style.css`, and `game.js`. There are no remote scripts, fonts, images, analytics, or game servers. The attribution link only navigates if clicked.

Changes include a responsive interface, keyboard and touch controls, pause/resume, hard drop, a ghost piece, a seven-piece bag, and local browser saves. The board, current piece, next piece, remaining bag, score, lines, and fall timer save after gameplay actions and falling steps. Navigating away or hiding the tab pauses the game. Reloading restores a saved game paused. The best score is saved separately. Saved progress is specific to this browser and origin and can be cleared by browser storage settings; storage failures are shown in the interface.

This independent falling-block game is not an official Tetris product. Its licensing does not grant rights to official Tetris branding or assets. No access-filter bypasses or external proxy services are included.

Storage keys:
- `anirudh.falling-blocks.state.v1`
- `anirudh.falling-blocks.best.v1`
