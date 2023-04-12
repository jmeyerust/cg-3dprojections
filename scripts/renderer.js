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
        this.enable_animation = true;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
        this.rot_mat = new Matrix(4, 4);
        this.delta = 0;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
        // Takes in time, should transform vertices of any models that need to rotate here, then gets redrawn
        
        for (let i = 0; i < this.scene.models.length; i++) {
            let model = this.scene.models[i];
            if (model.hasOwnProperty("animation")) {
                this.delta = this.delta + ((model.animation.rps*360) * delta_time / 1000 % 360);
                if (model.animation.axis == "x") {
                    mat4x4RotateX(model.matrix, this.delta);
                } else if (model.animation.axis == "y") {
                     mat4x4RotateY(model.matrix, this.delta);
                } else {
                    mat4x4RotateZ(model.matrix, this.delta);
                }
                let transAnim = new Matrix(4,4);
                mat4x4Translate(transAnim, -model.center.x, -model.center.y, -model.center.z)
                model.matrix = Matrix.multiply([model.matrix, transAnim]);

                mat4x4Translate(transAnim, model.center.x, model.center.y, model.center.z)
                model.matrix = Matrix.multiply([transAnim, model.matrix]);


            }
        }
    }

    //
    rotateLeft() {
        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;
        let n = prp.subtract(srp);
        nmag = n.magnitude();
        n.values = [n.x/nmag, n.y/nmag, n.z/nmag];
        let u = vup.cross(n);
        umag = u.magnitude();
        u.values = [u.x/umag, u.y/umag, u.z/umag];

        srp = srp.subtract(u);
        // let dotSrp = srp.dot(prp);
        // let Srpmag = srp.magnitude();
        // srp.values = [dotSrp*srp.x/Srpmag**2, dotSrp*srp.y/Srpmag**2, dotSrp*srp.z/Srpmag**2];

        this.scene.view.srp = srp;

        this.draw()
    }
    
    //
    rotateRight() {
        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;

        let n = prp.subtract(srp);
        nmag = n.magnitude();
        n.values = [n.x/nmag, n.y/nmag, n.z/nmag];

        let u = vup.cross(n);
        umag = u.magnitude();
        u.values = [u.x/umag, u.y/umag, u.z/umag];

        srp = srp.add(u);
        this.scene.view.srp = srp;
        this.draw()
    }
    
    //
    moveLeft() {

        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;
        let n = prp.subtract(srp);
        nmag = n.magnitude();
        n.values = [n.x/nmag, n.y/nmag, n.z/nmag];
        let u = vup.cross(n);
        umag = u.magnitude();
        u.values = [u.x/umag, u.y/umag, u.z/umag];


        prp = prp.subtract(u);

        srp = srp.subtract(u);
        // let dotSrp = srp.dot(prp);
        // let Srpmag = srp.magnitude();
        // srp.values = [dotSrp*srp.x/Srpmag**2, dotSrp*srp.y/Srpmag**2, dotSrp*srp.z/Srpmag**2];

        this.scene.view.prp = prp;
        this.scene.view.srp = srp;

        this.draw()

    }
    
    //
    moveRight() {

        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;

        let n = prp.subtract(srp);
        nmag = n.magnitude();
        n.values = [n.x/nmag, n.y/nmag, n.z/nmag];

        let u = vup.cross(n);
        umag = u.magnitude();
        u.values = [u.x/umag, u.y/umag, u.z/umag];

        prp = prp.add(u);
        srp = srp.add(u);

        this.scene.view.prp = prp;
        this.scene.view.srp = srp;
        this.draw()

    }
    
    //
    moveBackward() {

        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;

        let n = prp.subtract(srp);
        nmag = n.magnitude();
        n.values = [n.x/nmag, n.y/nmag, n.z/nmag];

        let u = vup.cross(n);
        umag = u.magnitude();
        u.values = [u.x/umag, u.y/umag, u.z/umag];
        prp = prp.add(n);
        srp = srp.add(n);

        this.scene.view.prp = prp;
        this.scene.view.srp = srp;
        this.draw()

    }
    
    //
    moveForward() {

        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;

        let n = prp.subtract(srp);
        nmag = n.magnitude();
        n.values = [n.x/nmag, n.y/nmag, n.z/nmag];

        let u = vup.cross(n);
        umag = u.magnitude();
        u.values = [u.x/umag, u.y/umag, u.z/umag];
        prp = prp.subtract(n);
        srp = srp.subtract(n);

        this.scene.view.prp = prp;
        this.scene.view.srp = srp;
        this.draw()

    }

    //
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        console.log('draw()');  


        let prp = this.scene.view.prp;
        let srp = this.scene.view.srp;
        let vup = this.scene.view.vup;
        let clip = this.scene.view.clip;
        let z_min = -clip[4]/clip[5];

        /*
        // Added by Jackson - trying to work on rotate
        for (let model in this.scene.models) {
            if (model.hasOwnProperty("animation")) {
                let move_to_center = new Matrix(4, 4);
                mat4x4Translate(move_to_center, -model.center.x, -model.center.y, -model.center.z);
                let final_mat = new Matrix(4, 4);
                mat4x4Translate(final_mat, model.center.x, model.center.y, model.center.z);

                final_mat.mult(this.rot_mat);
                final_mat.mult(move_to_center);

                for (let v in model.vertices) {
                    v = final_mat.mult(v);
                }
            }
        }
        */

        let canon_transform = mat4x4Perspective(prp, srp, vup, clip);


        let model_arr = this.scene.models;
        let newLines = [];
        for(let i = 0; i < model_arr.length; i++){
            let vertex_arr = [];
            let edges_arr = model_arr[i].edges;
            for(let j = 0; j < model_arr[i].vertices.length; j++){
                vertex_arr.push(Matrix.multiply([model_arr[i].matrix, model_arr[i].vertices[j]])); 
            }

            // Changing the Vertices to Canon view
            for(let j = 0; j < model_arr[i].vertices.length; j++){
                // vertex_arr.push(Matrix.multiply([canon_transform, model_arr[i].vertices[j]]));
                vertex_arr[j] = Matrix.multiply([canon_transform, vertex_arr[j]]); 

            }

            // Applying Clipping    
            for(let k = 0; k < edges_arr.length; k++){
                for (let l = 0; l < edges_arr[k].length -1; l++){
                    let line = {pt0: vertex_arr[edges_arr[k][l]], 
                                pt1: vertex_arr[edges_arr[k][l+1]]};
                    let newLine = this.clipLinePerspective(line, z_min);
                    if (newLine != null){
                        newLines.push(newLine);
                    }
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
            let t0 = null;
            let t1 = null;


            if(out0 >= LEFT){
                t0 = (-p0.x + p0.z)/(dx - dz);
            }
            else if(out0 >= RIGHT){
                t0 = (p0.x + p0.z)/(-dx - dz);
            }
            else if(out0 >= BOTTOM){
                t0 = (-p0.y + p0.z)/(dy - dz);
            }
            else if(out0 >= TOP){
                t0 = (p0.y + p0.z)/(-dy - dz);
            }
            else if (out0 >= NEAR){
                t0 = (p0.z -z_min)/-dz;
            }
            else if (out0 >= FAR){
                t0 = (-p0.z - 1)/dz;
            }
            
            if(out1 >= LEFT){
                t1 = (-p1.x + p1.z)/(dx - dz);
            }
            else if(out1 >= RIGHT){
                t1 = (p1.x + p1.z)/(-dx - dz);
            }
            else if(out1 >= BOTTOM){
                t1 = (-p1.y + p1.z)/(dy - dz);
            }
            else if(out1 >= TOP){
                t1 = (p1.y + p1.z)/(-dy - dz);
            }
            else if (out1 >= NEAR){
                t1 = (p1.z -z_min)/(-dz) ;
            }
            else if (out0 >= FAR){
                t1 = (-p1.z - 1)/dz;
            }
            
            let newLine = {pt0: new Vector4(p0.x + t0*dx, p0.y + t0*dy, p0.z + t0*dz, 1),
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
        this.createVertexEdgeModel();
        if (!this.enable_animation) {
            // this.createVertexEdgeModel();
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
                }

                if (original_model.hasOwnProperty('animation')) {
                    new_model.animation = {axis: original_model.animation.axis,
                                           rps:  original_model.animation.rps};
                };


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
                
                
            } else if (original_model.type == "cone") {
                new_model = {
                    type: "cone",
                    vertices: [],
                    edges: [],
                    matrix: new Matrix(4, 4),
                    center: original_model.center
                }
                if (original_model.hasOwnProperty('animation')) {
                    new_model.animation = {axis: original_model.animation.axis,
                                           rps:  original_model.animation.rps}
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
                if (original_model.hasOwnProperty('animation')) {
                    new_model.animation = {axis: original_model.animation.axis,
                                           rps: original_model.animation.rps}
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
            else if (original_model.type == "sphere") {
                new_model = {
                    type: "sphere",
                    vertices: [],
                    edges: [],
                    matrix: new Matrix(4, 4),
                    center: original_model.center
                }
                if (original_model.hasOwnProperty('animation')) {
                    new_model.animation = {axis: original_model.animation.axis,
                                           rps: original_model.animation.rps}
                }

                let radius = original_model.radius;
                let slices = original_model.slices;
                let stacks = original_model.stacks;
                
                for (let i =0; i < slices; i++){
                    for(let j =0; j < stacks; j++){
                        let x = Math.cos(2*Math.PI*j/stacks) * Math.sin(2*Math.PI*i/slices);
                        let y = Math.sin(2*Math.PI*j/stacks) *  Math.sin(2*Math.PI*i/slices);
                        let z = Math.cos(2*Math.PI*i/slices);
                        let new_vertex = new Vector4(x, y, z, 1);
                        new_model.vertices.push(new_vertex);

                    
                    }
                    let new_edge =[];
                        for(let k=0; k < stacks; k++){
                            new_edge.push(k + i*slices)
                        }
                    new_edge.push(i*slices);
                    new_model.edges.push(new_edge);

                    new_edge =[];
                    for(let k=0; k < stacks; k++){
                            new_edge.push(i + k*stacks)
                    }
                    new_edge.push(i);
                    new_model.edges.push(new_edge);
                }
                let sphere_scale = new Matrix(4,4);
                mat4x4Scale(sphere_scale, radius, radius, radius);
                let sphere_trans = new Matrix(4,4);
                mat4x4Translate(sphere_trans,original_model.center.x, original_model.center.y, original_model.center.z );

                sphere_trans = Matrix.multiply([sphere_trans, sphere_scale]);

                for (let i =0; i < new_model.vertices.length; i++){
                    new_model.vertices[i] = Matrix.multiply([sphere_trans, new_model.vertices[i]]);
                }

            }
            this.scene.models[i] = new_model;
        }
        
    }

};
