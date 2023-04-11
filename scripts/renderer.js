const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = false;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    rotateLeft() {

    }
    
    //
    rotateRight() {

    }
    
    //
    moveLeft() {
        this.scene.prp[0] -= 1;
        this.scene.srp[0] -= 1;
    }
    
    //
    moveRight() {
        this.scene.prp[0] += 1;
        this.scene.srp[0] += 1;
    }
    
    //
    moveBackward() {
        this.scene.prp[2] += 1;
        this.scene.srp[2] += 1;
    }
    
    //
    moveForward() {
        this.scene.prp[2] -= 1;
        this.scene.srp[2] -= 1;
    }

    //
    draw() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);



        console.log('draw()');
        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;

        let vup = this.scene.view.vup;
        let clip = this.scene.view.clip;
        let z_min = -clip[4]/clip[5]

        let canon_transform = mat4x4Perspective(prp, srp, vup, clip);
        console.log(canon_transform);
        let model_arr = this.scene.models;

        let newLines = [];
        for(let i = 0; i < model_arr.length; i++){
            let vertex_arr = model_arr[i].vertices;
            let edges_arr = model_arr[i].edges;

            // Changing the Vertices to Canon view
            for(let j = 0; j < vertex_arr.length; j++){
                vertex_arr[j] = Matrix.multiply([canon_transform, vertex_arr[j]]);
            }

            // Applying Clipping
            for(let k = 0; k < edges_arr.length; k++){
                for (let l = 0; l < edges_arr[k].length -1; l++){
                    let line = {pt0: vertex_arr[edges_arr[k][l]], 
                                pt1: vertex_arr[edges_arr[k][l+1]]};
                    let newLine = this.clipLinePerspective(line, z_min);
                    newLines.push(newLine);
                    }
            }


            for (let pt = 0; pt < newLines.length; pt++){
                let viewPort = mat4x4Viewport(this.canvas.width, this.canvas.height);
                let newPt0 = Matrix.multiply([mat4x4MPer(), newLines[pt].pt0]);
                newPt0 = Matrix.multiply([viewPort, newPt0]); 
    

                let newPt1 = Matrix.multiply([mat4x4MPer(), newLines[pt].pt1]);
                newPt1 = Matrix.multiply([viewPort, newPt1]);
                this.drawLine(newPt0.x/newPt0.w, newPt0.y/newPt0.w, newPt1.x/newPt1.w, newPt1.y/newPt1.w);
            
            }
         
        }

        // Test:
        for (let i=0; i<this.scene.models.length; i++) {
            console.log(this.createVertexEdgeModel(this.scene.models[i]));
        }

        // TODO: implement drawing here!
        // For each model
        //   * For each vertex
        //     * transform endpoints to canonical view volume
        //   * For each line segment in each edge
        //     * clip in 3D
        //
        //     Mine
        //     * project to 2D
        //     * translate/scale to viewport (i.e. window)
        //     * draw line

        // Transform vertices, clip lines, scale, draw if not null
        // Possibly make one function to decompose each type of model into vertices/edges and then use that for this part since it aligns w/
        //      previous learnings

        /*
        for (let i=0; i<this.scene.models.length; i++) {
           for (let j=0; i<this.scene.models[i].)
        }
        */

    }

    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
        let outcode = 0;
        if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
            outcode += LEFT;
        }
        else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
            outcode += RIGHT;
        }
        if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
            outcode += BOTTOM;
        }
        else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
            outcode += TOP;
        }
        if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
            outcode += FAR;
        }
        else if (vertex.z > (z_min + FLOAT_EPSILON)) {
            outcode += NEAR;
        }
        return outcode;
    }

    // Clip line - should either return a new line (with two endpoints inside view volume)
    //             or null (if line is completely outside view volume)
    // line:         object {pt0: Vector4, pt1: Vector4}
    // z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {
        let result = null;
        let p0 = line.pt0;
        let p1 = line.pt1;
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);
        
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;
        let dz = p1.z - p0.z;
        if(out0 | out1 == 0){
            result = line;
        }
        else if(out0 && out1 != 0){
            result = null;
        }
        else{
            if (out0 == 0){
                t0 = 0;
            }
            else if(out0 == LEFT){
                t0 = (-p0.x + p0.z)/(dx - dz);
            }
            else if(out0 == RIGHT){
                t0 = (p0.x + p0.z)/(-dx - dz);
            }
            else if(out0 == BOTTOM){
                t0 = (-p0.y + p0.z)/(dy - dz);
            }
            else if(out0 == TOP){
                t0 = (p0.y + p0.z)/(-dy - dz);
            }
            else if (out0 == NEAR){
                t0 = (p0.z -z_min)/-dz;
            }
            else{
                t0 = (-p0.z - 1)/dz;
            }


            if (out1 == 0){
                t1 = 0;
            }
            else if(out1 == LEFT){
                t1 = (p1.x + p1.z)/(dx - dz);
            }
            else if(out1 == RIGHT){
                t1 = (p1.x + p1.z)/(-dx - dz);
            }
            else if(out1 == BOTTOM){
                t1 = (-p1.y + p1.z)/(dy - dz);
            }
            else if(out1 == TOP){
                t1 = (-p1.y + p1.z)/(dy - dz);
            }
            else if (out1 == NEAR){
                t1 = (p1.z -z_min)/-dz;
            }
            else{
                t1 = (-p1.z - 1)/dz;
            }
            
            newLine = {pt0: new Vector4(p0.x + t0*dx, p0.y + t0*dy, p0.z + t0*dz, 1),
                       pt1: new Vector4(p1.x + t1*dx, p1.y + t1*dy, p1.z + t1*dz, 1)};
            
            result = this.clipLinePerspective(newLine, z_min);

        } 
        // TODO: implement clipping here!
        
        return result;
    }

    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]),
                srp: Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]),
                vup: Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]),
                clip: [...scene.view.clip]
            },
            models: []
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type };
            if (model.type === 'generic') {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(Vector4(scene.models[i].vertices[j][0],
                                                scene.models[i].vertices[j][1],
                                                scene.models[i].vertices[j][2],
                                                1));
                    if (scene.models[i].hasOwnProperty('animation')) {
                        model.animation = JSON.parse(JSON.stringify(scene.models[i].animation));
                    }
                }
            }
            else {
                model.center = Vector4(scene.models[i].center[0],
                                       scene.models[i].center[1],
                                       scene.models[i].center[2],
                                       1);
                for (let key in scene.models[i]) {
                    if (scene.models[i].hasOwnProperty(key) && key !== 'type' && key != 'center') {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }

        return processed;
    }
    
    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }

    createVertexEdgeModel() {
        for (let i=0; i<this.scene.models.length; i++) {
            let original_model = this.scene.models[i];
            let new_model;

            if (original_model.type == "generic") {
                new_model = original_model;

            } else if (original_model.type == "cube") {
                new_model = {
                    type: "cube",
                    vertices: [],
                    edges: [],
                    matrix: new Matrix(4,4),
                    center: original_model.center,
                    animation: original_model.animation
                }

                let width = original_model.width / 2
                let height = original_model.height / 2
                let depth = original_model.depth / 2

                new_model.vertices.push(...[
                    Vector4(-width, height, -depth, 1),
                    Vector4(width, height, -depth, 1),
                    Vector4(width, -height, -depth, 1),
                    Vector4(-width, -height, -depth, 1),
                    Vector4(-width, height, depth, 1),
                    Vector4(width, height, depth, 1),
                    Vector4(width, -height, depth, 1),
                    Vector4(-width, -height, depth, 1),
                    
                ])

                let translate = new Matrix(4, 4)
                mat4x4Translate(translate, new_model.center.x, new_model.center.y, new_model.center.z)
                for (let i = 0; i < new_model.vertices.length; i++) {
                    new_model.vertices[i] = new Vector(Matrix.multiply([translate, new_model.vertices[i]]))
                }
                
                new_model.edges.push(...[
                    [0, 1, 2, 3, 0],
                    [4, 5, 6, 7, 4],
                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7]
                ])
                
                console.log(new_model.vertices);
                console.log(new_model.edges);

                //return new_model;
                
            } else if (original_model.type == "cone") {
                new_model = {
                    type: "cone",
                    vertices: [],
                    edges: [],
                    matrix: new Matrix(4, 4),
                    center: original_model.center
                }

                let radius = original_model.radius;
                let height = original_model.height;
                let sides = original_model.sides;

                let mult = Math.PI * 2
                for (let i = 0; i < sides; i += 1) {
                    let x = mult * (i / sides)
                    let new_vertex = new Vector4(Math.sin(x) * radius, -(height / 2), Math.cos(x) * radius, 1)
                    new_model.vertices.push(new_vertex)
                }
                
                new_model.vertices.push(new Vector4(0, (height / 2), 0, 1))
            
                let translate = new Matrix(4, 4)
                mat4x4Translate(translate, new_model.center.x, new_model.center.y, new_model.center.z) //translating to the center point
                for (let i = 0; i < new_model.vertices.length; i++) {
                    new_model.vertices[i] = new Vector(Matrix.multiply([translate, new_model.vertices[i]]))
                }
            
                new_model.edges.push([...Array(sides).keys(), 0])
            
                for (let i = 0; i < new_model.vertices.length - 1; i++) {
                    new_model.edges.push([i, new_model.vertices.length - 1])
                }

                //return new_model;

            } else if (original_model.type == "cylinder") {
                new_model = {
                    type: "cylinder",
                    vertices: [],
                    edges: [],
                    matrix: new Matrix(4, 4),
                    center: original_model.center
                }

                let radius = original_model.radius;
                let height = original_model.height;
                let sides = original_model.sides;
                
                // Bottom vertices
                let mult = Math.PI * 2
                for (let i = 0; i < sides; i += 1) {
                    let x = mult * (i / sides)
                    let new_vertex = new Vector4(Math.sin(x) * radius, -(height / 2), Math.cos(x) * radius, 1)
                    new_model.vertices.push(new_vertex)
                }
                // Top vertices
                for (let i = 0; i < sides; i += 1) {
                    let x = mult * (i / sides)
                    let new_vertex = new Vector4(Math.sin(x) * radius, (height / 2), Math.cos(x) * radius,1)
                    new_model.vertices.push(new_vertex)
                }

                let translate = new Matrix(4, 4)
                mat4x4Translate(translate, new_model.center.x, new_model.center.y, new_model.center.z)
                for (let i = 0; i < new_model.vertices.length; i++) {
                    new_model.vertices[i] = new Vector(Matrix.multiply([translate, new_model.vertices[i]]))
                }

                let c_bottom = []
                let c_top = []
                for (let i = 0; i < sides; i++) {
                    c_bottom.push(i)
                    c_top.push(sides + i)
                    new_model.edges.push([i, sides + i])
                }

                c_bottom.push(0)

                c_top.push(sides)
                new_model.edges.push(c_bottom)
                new_model.edges.push(c_top)

                //return new_model;
            }
            this.scene.models[i] = new_model;
        }
        
    }

};
