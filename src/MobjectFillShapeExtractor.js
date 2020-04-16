/* eslint-disable */
import * as THREE from "three";

/* This class offers an external implementation of THREE.Shape.extractPoints
 * which return the maximum number of vertices that could have been used to
 * render the Shape.
 */
class MobjectFillShapeExtractor {
  static extractPoints(shape, divisions) {
    let [
      shapePoints,
      maxShapeVertices,
    ] = MobjectFillShapeExtractor.getPoints(shape, divisions);
    let [
      holePointsArray,
      maxHoleVerticesArray,
    ] = MobjectFillShapeExtractor.getPointsHoles(shape, divisions);
    return {
      shape: shapePoints,
      holes: holePointsArray,
      maxVertices: maxShapeVertices + maxHoleVerticesArray.reduce(
        (total, i) => total + i, 0
      ),
    };
  };

  static getPoints(shape, divisions) {
    divisions = divisions || 12;

    let maxPoints = 0;
    var points = [], last;
    for (var i = 0, curves = shape.curves; i < curves.length; i ++) {
      var curve = curves[i];
      var resolution = (curve && curve.isEllipseCurve) ? divisions * 2
        : (curve && (curve.isLineCurve || curve.isLineCurve3)) ? 1
          : (curve && curve.isSplineCurve) ? divisions * curve.points.length
            : divisions;
      var pts = curve.getPoints(resolution);
      for (var j = 0; j < pts.length; j ++) {
        var point = pts[j];
        maxPoints++;
        if (last && last.equals(point)) continue; // ensures no consecutive points are duplicates
        points.push(point);
        last = point;
      }
    }

    maxPoints++;
    if (shape.autoClose && points.length > 1 && ! points[points.length - 1].equals(points[0])) {
      points.push(points[0]);
    }
    return [points, maxPoints];
  };

  static getPointsHoles(shape, divisions) {
    var holesPts = [];
    var holesMaxLengths = [];
    for (var i = 0, l = shape.holes.length; i < l; i++) {
      let [holePts, holeMaxLength] = MobjectFillShapeExtractor.getPoints(
        shape.holes[i],
        divisions,
      );
      holesPts[i] = holePts;
      holesMaxLengths[i] = holeMaxLength;
    }
    return [holesPts, holesMaxLengths];
  };
}

export { MobjectFillShapeExtractor };
