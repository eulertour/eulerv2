/* eslint-disable */
import * as THREE from "three";

const INITIAL_ALLOCATED_VERTICES = 5000;

class MobjectFillBufferGeometry extends THREE.BufferGeometry {
  constructor(shapes, curveSegments) {
    super();
    this.parameters = {
      shapes: shapes,
      curveSegments: curveSegments
    };
    curveSegments = this.parameters.curveSegments;

    // buffers
    var indices = [];
    var vertices = [];
    // TODO: Remove uvs and normals.
    var normals = [];
    var uvs = [];

    // helper variables
    var groupStart = 0;
    var groupCount = 0;

    // allow single and array values for "shapes" parameter
    if (Array.isArray(shapes) === false) {
      addShape(shapes);
    } else {
      for (var i = 0; i < shapes.length; i++) {
        addShape(shapes[i]);
        this.addGroup(groupStart, groupCount, i); // enables MultiMaterial support
        groupStart += groupCount;
        groupCount = 0;
      }
    }

    // Pad arrays in case of growth.
    this.setDrawRange(0, vertices.length);
    let vertexCount = vertices.length / 3;
    if (vertexCount < INITIAL_ALLOCATED_VERTICES) {
      let numPaddingVertices = INITIAL_ALLOCATED_VERTICES - vertexCount;
      vertices.push(...Array(3 * numPaddingVertices).fill(0));
      normals.push(...Array(3 * numPaddingVertices).fill(0));
      uvs.push(...Array(2 * numPaddingVertices).fill(0));
    }

    // build geometry
    this.setIndex(indices);
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    // helper functions
    // TODO: Merge this and addShapeVertices().
    function addShape(shape) {
      var i, l, shapeHole;
      var indexOffset = vertices.length / 3;
      var points = shape.extractPoints(curveSegments);

      var shapeVertices = points.shape;
      var shapeHoles = points.holes;

      // check direction of vertices
      if (!THREE.ShapeUtils.isClockWise(shapeVertices)) {
        shapeVertices = shapeVertices.reverse();
      }

      for (i = 0, l = shapeHoles.length; i < l; i++) {
        shapeHole = shapeHoles[i];
        if (THREE.ShapeUtils.isClockWise(shapeHole)) {
          shapeHoles[i] = shapeHole.reverse();
        }
      }
      var faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);

      // join vertices of inner and outer paths to a single array
      for (i = 0, l = shapeHoles.length; i < l; i++) {
        shapeHole = shapeHoles[i];
        shapeVertices = shapeVertices.concat(shapeHole);
      }

      // vertices, normals, uvs
      for (i = 0, l = shapeVertices.length; i < l; i++) {
        var vertex = shapeVertices[i];
        vertices.push(vertex.x, vertex.y, 0);
        normals.push(0, 0, 1);
        uvs.push(vertex.x, vertex.y); // world uvs
      }

      // incides
      for (i = 0, l = faces.length; i < l; i++) {
        var face = faces[i];
        var a = face[0] + indexOffset;
        var b = face[1] + indexOffset;
        var c = face[2] + indexOffset;
        indices.push(a, b, c);
        groupCount += 3;
      }
    }
  }

  update(shapes) {
    let vertices = [];
    let indices = [];
    let normals = [];
    if (Array.isArray(shapes) == false) {
      this.addShapeVertices(shapes, vertices, indices, normals);
    } else {
      for (let i = 0; i < shapes.length; i++) {
        this.addShapeVertices(shapes[i], vertices, indices, normals);
      }
    }

    // TODO: Resize the buffer if necessary.
    if (this.attributes.position.array.length < vertices.length) {
      console.error("Need to implement buffer resizing.");
    }
    for (let i = 0; i < vertices.length; i++) {
      this.attributes.position.array[i] = vertices[i];
      this.attributes.normal.array[i] = normals[i];
    }
    this.setIndex(indices);
    this.setDrawRange(0, vertices.length);
    this.computeBoundingSphere();
    this.attributes.position.needsUpdate = true;
    return this;
  }

  // TODO: Merge this and addShape().
  addShapeVertices(shape, vertices, indices, normals) {
    var indexOffset = vertices.length / 3;
    let i, l, shapeHole, curveSegments;
    if (this.parameters.curveSegments === undefined) {
      console.warn(
        "If you don't specify curveSegments explicitly, you'll have to keep " +
        "the default synchronized with upstream."
      );
      curveSegments = 12;
    } else {
      curveSegments = this.parameters.curveSegments;
    }

    let points = shape.extractPoints(curveSegments);
    let shapeVertices = points.shape;
    let shapeHoles = points.holes;

    // Ensure correct ordering of vertices.
    if (!THREE.ShapeUtils.isClockWise(shapeVertices)) {
      shapeVertices = shapeVertices.reverse();
    }
    for (i = 0, l = shapeHoles.length; i < l; i++) {
      shapeHole = shapeHoles[i];
      if (THREE.ShapeUtils.isClockWise(shapeHole)) {
        shapeHoles[i] = shapeHole.reverse();
      }
    }
    var faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);

    // Join vertices of inner and outer paths to a single array.
    for (i = 0, l = shapeHoles.length; i < l; i++) {
      shapeHole = shapeHoles[i];
      shapeVertices = shapeVertices.concat(shapeHole);
    }

    // Append to vertices.
    for (i = 0, l = shapeVertices.length; i < l; i++) {
      var vertex = shapeVertices[i];
      vertices.push(vertex.x, vertex.y, 0);
      normals.push(0, 0, 1);
    }

    // incides
    for (i = 0, l = faces.length; i < l; i++) {
      var face = faces[i];
      var a = face[0] + indexOffset;
      var b = face[1] + indexOffset;
      var c = face[2] + indexOffset;
      indices.push(a, b, c);
    }
  }
}

export { MobjectFillBufferGeometry };
