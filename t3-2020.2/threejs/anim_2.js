
function TakeoffAnimation() {}

Object.assign( TakeoffAnimation.prototype, {

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

        console.log(position)
        limb.matrix.makeTranslation(position.x, position.y, position.z ) 
        .premultiply( new THREE.Matrix4().makeTranslation(x, y, z ) );

        limb.updateMatrixWorld(true);

        // Updating screen
        stats.update();
        renderer.render(scene, camera); 
        console.log(limb.position)
    },
    init: function() {
        let animation = this;
        let torso =  robot.getObjectByName("torso");
        let left_leg =  robot.getObjectByName("left_upper_leg");
        let right_leg =  robot.getObjectByName("right_upper_leg");
        let right_arm = robot.getObjectByName("right_upper_arm");
        

        let torsoDescendTween = new TWEEN.Tween( {position : torso.position} )
        .to( { position : new THREE.Vector3(0, -.5, 0) }, 500)
        .onUpdate(function(){
            animation.translation_motion(torso, this._object.position);
        });

        let torsoTakeoffTween = new TWEEN.Tween( {position : torso.position} )
        .to( { position : new THREE.Vector3(0, 15, 0) }, 500)
        .onUpdate(function(){
            animation.translation_motion(torso, this._object.position);
        });

        
        let leftUpperLegDescendTween = new TWEEN.Tween( {theta : 0} )
        .to( { theta : -Math.PI/5 }, 500)
        .onUpdate(function(){
            animation.anchored_rotation(left_leg, {x: 0, y: 2, z: 0} ,this._object.theta);
        });
        let leftLegDescendTween =  new TWEEN.Tween( {theta : 0} )
        .to( { theta : Math.PI/2 }, 500)
        .onUpdate(function(){
            animation.anchored_rotation(left_leg.children[0], {x: 0, y:1 , z: 0} ,this._object.theta);
        });

        let rightArmDescendTween = new TWEEN.Tween( {theta : 0} )
        .to( { theta : Math.PI }, 500)
        .onUpdate(function(){
            animation.anchored_rotation(right_arm, {x: 0, y:1 , z: 0} ,this._object.theta);
        });

        let rightUpperLegDescendTween = new TWEEN.Tween( {theta : 0} )
        .to( { theta : Math.PI/5 }, 500)
        .onUpdate(function(){
            animation.anchored_rotation(right_leg, {x: 0, y: 2, z: 0} ,this._object.theta);
        });
        let rightLegDescendTween =  new TWEEN.Tween( {theta : 0} )
        .to( { theta : -Math.PI/2 }, 500)
        .onUpdate(function(){
            animation.anchored_rotation(right_leg.children[0], {x: 0, y:1 , z: 0} ,this._object.theta);
        });

        let leftUpperLegTakeoffTween = new TWEEN.Tween( {theta : -Math.PI/5} )
        .to( { theta : 0 }, 100)
        .onUpdate(function(){
            animation.anchored_rotation(left_leg, {x: 0, y: 2, z: 0} ,this._object.theta);
        });

        let rightUpperLegTakeoffTween = new TWEEN.Tween( {theta : Math.PI/5} )
        .to( { theta : 0 }, 100)
        .onUpdate(function(){
            animation.anchored_rotation(right_leg, {x: 0, y: 2, z: 0} ,this._object.theta);
        });

        let leftLegTakeoffTween = new TWEEN.Tween( {theta : Math.PI/2} )
        .to( { theta : 0 }, 100)
        .onUpdate(function(){
            animation.anchored_rotation(left_leg.children[0], {x: 0, y:1 , z: 0} ,this._object.theta);
        });

        let rightLegTakeoffTween = new TWEEN.Tween( {theta : -Math.PI/2} )
        .to( { theta : 0 }, 100)
        .onUpdate(function(){
            animation.anchored_rotation(right_leg.children[0], {x: 0, y:1 , z: 0} ,this._object.theta);
        });



        
        // upperRightArmTween.chain(lowerRightArmTweenUp);
        // lowerRightArmTweenUp.chain(lowerRightArmTweenDown);
        // lowerRightArmTweenDown.chain(lowerRightArmTweenUp)

        torsoDescendTween.
        chain(torsoTakeoffTween, leftUpperLegTakeoffTween, rightUpperLegTakeoffTween, leftLegTakeoffTween, rightLegTakeoffTween);
        
        //  upperArmTween.chain( ... ); this allows other related Tween animations occur at the same time
        torsoDescendTween.start();  
        leftUpperLegDescendTween.start();
        leftLegDescendTween.start();
        rightUpperLegDescendTween.start();
        rightLegDescendTween.start();
        rightArmDescendTween.start();
        //leftFootTween.start();
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




