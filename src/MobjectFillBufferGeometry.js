/* eslint-disable */
import * as THREE from "three";
function MobjectFillBufferGeometry(shapes, curveSegments) {
  THREE.BufferGeometry.call(this);
  this.type = 'MobjectFillBufferGeometry';
  this.parameters = {
    shapes: shapes,
    curveSegments: curveSegments
  };
  // If this is ever changed from 11 it must also be changed in
  // addShapeVertices().
  curveSegments = curveSegments || 11;

  // buffers
  var indices = [];
  var vertices = [];
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

  // build geometry
  this.setIndex(indices);
  this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  // helper functions
  function addShape(shape) {
    var i, l, shapeHole;
    var indexOffset = vertices.length / 3;
    var points = shape.extractPoints(curveSegments);
    var shapeVertices = points.shape;
    var shapeHoles = points.holes;

    // check direction of vertices
    if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
      shapeVertices = shapeVertices.reverse();
    }

    for (i = 0, l = shapeHoles.length; i < l; i++) {
      shapeHole = shapeHoles[i];
      if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
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

MobjectFillBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
MobjectFillBufferGeometry.prototype.constructor = MobjectFillBufferGeometry;

MobjectFillBufferGeometry.prototype.update = function (shapes) {
  let curveSegments = this.curveSegments || 11;
  let vertices = [];

  if (Array.isArray(shapes) === false) {
    addShapeVertices(shapes, vertices);
  } else {
    for (var i = 0; i < shapes.length; i++) {
      addShapeVertices(shapes[i], vertices);
    }
  }

  this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  // this.attributes.position.needsUpdate = true;

  function addShapeVertices(shape, vertices) {
    var i, l, shapeHole;
    var points = shape.extractPoints(curveSegments);
    var shapeVertices = points.shape;
    var shapeHoles = points.holes;

    // check direction of vertices
    if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
      shapeVertices = shapeVertices.reverse();
    }

    for (i = 0, l = shapeHoles.length; i < l; i++) {
      shapeHole = shapeHoles[i];
      if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
        shapeHoles[i] = shapeHole.reverse();
      }
    }

    // join vertices of inner and outer paths to a single array
    for (i = 0, l = shapeHoles.length; i < l; i++) {
      shapeHole = shapeHoles[i];
      shapeVertices = shapeVertices.concat(shapeHole);
    }

    // vertices, normals, uvs
    for (i = 0, l = shapeVertices.length; i < l; i++) {
      var vertex = shapeVertices[i];
      vertices.push(vertex.x, vertex.y, 0);
    }
  }
}


MobjectFillBufferGeometry.prototype.toJSON = function () {
  var data = THREE.BufferGeometry.prototype.toJSON.call(this);
  var shapes = this.parameters.shapes;
  return toJSON(shapes, data);
};

function toJSON(shapes, data) {
  data.shapes = [];
  if (Array.isArray(shapes)) {
    for (var i = 0, l = shapes.length; i < l; i++) {
      var shape = shapes[i];
      data.shapes.push(shape.uuid);
    }
  } else {
    data.shapes.push(shapes.uuid);
  }
  return data;
}

export { MobjectFillBufferGeometry };
