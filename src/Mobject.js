import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as utils from "./utils.js";
// import { MobjectFillBufferGeometry } from "./MobjectFillBufferGeometry.js";

const DEFAULT_STYLE = {
  strokeColor: 0xffffff,
  strokeOpacity: 1,
  fillColor: 0x000000,
  fillOpacity: 1,
  strokeWidth: 4,
};

const STROKE_SHRINK_FACTOR = 700;

// TODO: Make MobjectFillBufferGeometry a ShapeBufferGeometry.
class Mobject extends THREE.Group {
  constructor(id, points, style) {
    super();
    this.mobjectId = id;
    this.style = Object.assign(DEFAULT_STYLE, style);
    this.shapes = this.computeShapes(points);
    this.fillMesh = new THREE.Mesh(
      this.computeFillGeometry(),
      this.computeFillMaterial(),
    );
    this.strokeMesh = new THREE.Mesh(
      this.computeStrokeGeometry(),
      this.computeStrokeMaterial(),
    );
    this.add(this.fillMesh);
    this.add(this.strokeMesh);
  }

  update(points, style) {
    this.style = Object.assign(this.style, style);
    this.shapes = this.computeShapes(points);

    this.fillMesh.geometry.dispose();
    this.fillMesh.geometry = this.computeFillGeometry();
    this.updateFillMaterial();

    this.strokeMesh.geometry.dispose();
    this.strokeMesh.geometry = this.computeStrokeGeometry();
    this.updateStrokeMaterial();
  }

  dispose() {
    this.fillMesh.geometry.dispose();
    this.fillMesh.material.dispose();
    this.strokeMesh.geometry.dispose();
    this.strokeMesh.material.dispose();
  }

  computeShapes(points) {
    let shapePath = new THREE.ShapePath();
    let move = true;
    for (let i = 0; i < points.length / 4; i++) {
      let curveStartIndex = 4 * i;
      if (move) {
        shapePath.moveTo(
          points[curveStartIndex][0],
          points[curveStartIndex][1],
        );
      }
      shapePath.bezierCurveTo(
        points[curveStartIndex + 1][0],
        points[curveStartIndex + 1][1],
        points[curveStartIndex + 2][0],
        points[curveStartIndex + 2][1],
        points[curveStartIndex + 3][0],
        points[curveStartIndex + 3][1],
      );
      if (curveStartIndex + 4 < points.length) {
        move = false;
        let lastPoint = points[curveStartIndex + 3];
        let nextPoint = points[curveStartIndex + 4];
        for (let j = 0; j < 3; j++) {
          if (Math.abs(lastPoint[j] - nextPoint[j]) > 1e-6) {
            move = true;
            break;
          }
        }
      }
    }
    return shapePath.toShapes();
  }

  createMeshLineGeometries(shape) {
    let extractedPoints = shape.extractPoints();
    let meshLineGeometries = [];
    for (let vecList of [extractedPoints.shape, ...extractedPoints.holes]) {
      let geometry = new THREE.Geometry();
      for (let i = 0; i < vecList.length; i++) {
        let point = vecList[i];
        geometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
      }
      let meshLine = new MeshLine();
      meshLine.setGeometry(geometry);
      meshLineGeometries.push(meshLine.geometry);
    }
    let fullGeometry = BufferGeometryUtils.mergeBufferGeometries(meshLineGeometries);
    return fullGeometry;
  }

  computeStrokeGeometry() {
    let geometries = [];
    for (let shape of this.shapes) {
      geometries.push(this.createMeshLineGeometries(shape));
    }
    return BufferGeometryUtils.mergeBufferGeometries(geometries);
  }

  computeStrokeMaterial() {
    let { strokeOpacity, strokeColor, strokeWidth } = this.style;
    return new MeshLineMaterial({
      color: new THREE.Color(strokeColor),
      opacity: strokeOpacity,
      transparent: true,
      lineWidth: strokeWidth / STROKE_SHRINK_FACTOR,
    });
  }

  updateStrokeMaterial() {
    let { strokeColor, strokeOpacity, strokeWidth } = this.style;
    this.strokeMesh.material.color.set(utils.manimColorToHex(strokeColor));
    this.strokeMesh.material.opacity = strokeOpacity;
    this.strokeMesh.material.lineWidth = strokeWidth / STROKE_SHRINK_FACTOR;
  }

  computeFillGeometry() {
    return new THREE.ShapeBufferGeometry(this.shapes, 11);
  }

  computeFillMaterial() {
    let { fillOpacity, fillColor } = this.style;
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(fillColor),
      opacity: fillOpacity,
      transparent: true,
    });
  }

  updateFillMaterial() {
    let { fillColor, fillOpacity } = this.style;
    this.fillMesh.material.color.set(utils.manimColorToHex(fillColor));
    this.fillMesh.material.opacity = fillOpacity;
  }
}

export { Mobject };
