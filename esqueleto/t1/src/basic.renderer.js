(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */


        
    function inside(  x, y, primitive  ) {
        switch(primitive.shape){
            case 'circle':
                return (x - primitive.center[0])**2 + (y - primitive.center[1])**2 < primitive.radius**2;
            case 'triangle':
                var v0 = primitive.vertices[0];
                var v1 = primitive.vertices[1];
                var v2 = primitive.vertices[2];
                return isInsideTriangle(v0[0], v0[1], v1[0], v1[1], v2[0], v2[1], x, y);
            default:
                return false;    
        }

            
    }

    function area(x1, y1, x2, y2, x3, y3)
    {
        return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0);
    }

    function isInsideTriangle(x1, y1, x2, y2, x3, y3, x, y)
    {  
        /* Calculate area of triangle ABC */
        var A = area (x1, y1, x2, y2, x3, y3);
        
        /* Calculate area of triangle PBC */  
        var A1 = area (x, y, x2, y2, x3, y3);
        
        /* Calculate area of triangle PAC */  
        var A2 = area (x1, y1, x, y, x3, y3);
        
        /* Calculate area of triangle PAB */   
        var A3 = area (x1, y1, x2, y2, x, y);
        
        /* Check if sum of A1, A2 and A3 is same as A */
        return (A == A1 + A2 + A3);
    }
        
    
    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);   
        this.createImage(); 
    }

    function triangulate(primitive){
        switch(primitive.shape){
            case 'polygon':
                var vertices = primitive.vertices;
                var fixed = vertices[0];
                var scene = [];
                for(var i = 1; i < vertices.length -1; i++){
                    var triangle ={
                        shape : 'triangle',
                        vertices : [fixed, vertices[i], vertices[i+1]],
                        color : primitive.color
                    }
                    if(primitive.hasOwnProperty('xform')) triangle['xform'] = primitive.xform;
                    scene.push(triangle);
                }
                return scene;
            case 'circle':
                var scene = [];
                const resolution = 32;
                const center = primitive.center;
                const radius = primitive.radius;
                for(var i = 0; i < resolution; i++){
                    const j = (i+1) % resolution;
                    const part = (2*Math.PI) / resolution;

                    const u_x = (radius * Math.cos(part * i)) + center[0];
                    const u_y= (radius * Math.sin(part * i)) + center[1];

                    const v_x = (radius * Math.cos(part * j)) + center[0];
                    const v_y = (radius * Math.sin(part * j)) + center[1];
                    const u = [Math.round(u_x), Math.round(u_y)];
                    const v = [Math.round(v_x), Math.round(v_y)];
                    const coord = [center, u, v]
                    var triangle = {
                        shape : 'triangle',
                        vertices : coord,
                        color : primitive.color
                    }
                    if(primitive.hasOwnProperty('xform')) triangle['xform'] = primitive.xform;
                    scene.push(triangle);
                }
                return scene;
        }
        

        

    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc
                
                var preprop_scene = [];
                
                for( var primitive of scene ) {  
                    // do some processing
                    // for now, only copies each primitive to a new list
                    if(primitive.shape == 'polygon' || primitive.shape == 'circle'){
                        primitive = triangulate(primitive);
                        preprop_scene.push( ...primitive );
                    }else{
                       preprop_scene.push( primitive ); 
                    }
                }

                preprop_scene.forEach(function(primitive, index){
                    if(!primitive.hasOwnProperty('xform')) return;
                    switch(primitive.shape){
                        case 'triangle':
                            var t_vertices = [];
                            primitive.vertices.forEach(function(vertice){
                                const v = [vertice[0], vertice[1], 1];
                                var result = []
                                for(var i = 0; i < primitive.xform.length; i++){
                                    const x = primitive.xform[i];
                                    const vx = Math.round((v[0]*x[0]) + (v[1] * x[1]) + (v[2] * x[2]));
                                    result.push(vx)
                                }
                                t_vertices.push(result);
              
                            })
                            preprop_scene[index].vertices = t_vertices;
    
                    }

                })

                console.log(preprop_scene)
                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },



            boundingBox: function(primitive){
                switch(primitive.shape){
                    case 'circle':
                        var center = primitive.center;
                        var radius = primitive.radius;
                        return {
                            max_x : center[0] + radius, 
                            max_y : center[1] + radius,
                            min_x : center[0] - radius,
                            min_y : center[1] - radius
                        }

                    case 'triangle':
                        var maxx = Math.max.apply(Math, primitive.vertices.map(function(o){return o[0]}));
                        var minx = Math.min.apply(Math, primitive.vertices.map(function(o){return o[0]}));
                        var maxy = Math.max.apply(Math, primitive.vertices.map(function(o){return o[1]}));
                        var miny = Math.min.apply(Math, primitive.vertices.map(function(o){return o[1]}));
                        return {
                            max_x : maxx,
                            max_y : maxy,
                            min_x : minx,
                            min_y : miny
                        }
                }
            },

            rasterize: function() {
                var color;
         
                // In this loop, the image attribute must be updated after the rasterization procedure.
                for( var primitive of this.scene ) {

                    // Loop through all pixels
                    // Use bounding boxes in order to speed up this loop
                
                    var bb = this.boundingBox(primitive);
                    // for (var i = 0; i < this.width; i++) {
                    //     var x = i + 0.5;
                    //     for( var j = 0 ; j < this.height; j++) {
                    //         var y = j + 0.5;
                    for (var i = bb.min_x; i < bb.max_x; i++) {
                        var x = i + 0.5;
                        for( var j = bb.min_y ; j < bb.max_y; j++) {
                            var y = j + 0.5;

                            // First, we check if the pixel center is inside the primitive 
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = nj.array(primitive.color);
                                this.set_pixel( i, this.height - (j + 1), color );
                            }
                            
                        }
                    }
                }
                
               
              
            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color
         
                this.image.set(j, i, 0,    colorarr.get(0));
                this.image.set(j, i, 1,    colorarr.get(1));
                this.image.set(j, i, 2,    colorarr.get(2));
            },

            update: function () {
                // Loading HTML element
                var $image = document.getElementById('raster_image');
                $image.width = this.width; $image.height = this.height;

                // Saving the image
                nj.images.save( this.image, $image );
            }
        }
    );

    exports.Screen = Screen;
    
})));

