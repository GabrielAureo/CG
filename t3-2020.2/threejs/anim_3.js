
function FlyAnimation() {}

Object.assign( FlyAnimation.prototype, {

    anchored_rotation: function(limb, pivot, theta) {
        let [x, y, z] = [limb.position.x, limb.position.y, limb.position.z];


        limb.matrix.makeTranslation(0,0,0)
        .premultiply( new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z ) )
        .premultiply( new THREE.Matrix4().makeRotationZ(theta))
        .premultiply( new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z ) )
        .premultiply( new THREE.Matrix4().makeTranslation(x, y, z ) );

        console.log(limb.position)

        // Updating final world matrix (with parent transforms) - mandatory
        limb.updateMatrixWorld(true);
        // Updating screen
        
        stats.update();
        renderer.render(scene, camera);    
        
    },
    translation_motion:function(limb, position){
        let [x, y, z] = [limb.position.x, limb.position.y, limb.position.z];
        limb.matrix.makeTranslation(position.x, position.y, position.z ) 
        //.premultiply( new THREE.Matrix4().makeTranslation(x, y, z ) );

        //limb.updateMatrixWorld(true);

        // Updating screen
        stats.update();
        renderer.render(scene, camera); 
    },


    sine_motion: function(limb, angle) {
        let [x, y, z] = [limb.position.x, limb.position.y, limb.position.z];

        limb.matrix.makeRotationZ(-Math.PI/2)
        .premultiply( new THREE.Matrix4().makeTranslation(0, Math.sin(angle), 0) )
        .premultiply( new THREE.Matrix4().makeTranslation(x, y, z ) );
        limb.updateMatrixWorld(true);
        stats.update();
        renderer.render(scene, camera); 
    },

    init: function() {
        let animation = this;
        let torso =  robot.getObjectByName("torso");
        let left_leg =  robot.getObjectByName("left_upper_leg");
        let right_leg =  robot.getObjectByName("right_upper_leg");
        let left_arm  = robot.getObjectByName("left_upper_arm");
        

        let zigZagFly = new TWEEN.Tween( { x : 0 } ).
        to({x: 2* Math.PI}, 1000).
        onUpdate(function(){
            animation.sine_motion(torso, this._object.x);
        })
        .repeat(100);

        zigZagFly.start();

        let leftUpperArmTween = new TWEEN.Tween( {theta : 0} )
        .to( { theta : -Math.PI }, 500)
        .onUpdate(function(){
            animation.anchored_rotation(left_arm,{x: 0, y: 2, z: 0} ,this._object.theta);
        });

        leftUpperArmTween.delay(1000);
        leftUpperArmTween.start();

        let flyAwayTween = new TWEEN.Tween( {position : torso.position} )
        .to( { position : new THREE.Vector3(100, 0, 0) }, 500)
        .onUpdate(function(){
            animation.translation_motion(torso, this._object.position);
        });

        flyAwayTween.delay(2000);
        flyAwayTween.start();
    },
    animate: function(time) {
        
        window.requestAnimationFrame(this.animate.bind(this));
        
        TWEEN.update(time);
    },
    run: function() {
        this.init();
        this.animate(0);
    }
});




