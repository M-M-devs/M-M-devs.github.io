import * as THREE from '../libs/three.module.js'

class DayNight extends THREE.Object3D {
	constructor() {
		super();
	
		this.createElements();

        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
		this.add(this.ambientLight);
	}

	currentPhase(angle) {
		if (Math.sin(angle) > Math.sin(0)) {
			return 'day'
		} else if (Math.sin(angle) > Math.sin(-Math.PI / 6)) {
			return 'twilight'
		} else {
			return 'night'
		}
	}

	createSunSphere() {
		var geometry = new THREE.SphereGeometry(10, 15, 15)
		var material = new THREE.MeshBasicMaterial({
			color: 0xFE7100
		})
		this.sunSphere = new THREE.Mesh(geometry, material)
		this.add(this.sunSphere)
	}

	updateSunSphere(angle) {
		this.sunSphere.position.x = 0;
		this.sunSphere.position.y = Math.sin(angle) * 200;
		this.sunSphere.position.z = Math.cos(angle) * 200;

		var phase = this.currentPhase(angle)
		// · Color del sol
		if (phase === 'day') {
			this.sunSphere.material.color.set("rgb(254," + (Math.floor(Math.sin(angle) * 200) + 113) + "," + (Math.floor(Math.sin(angle) * 200) + 0) + ")");
		} else if (phase === 'twilight') {
			this.sunSphere.material.color.set("rgb(254, 113, 0)");
		}
	}

	createSunLight(){
		this.sunLight	= new THREE.DirectionalLight( 0xffffff, 1 );
		// this.light.castShadow = true;
		this.add(this.sunLight);
	}

	updateSunLight(angle) {
		this.sunLight.position.x = 0;
		this.sunLight.position.y = Math.sin(angle) * 90000;
		this.sunLight.position.z = Math.cos(angle) * 90000;

		var phase = this.currentPhase(angle)
		if (phase === 'day') {
			this.sunLight.intensity = 1;
			this.sunLight.color.set("rgb(255," + (Math.floor(Math.sin(angle) * 200) + 55) + "," + (Math.floor(Math.sin(angle) * 200)) + ")");
		} else if (phase === 'twilight') {
			this.sunLight.intensity = 1;
			this.sunLight.color.set("rgb(" + (255 - Math.floor(Math.sin(angle) * 510 * -1)) + "," + (55 - Math.floor(Math.sin(angle) * 110 * -1)) + ",0)");
		} else {
			this.sunLight.intensity = 0;
		}
	}


	createMoonSphere() {
		var geometry = new THREE.SphereGeometry(10, 15, 15)
		var material = new THREE.MeshBasicMaterial({
			color: 0x90E0EF,
			transparent: true
		})
		this.moonSphere = new THREE.Mesh(geometry, material)
		
		this.add(this.moonSphere)
	}

	updateMoonSphere(angle) {
		this.moonSphere.position.x = 0;
		this.moonSphere.position.y = -Math.sin(angle) * 200;
		this.moonSphere.position.z = -Math.cos(angle) * 200;

		var phase = this.currentPhase(angle)
		// · Color de la luna
		if (phase === 'day') {
			if(this.moonSphere.material.opacity > 0)
				this.moonSphere.material.opacity -= 0.005;
			this.moonSphere.material.color.set("rgb(144, 224, 239)");
		} else if (phase === 'twilight') {
			if(this.moonSphere.material.opacity < 1)
				this.moonSphere.material.opacity += 0.005;
			this.moonSphere.material.color.set("rgb(114," + (Math.floor(Math.sin(angle) * 200) + 224) + "," + (Math.floor(Math.sin(angle) * 200) + 239) + ")");
		}
	}

	createMoonLight(){
		this.moonLight = new THREE.DirectionalLight( 0x0077B6, 1 );
		this.add(this.moonLight);
	}

	updateMoonLight(angle) {
		this.moonLight.position.x = 0;
		this.moonLight.position.y = -Math.sin(angle) * 90000;
		this.moonLight.position.z = -Math.cos(angle) * 90000;

		var phase = this.currentPhase(angle)
		if (phase === 'day') {
			if(this.moonLight.intensity > 0)
				this.moonLight.intensity -= 0.001;	
		} else if (phase === 'twilight') {
			if(this.moonLight.intensity < 1)
				this.moonLight.intensity += 0.01;
		} else {
			this.moonLight.intensity = 1;
		}
	}

	createShader(){
		this.shader	= {
			uniforms	: {
				topColor	: { type: "c", value: new THREE.Color().setHSL( 0.6, 1, 0.75 ) },
				bottomColor	: { type: "c", value: new THREE.Color( 0xffffff ) },
				offset		: { type: "f", value: 400 },
				exponent	: { type: "f", value: 0.6 },
			},
			vertexShader	: [
				'varying vec3 vWorldPosition;',
				'void main() {',
				'	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
				'	vWorldPosition = worldPosition.xyz;',
				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'}',
			].join('\n'),
			fragmentShader	: [
				'uniform vec3 topColor;',
				'uniform vec3 bottomColor;',
				'uniform float offset;',
				'uniform float exponent;',
		
				'varying vec3 vWorldPosition;',
		
				'void main() {',
				'	float h = normalize( vWorldPosition + offset ).y;',
				'	gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );',
				'}',
			].join('\n'),
		}
	}

	createSkydom(){
		var geometry	= new THREE.SphereGeometry( 700, 32, 15 );
		var shader = this.shader
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms)
		var material = new THREE.ShaderMaterial({
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			uniforms: uniforms,
			side: THREE.BackSide
		});

		this.skydom = new THREE.Mesh(geometry, material);
		this.add(this.skydom)
	}

	updateSkydom(angle){
		var phase	= this.currentPhase(angle)
		if( phase === 'day' ){
			this.skydom.material.uniforms.topColor.value.set("rgb(0,120,255)");
			this.skydom.material.uniforms.bottomColor.value.set("rgb(255,"+ (Math.floor(Math.sin(angle)*200)+55) + "," + (Math.floor(Math.sin(angle)*200)) +")");
		} else if( phase === 'twilight' ){
			this.skydom.material.uniforms.topColor.value.set("rgb(0," + (120-Math.floor(Math.sin(angle)*240*-1)) + "," + (255-Math.floor(Math.sin(angle)*510*-1)) +")");
			this.skydom.material.uniforms.bottomColor.value.set("rgb(" + (255-Math.floor(Math.sin(angle)*510*-1)) + "," + (55-Math.floor(Math.sin(angle)*110*-1)) + ",0)");
		} else {
			this.skydom.material.uniforms.topColor.value.set('black')
			this.skydom.material.uniforms.bottomColor.value.set('black');
		}
	}

	createStarField(){
		var texture	= THREE.ImageUtils.loadTexture('../images/galaxy_starfield.png')
		var material	= new THREE.MeshBasicMaterial({
			map	: texture,
			// transparent: true,
			side	: THREE.BackSide,
			color	: 0x808080,
		})
		var geometry = new THREE.SphereGeometry(100, 32, 32)
		this.starField = new THREE.Mesh(geometry, material)
		this.add(this.starField)
	}

	updateStarField(angle){
		var phase	= this.currentPhase(angle)
		if( phase === 'day' ){
			this.starField.visible	= false
		}else if( phase === 'twilight' ){
			this.starField.visible	= false
		} else {
			this.starField.visible	= true
			this.starField.rotation.y	= angle / 5
				var intensity	= Math.abs(Math.sin(angle))
				this.starField.material.color.setRGB(intensity, intensity, intensity)
		}
	}

	createElements(){
		this.createSunSphere();
		this.createSunLight();
		this.createMoonSphere();
		this.createMoonLight();
		this.createShader();
		this.createSkydom();
		this.createStarField();
	}

	update(angle) {
		this.updateSunSphere(angle);
		this.updateMoonSphere(angle);
		this.updateSunLight(angle);
		this.updateMoonLight(angle);
		this.updateSkydom(angle);
		this.updateStarField(angle)
	}
}
export { DayNight };