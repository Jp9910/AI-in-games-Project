import {Game} from './Game/Game'
document.addEventListener("DOMContentLoaded", function() {
	const game = new Game();
	window.game = game; // for debugging

	// Add a resize event listener
	window.addEventListener("resize", onWindowResize);
});


function onWindowResize() {
	game.camera.aspect = window.innerWidth / window.innerHeight;
	game.camera.updateProjectionMatrix();

  	// Update the renderer size
	game.renderer.setSize(window.innerWidth, window.innerHeight);
}
