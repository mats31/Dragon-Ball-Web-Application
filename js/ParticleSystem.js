var ParticleSystem = function(){

	// Scene attributes
	this.$container;
	this.height = window.innerHeight;
	this.renderer;
	this.scene;
	this.width = window.innerWidth;

	// Camera attributes
	this.camera;
	this.density = 3;
	this.far = 10000;
	this.near = 0.1;
	this.view_angle = 45;

	// Image attributes
	this.img;

};

ParticleSystem.prototype.init = function(){

	var button = document.getElementById('button'),
		that = this;

	button.addEventListener('click', function(){
		that.setScene();
	}, false);

}