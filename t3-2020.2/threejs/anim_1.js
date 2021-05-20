function WaveAnimation() {}

Object.assign( WaveAnimation.prototype, {

    init: function() {
        
        let upperArmTween = new TWEEN.Tween( {theta:0} )
            .to( {theta:Math.PI }, 500)
            .onUpdate(function(){
                // This is an example of rotation of the right_upper_arm 
                // Notice that the transform is M = T * R 
                
                let right_upper_arm =  robot.getObjectByName("right_upper_arm");
                let [x, y, z] = [right_upper_arm.position.x, right_upper_arm.position.y, right_upper_arm.position.z];
                let pivot = {x:0, y:1, z:0};
                right_upper_arm.rotateAroundPoint(new THREE.Vector3(2.6,1,0), 1);
                //right_upper_arm.matrixAutoUpdate = true;
                let rotated_arm_matrix = right_upper_arm.matrix;
                console.log(rotated_arm_matrix.elements)
                right_upper_arm.matrix.getInverse(rotated_arm_matrix);
                console.log(rotated_arm_matrix.elements)

                // right_upper_arm.rotateAroundPoint(new THREE.Vector3(2.6,1,0), .1);
                //right_upper_arm.matrix.makeRotationZ(this._object.theta).premultiply( new THREE.Matrix4().makeTranslation(2.6, 0, 0 ) );



                // Updating final world matrix (with parent transforms) - mandatory
                right_upper_arm.updateMatrixWorld(true);
                // Updating screen
                stats.update();
                renderer.render(scene, camera);    
            })
        // Here you may include animations for other parts 
            
        
        //  upperArmTween.chain( ... ); this allows other related Tween animations occur at the same time
        upperArmTween.start();       
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




