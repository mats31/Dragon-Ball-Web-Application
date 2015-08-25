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
	this.density = 4;
	this.far = 10000;
	this.near = 0.1;
	this.view_angle = 45;

	// Hidden canvas attributes
	this.canvas;
	this.context;

	// Particles attributes
	this.limits;
	this.maxParticles = 28000;
	this.nextParticles = {
		"colors":[],
		"vertices":[]
	};
	this.particles;
	this.particleSystem;
	this.particleTexture;
	this.pMaterial;
	this.pivot;
	this.updating = false;

	// Characters
	this.datas;
	this.step = 0;

	// Image attributes
	this.img = new Image();
	this.pathImg = 'img/';
	this.loading = false;

	// Panel
	this.name = document.getElementById('name');
	this.subtitle = document.getElementById('subtitle');
	this.description = document.getElementById('description');
	this.ki = document.getElementById('ki');
	this.disableChange = true;
};

ParticleSystem.prototype.init = function(){

	var	that = this,
		firstImage = 'goku_01.png',
		promise;

	// Get container for scene canvas
	this.container = document.getElementById('container');
	this.height = window.innerHeight;
	this.width = window.innerWidth;

	// Set aspect for camera
	this.aspect = this.width/this.height;

	// Set renderer for webgl
	this.renderer = new THREE.WebGLRenderer({
		alpha: true
	});
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

	// Set positions for camera
	this.camera.position.x = (this.width / 2) / 2.1;
	this.camera.position.y = -300;
	this.camera.position.z = 1000;

	// Set hidden canvas
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	// Load characters
	this.loadJson().then(function(result){

		that.datas = JSON.parse(result);

		// Load first image from json
		that.loadImage(that.datas.characters[that.step].image).then(function(result){
			that.globalEvents();
			that.appendRenderer();
		}, function(err){
			console.log(err);
		});

	}, function(err){
		alert(err);
	});
	

};

ParticleSystem.prototype.globalEvents = function(){

	var that = this,
		button = document.getElementById('button'),
		previous = document.getElementById('previous'),
		next = document.getElementById('next');

	// button.addEventListener('click', function(){
	// 	that.appendRenderer();
	// }, false);
	
	window.addEventListener('resize', function(){
		that.resizeScene();
	}, false);

	previous.addEventListener('click', function(){
		if (that.disableChange)
			that.previousCharacter();
	}, false);

	next.addEventListener('click', function(){
		if (that.disableChange)
			that.nextCharacter();
	}, false);

};

ParticleSystem.prototype.resizeScene = function(){
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize(window.innerWidth, window.innerHeight);
}

ParticleSystem.prototype.appendRenderer = function(){

	this.container.appendChild(this.renderer.domElement);

	this.particles = new THREE.Geometry();
	this.particleTexture = THREE.ImageUtils.loadTexture(this.pathImg + "particle.png");

	this.pMaterial = new THREE.PointCloudMaterial({
		blending: THREE.AdditiveBlending,
		map: this.particleTexture,
		size: this.density * 1.5,
		opacity: 1,
		vertexColors:true,
		sizeAttenuation:true
	});

	this.createParticles();

    // create the particle system
    this.particleSystem = new THREE.PointCloud(
        this.particles,
        this.pMaterial);

    // also update the particle system to
	// sort the particles which enables
	// the behaviour we want
	this.particleSystem.sortParticles = true;



    // add it to the scene
    this.particleSystem.position.set(0,0,0);
    this.scene.add(this.particleSystem);

   this.update();
};

ParticleSystem.prototype.createParticles = function(){

	var pixels = this.context.getImageData(0,0,this.img.width,this.img.height),
		step = this.density * 4,
		x = 0,
		y = 0;

	for (var i = 0; i < this.maxParticles; i++) {
		var vector = new THREE.Vector3(0,0,0);
		var color = new THREE.Color('black');

		this.particles.vertices.push(vector);
		this.particles.colors.push(color);
	};

	this.changeCharacter();
	this.updatePanel();
};

ParticleSystem.prototype.updateParticles = function(){

	var pixels = this.context.getImageData(0,0,this.img.width,this.img.height),
		step = this.density * 4,
		x = 0,
		y = this.img.height,
		i = 0,
		j = 0,
		that = this;

	this.disableChange = false;

	for(x = 0; x < this.maxParticles; x+= step) {

    	for(y = this.img.height; y >= 0 ; y -= this.density) {

    		if (x < this.img.width * 4) {
	    		var p = ((y * this.img.width * 4) + x);
	    		
	    		// Grab the actual data from the
	    		// pixel, ignoring any transparent ones
	    		if(pixels.data[p+3] > 0)
			    {
			    	var pixelCol	= (pixels.data[p] << 16) + (pixels.data[p+1] << 8) + pixels.data[p+2];
			    	var color 		= new THREE.Color(pixelCol);
			    	var vector 		= new THREE.Vector3(-this.img.width/2 + x/4, -y, 0);
			    	
			    	// push on the particle
			    	this.particles.vertices[j].x = vector.x;
			    	this.particles.vertices[j].y = vector.y;
			    	//this.particles.colors[j] = color;

    		    	createjs.Tween.get(this.particles.colors[j])
    				    .to({r: color.r, g: color.g, b: color.b}, 3000, createjs.Ease.QuartIn);

    				createjs.Tween.get(this.particles.vertices[j])
    				    .to({z: Math.floor(Math.random()*101) - 50}, 1500, createjs.Ease.QuartIn)
    				    .to({z: 0}, 1500, createjs.Ease.QuartIn);
			    } else {
			    	var color 		= new THREE.Color('black');
			    	var vector 		= new THREE.Vector3(9999, 9999, 0);
			    	
			    	// push on the particle
			    	this.particles.vertices[j] = vector;
			    	this.particles.colors[j] = color;
			    }

    		} else{
    			var color 		= new THREE.Color('black');
    			var vector 		= new THREE.Vector3(9999, 9999, 0);
    			
    			// push on the particle
    			this.particles.vertices[j] = vector;
    			this.particles.colors[j] = color;
    		}
			
			j++;	
    	}
    }

    setTimeout(function(){
    	that.disableChange = true;
    }, 3000);
};

ParticleSystem.prototype.loadImage = function(image){

	var that = this;

	return new Promise(function(resolve, reject){

		that.img = new Image();
		that.img.src = that.pathImg + image;

		that.img.onload = function(){

			if (that.img.complete) {

				that.canvas.width = that.img.width;
			  	that.canvas.height = that.img.height;

			  	that.context.clearRect(0, 0, 9999, 9999);
				that.context.drawImage(that.img,0,0,that.img.width,that.img.height);

				resolve('Image loaded !');

			} else {
				reject(Error('Image not loaded :( !'));
			}

		};

		that.img.onerror = function(){
			reject(Error('Erreur réseau'));
		}

	});

};

ParticleSystem.prototype.loadJson = function(){

	return new Promise(function(resolve,reject){

		var req = new XMLHttpRequest();
		req.open('GET', 'js/datas.json');

		req.onload = function(){

			if(req.status == 200){
				resolve(req.response)
			} else{
				reject(Error(req.statusText));
			}
		};

		req.onerror = function(){
			reject(Error('Erreur réseau'));
		};

		req.send();
	});

};

ParticleSystem.prototype.previousCharacter = function(){

	this.loading = false;

	if (this.step - 1 >= 0){
		this.step--;
		this.changeCharacter();
		this.updatePanel();
	}
};


ParticleSystem.prototype.nextCharacter = function(){

	this.loading = false;

	if (this.step + 1 < this.datas.characters.length){
		this.step++;
		this.changeCharacter();
		this.updatePanel();
	}
};

ParticleSystem.prototype.changeCharacter = function(){

	var that = this;

	if (!this.loading) {

		this.loading = true;

		this.loadImage(this.datas.characters[this.step].image).then(function(result){
			console.log(result);
			that.updating = true;
			that.updateParticles();
		}, function(err){
			console.log(err);
		});
	};
}

ParticleSystem.prototype.updatePanel = function(){

	this.name.innerHTML = '';
	this.subtitle.innerHTML = '';
	this.description.innerHTML = '';

	this.showText(this.name, this.datas.characters[this.step].name, 0, 100);
	this.showText(this.subtitle, this.datas.characters[this.step].subtitle, 0, 50);
	this.showText(this.description, this.datas.characters[this.step].description, 0, 5);
	this.showKi(this.ki, this.datas.characters[this.step].ki);
};

ParticleSystem.prototype.showText = function(target, message, index, interval){

	var that = this;

	if (index < message.length) { 
		target.innerHTML += message[index++]; 
		setTimeout(function () { that.showText(target, message, index, interval); }, interval);
	} 
};

ParticleSystem.prototype.showKi = function(target, ki){
	var options = {
	  useEasing : true, 
	  useGrouping : true, 
	  separator : ' '
	},
	countUp = new CountUp(target,0,ki,0,3,options);

	countUp.start();
};

ParticleSystem.prototype.update = function(){
	requestAnimationFrame(this.update.bind(this));
	this.render();
};

ParticleSystem.prototype.render = function render(){
	if (this.updating) {
		this.particleSystem.geometry.verticesNeedUpdate = true;
		this.particleSystem.geometry.colorsNeedUpdate = true;
	}

  	this.particleSystem.rotation.y += 0.015;
	this.renderer.render(this.scene, this.camera);
};

var app = new ParticleSystem();
app.init();