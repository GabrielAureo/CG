(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.ImageProcessing = {}));
}(this, (function (exports) { 'use strict';

    const kernels = {
        sobel_x : [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
        sobel_y : [[ 1, 2, 1], [ 0, 0, 0], [-1,-2,-1]],
        box : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
        laplace : [[0, -1, 0], [-1, 4, -1], [0, -1, 0]]
    }
    
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
    function convolution(matrix, kernel = box, border = 'icrop'){

        if(border == 'extend'){
            matrix = extend(matrix)
        }

        let new_matrix = nj.zeros(matrix.shape)
        console.log(matrix.toString())
        for(let i = 1 ; i < matrix.shape[0] - 1; i++){
            for(let j = 1; j < matrix.shape[1] - 1; j++){
                
                let sub = matrix.slice([i - 1, i + 2], [j - 1, j + 2])
                if (j == 1){
                    console.log(sub.toString())
                }
                let f = multiply(sub, nj.array(kernel).T).sum()

                new_matrix.set(i,j, f)

            }
        }

        new_matrix = new_matrix.slice([1,-1], [1, -1]);

        return new_matrix
    }

    function extend(matrix){
        let data = matrix.clone()
        //Expand bordas horizontais
        data = nj.concatenate(data, data.slice(null, - 1))
        data = nj.concatenate(data.slice(null,[0,1]), data)
        //Expande bordas verticais
        data = nj.concatenate(data.T, data.slice(- 1, null).T).T
        data = nj.concatenate(data.slice([0,1], null).T, data.T).T
        return data;
    }
    function dot(m1, m2){
        let ret = nj.zeros([m1.shape[0], m2.shape[1]])
        for(let i = 0; i < m1.shape[0]; i++){
            for(let j = 0; j < m1.shape[1]; j++){
                let sum = 0
                
                sum += m1.get(i,j) * m2.get(i,j)
            }
        }
    }

    

    Object.assign( ImageProcesser.prototype, {

        apply_kernel: function(border = 'icrop') {
            

            var new_img;
            switch(kernel){
                case 'box':
                    new_img = convolution(this.img, kernels.box, border).multiply(1/9)
                    break;
                    
                case 'sobel':
                    let box = convolution(this.img, kernels.box, 'extend').multiply(1/9)
                    let gx = convolution(box, kernels.sobel_x, border)
                    let gy = convolution(box, kernels.sobel_y, border)
                    // let gx = nj.convolve(box, sobel_x).multiply(1/8)
                    // let gy = nj.convolve(box, sobel_y).multiply(1/8)
                    new_img = nj.add(gx, gy)

                    break;
                case 'laplace':
                    new_img = convolution(this.img, kernels.laplace, border)
                    break;

            }
            
            this.img = new_img
            this.width = this.img.shape[1];
            this.height = this.img.shape[0];


            
            // Method to apply kernel over image (incomplete)
            // border: 'icrop' is for cropping image borders, 'extend' is for extending image border
            // You may create auxiliary functions/methods if you'd like

        },
        

        apply_xform: function()  {
            // let data = nj.ones(this.img.shape)
            // console.log(data.shape)
            // for(let i = 0; i < data.shape[0]; i++){
            //     for(let j = 0; j < data.shape[1]; j++){
            //         //console.log([i,j])
            //         let new_pos = nj.dot(this.xform, nj.array([i,j,1]).T)
            //         data.set(new_pos[0], new_pos[1], this.img.get(i,j))
            //     }
            // }
            // this.img = data
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

