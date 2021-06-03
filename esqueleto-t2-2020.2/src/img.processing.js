(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.ImageProcessing = {}));
}(this, (function (exports) { 'use strict';

    const sobel_x = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    const sobel_y = [[ 1, 2, 1], [ 0, 0, 0], [-1,-2,-1]]
    const box = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
    nj.config.printThreshold = 28
    function ImageProcesser(img, kernel = null, xform = null, bhandler = 'icrop') {
        this.img = img.clone();
        this.width = img.shape[1];
        this.height = img.shape[0];
        this.kernel = kernel;
        this.xform = xform;
        this.bhandler = bhandler;
    }

    function multiply(m1,m2){
        let res = nj.zeros(m1.shape)
        for(let i = 0 ; i < m1.shape[0]; i++){
            for(let j = 0; j< m1.shape[1]; j++){
                let v = m1.get(i,j) * m2.get(i,j);
                //v = (v < 0)? 0 : v;
                //v = (v > 255)? 255 : v;
                res.set(i,j, v)
            }
        }
        return res;
    }
    function convolution(matrix, scalar = 1, kernel = box){
        let new_matrix = matrix.clone();

        for(let i = 1 ; i < matrix.shape[0] - 1; i++){
            for(let j = 1; j< matrix.shape[1] - 1; j++){

                let sub = matrix.slice([i - 1, i + 2], [j - 1, j + 2], false)
                
                let f = scalar * multiply(sub, nj.array(kernel)).sum()

                new_matrix.set(i,j, f)

            }
        }

        return new_matrix
    }

    

    Object.assign( ImageProcesser.prototype, {

        apply_kernel: function(border = 'icrop') {
            let data = this.img.clone();

            if(border == 'extend'){
                //Expand bordas horizontais
                data = nj.concatenate(data, data.slice(null, - 1))
                data = nj.concatenate(data.slice(null,[0,1]), data)
                //Expande bordas verticais
                data = nj.concatenate(data.T, data.slice(- 1, null).T).T
                data = nj.concatenate(data.slice([0,1], null).T, data.T).T
            }
            var new_img;
            switch(kernel){
                case 'box':
                    new_img = convolution(data, 1/9)
                    break;
                    
                case 'sobel':
                    let box = convolution(data, 1/9)
                    let gx = convolution(box, 1, sobel_x)
                    let gy = convolution(box, 1, sobel_y)
                    new_img = nj.add(gx, gy)
                    break;
            }
            
            this.img = new_img.slice([1,-1], [1, -1]);
            this.width = this.img.shape[1];
            this.height = this.img.shape[0];


            
            // Method to apply kernel over image (incomplete)
            // border: 'icrop' is for cropping image borders, 'extend' is for extending image border
            // You may create auxiliary functions/methods if you'd like

        },
        

        apply_xform: function()  {
            let data = nj.zeros(this.img.shape)
            for(let i = 0; i < data.shape[0]; i++){

            }
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

