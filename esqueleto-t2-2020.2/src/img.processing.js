(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.ImageProcessing = {}));
}(this, (function (exports) { 'use strict';



    function ImageProcesser(img, kernel = null, xform = null, bhandler = 'icrop') {
        this.img = img.clone();
        this.width = img.shape[1];
        this.height = img.shape[0];
        this.kernel = kernel;
        this.xform = xform;
        this.bhandler = bhandler;
    }

    Object.assign( ImageProcesser.prototype, {

        apply_kernel: function(border = 'icrop') {
            let N = 3;
            let s = Math.floor(N/2);
            let data = this.img.clone();

            if(border == 'extend'){
                for(let i = 0; i < s; i ++){
                    //Expand bordas horizontais
                    data = nj.concatenate(data, data.slice(null, - 1))
                    data = nj.concatenate(data.slice(null,[0,1]), data)
                    //Expande bordas verticais
                    data = nj.concatenate(data.T, data.slice(- 1, null).T).T
                    data = nj.concatenate(data.slice([0,1], null).T, data.T).T
                }
            }

            let box = data.clone()
            
            for(var i=0; i< box.shape[0]; i++){
                for(var j = 0; j< box.shape[1]; j++){

                    let sub = data.slice([i - s, i + s + 1], [j - s, j + s + 1])
                    let f = (1/N**2) * sub.sum()

                    box.set(i,j, f)
                }
            }
            console.log(box.shape)
            console.log(this.img.shape)
            this.img = box;
            this.img = box.slice([s,-s], [s, -s]);
            this.width = this.img.shape[1];
            this.height = this.img.shape[0];
                // if(border =='icrop') {
                //     this.img = box.slice([s,-s], [s, -s]);
                //     this.width = this.img.shape[1];
                //     this.height = this.img.shape[0];
                // }else if(border == 'extend'){

                // }

            
            // Method to apply kernel over image (incomplete)
            // border: 'icrop' is for cropping image borders, 'extend' is for extending image border
            // You may create auxiliary functions/methods if you'd like

        },

        apply_xform: function()  {
            // Method to apply affine transform through inverse mapping (incomplete)
            // You may create auxiliary functions/methods if you'd like
        },

        update: function() {
            // Method to process image and present results
            var start = new Date().valueOf();

            if(this.kernel != null) {
                this.apply_kernel(this.bhandler);
            }

            if(this.xform != null) {
                this.apply_xform();
            }

            // Loading HTML elements and saving
            var $transformed = document.getElementById('transformed');
            $transformed.width = this.width; 
            $transformed.height = this.height;
            nj.images.save(this.img, $transformed);
            var duration = new Date().valueOf() - start;
            document.getElementById('duration').textContent = '' + duration;
        }

    } )


    exports.ImageProcesser = ImageProcesser;
    
    
})));

