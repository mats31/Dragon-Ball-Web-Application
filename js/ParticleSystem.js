var ParticleSystem = function(){

	// Scene attributes
	this.container;
	this.height;
	this.renderer;
	this.scene;
	this.width;

	// Camera attributes
	this.aspect;
	this.camera;
	this.density = 3;
	this.far = 10000;
	this.near = 0.1;
	this.view_angle = 45;

	// Hidden canvas attributes
	this.canvas;
	this.context;

	// Particles attributes
	this.particles;
	this.particleSystem;
	this.particleTexture;
	this.pMaterial;

	// Image attributes
	this.img = new Image();
	this.pathImg = 'img/';

};

ParticleSystem.prototype.init = function(){

	var button = document.getElementById('button'),
		that = this,
		firstImage = 'goku_01.png',
		promise;

	// Get container for scene canvas
	this.container = document.getElementById('container');
	this.height = window.innerHeight;
	this.width = window.innerWidth;

	// Set aspect for camera
	this.aspect = this.width/this.height;

	// Set renderer for webgl
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(this.width, this.height);

	// Set camera with PerspectiveCamera
	this.camera = new THREE.PerspectiveCamera(
			this.view_angle,
			this.aspect,
			this.near,
			this.far
		);

	// Set the scene
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);

	// Set z position for camera
	this.camera.position.z = 1000;

	// Set hidden canvas
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	// Load first image
	this.loadImage(firstImage).then(function(result){
		console.log(result);
		that.globalEvents();
	}, function(err){
		console.log(err);
	});

};

ParticleSystem.prototype.globalEvents = function(){

	var that = this;

	button.addEventListener('click', function(){
		that.appendRenderer();
	}, false);

};

ParticleSystem.prototype.appendRenderer = function(){

	this.container.appendChild(this.renderer.domElement);

	this.particles = new THREE.Geometry();
	this.particleTexture = THREE.ImageUtils.loadTexture(this.pathImg + "particle.png");

	this.pMaterial = new THREE.PointCloudMaterial({
		blending: THREE.AdditiveBlending,
		map: particleTexture,
		size: this.density * 1.5,
		opacity: 1,
		vertexColors:true,
		sizeAttenuation:true
	});

	var pixels = this.context.getImageData(0,0,this.img.width,this.img.height),
		step = this.density * 4,
		x = 0,
		y = 0;

	for(x = 0; x < this.img.width * 4; x+= step) {

    	for(y = this.img.height; y >= 0 ; y -= this.density) {

    		var p = ((y * this.img.width * 4) + x);
    		
    		// Grab the actual data from the
    		// pixel, ignoring any transparent ones
    		if(pixels.data[p+3] > 0)
		    {
		    	var pixelCol	= (pixels.data[p] << 16) + (pixels.data[p+1] << 8) + pixels.data[p+2];
		    	var color 		= new THREE.Color(pixelCol);
		    	var vector 		= new THREE.Vector3(-this.img.width/2 + x/4, 240 - y, Math.floor(Math.random() * 0));
		    	
		    	// push on the particle
		    	this.particles.vertices.push(vector);
		    	this.particles.colors.push(color);
		    }
    	}
    }

    // create the particle system
    this.particleSystem = new THREE.PointCloud(
        this.particles,
        this.pMaterial);

    // also update the particle system to
	// sort the particles which enables
	// the behaviour we want
	this.particleSystem.sortParticles = true;

    // add it to the scene
    this.scene.add(this.particleSystem);

    this.update();

};

ParticleSystem.prototype.loadImage = function(image){

	var that = this;

	return new Promise(function(resolve, reject){

		that.img.src = that.pathImg + image;

		that.img.onload = function(){

			if (that.img.complete) {

				that.canvas.width = that.img.width;
			  	that.canvas.height = that.img.height;

				that.context.drawImage(that.img,0,0,that.img.width,that.img.height);

				resolve('Image loaded !');

			} else {
				reject(Error('Image not loaded :( !'));
			}

		};

	});

};

ParticleSystem.prototype.update = function(){
	requestAnimationFrame(this.update.bind(this));
	this.render();
};

ParticleSystem.prototype.render = function render(){
	var timer = Date.now() * 0.0004;

  	this.camera.position.x = Math.cos( timer ) * 1000;
  	this.camera.position.z = Math.sin( timer ) * 1000;

	this.camera.lookAt(this.scene.position);
  	
	this.renderer.render(this.scene, this.camera);
};

var app = new ParticleSystem();
app.init();