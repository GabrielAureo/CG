function WaveAnimation() {}

Object.assign( WaveAnimation.prototype, {

    anchored_motion : function(limb_name, pivot, theta) {
        let limb =  robot.getObjectByName(limb_name);
        let [x, y, z] = [limb.position.x, limb.position.y, limb.position.z];
        //let pivot = {x: 0, y: 2, z:0};

        limb.matrix.makeTranslation(0,0,0)
        .premultiply( new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z ) )
        .premultiply( new THREE.Matrix4().makeRotationZ(theta))
        .premultiply( new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z ) )
        .premultiply( new THREE.Matrix4().makeTranslation(x, y, z ) );



        // Updating final world matrix (with parent transforms) - mandatory
        limb.updateMatrixWorld(true);
        // Updating screen
        stats.update();
        renderer.render(scene, camera);    
    },
    init: function() {
        let animation = this;
        let upperRightArmTween = new TWEEN.Tween( {theta:0} )
        .to( { theta: Math.PI/ 2 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("right_upper_arm", {x:-0.25, y:2, z:0}, this._object.theta);
        });
        
        let lowerRightArmTweenUp = new TWEEN.Tween( {theta:0} )
        .to( { theta: Math.PI/ 2 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("right_lower_arm", {x:0, y:1, z:0}, this._object.theta);
        })
        let lowerRightArmTweenDown = new TWEEN.Tween( {theta: Math.PI/ 2 } )
        .to( { theta: 0 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("right_lower_arm", {x:0, y:1, z:0}, this._object.theta);
        })

        let headTween = new TWEEN.Tween( {theta: 0 } )
        .to( { theta: (1 * Math.PI)/ 10 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("head", {x:-.1, y:-1, z:0}, this._object.theta);
        }).start()
        
        let leftArmTween = new TWEEN.Tween( {theta: 0 } )
        .to( { theta: -(1 * Math.PI)/ 30 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("left_upper_arm", {x:-0.25, y:2, z:0}, this._object.theta);
        })


       
        new TWEEN.Tween( {theta: 0 } )
        .to( { theta: -(1 * Math.PI)/ 20 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("left_lower_arm", {x:0, y:1, z:0}, this._object.theta);
        }).start() 
        
        new TWEEN.Tween( {theta: 0 } )
        .to( { theta: -(1 * Math.PI)/ 10 }, 500)
        .onUpdate(function(){
            animation.anchored_motion("left_hand", {x:0, y:0, z:0}, this._object.theta);
        }).start() 

        upperRightArmTween.chain(lowerRightArmTweenUp);
        lowerRightArmTweenUp.chain(lowerRightArmTweenDown);
        lowerRightArmTweenDown.chain(lowerRightArmTweenUp)

            
        
        //  upperArmTween.chain( ... ); this allows other related Tween animations occur at the same time
        upperRightArmTween.start();  
        leftArmTween.start();   
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




