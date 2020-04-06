import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";

const DEFAULT_STYLE = {
  strokeColor: 0xffffff,
  strokeOpacity: 1,
  fillColor: 0x000000,
  fillOpacity: 1,
  strokeWidth: 4,
};

const STROKE_SHRINK_FACTOR = 70;

class Mobject {
  constructor(points, style) {
    this.style = Object.assign(DEFAULT_STYLE, style);
    this.shape = this.computeShape(points);
    this.fillMesh = this.computeFillMesh();
    this.strokeMesh = this.computeStrokeMesh();
    this.mesh = new THREE.Group();
    this.mesh.add(this.fillMesh);
    this.mesh.add(this.strokeMesh);
  }

  dispose() {
    this.fillMesh.geometry.dispose();
    this.fillMesh.material.dispose();
    this.strokeMesh.geometry.dispose();
    this.strokeMesh.material.dispose();
  }

  computeShape(points) {
    let shape = new THREE.Shape().moveTo(points[0][0], points[0][1]);
    for (let i = 0; i < points.length / 4; i++) {
      shape.bezierCurveTo(
        points[4 * i + 1][0],
        points[4 * i + 1][1],
        points[4 * i + 2][0],
        points[4 * i + 2][1],
        points[4 * i + 3][0],
        points[4 * i + 3][1],
      );
    }
    return shape;
  }

  createStrokeGeometry(shape) {
    let geometry = new THREE.Geometry();
    let divisions = Math.round(12 * shape.getPoints().length);
    for (let i = 0, l = divisions; i < l; i ++) {
      let t = i / l;
      let point = shape.getPointAt(t);
      geometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
    }
    return geometry;
  }

  computeStrokeMesh() {
    let opacity = this.style.strokeOpacity;
    let meshLine = new MeshLine();
    meshLine.setGeometry(this.createStrokeGeometry(this.shape));
    let geometry = meshLine.geometry;
    let materialConfig = {
      color: new THREE.Color(this.style.strokeColor),
      lineWidth: this.style.strokeWidth / STROKE_SHRINK_FACTOR,
    };
    if (opacity !== 1) {
      materialConfig["opacity"] = opacity;
      materialConfig["transparent"] = true;
    }
    let material = new MeshLineMaterial(materialConfig);
    return new THREE.Mesh(geometry, material);
  }

  computeFillMesh() {
    let opacity = this.style.fillOpacity;
    let geometry = new THREE.ShapeBufferGeometry(this.shape);
    let materialConfig = { color: new THREE.Color(this.style.fillColor) };
    if (opacity !== 1) {
      materialConfig["opacity"] = opacity;
      materialConfig["transparent"] = true;
    }
    let material = new THREE.MeshBasicMaterial(materialConfig);
    return new THREE.Mesh(geometry, material);
  }
}

export { Mobject };
