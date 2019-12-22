import * as Two from 'two.js/build/two.js'
import * as consts from './constants.js'
import * as utils from './utils.js'
import chroma from 'chroma-js'
import {
  Animation,
  Wait,
  ReplacementTransform,
  ShowCreation,
  Write,
  FadeOut,
  FadeIn,
} from './animation.js';
import {Scene} from './scene.js';
import * as _ from 'lodash'
import * as math from 'mathjs'

const DEFAULT_STYLE = {
  strokeColor: consts.WHITE,
  strokeOpacity: 1,
  fillColor: consts.BLACK,
  fillOpacity: 0,
  strokeWidth: 4,
};

/* TODO: error check python access */
class Group extends Two.Group {
  constructor(submobjects = [], fillTopLevel = false) {
    super();
    // this.children[0] represents this the current-level mobject, and should
    // be a Two.Path (not a Mobject). This.children.slice(1) represents
    // the submobjects and should be Mobjects
    this.add(fillTopLevel ? submobjects[0] : new Two.Path());
    for (let submobject of submobjects.slice(fillTopLevel ? 1 : 0)) {
      this.add(submobject);
    }
  }

  scaleMobject(factor) {
    utils.scalePath(factor, this.children[0]);
    for (let submob of this.submobjects()) {
      submob.scaleMobject(factor);
    }
    return this;
  }

  translateMobject(vector) {
    utils.translatePath(vector, this.children[0]);
    for (let submob of this.submobjects()) {
      submob.translateMobject(vector);
    }
    return this;
  }

  moveTo(newCenter) {
    let oldCenter = this.getPointCenter();

    this.translateMobject([
      newCenter[0] - oldCenter[0],
      newCenter[1] - oldCenter[1],
    ]);
  }

  alignData(other) {
    this.nullPointAlign(other);
    this.alignSubmobjects(other);
    this.alignPoints(other);
    // eslint-disable-next-line
    console.assert(this.submobjects().length === other.submobjects().length);
    this.submobjects().forEach(
      (mob, i) => mob.alignData(other.submobjects()[i])
    );
  }

  pushSelfIntoSubmobjects() {
    let clonedMobject = new Mobject(this.path().clone());
    clonedMobject.applyStyle(this.getStyleDict());
    let center = this.getPointCenter();
    this.children[0] = utils.pathFromAnchors([center], [center], [center]);
    this.add(clonedMobject);
  }

  nullPointAlign(other) {
    if (this.points().length === 0 && other.points().length !== 0) {
      other.pushSelfIntoSubmobjects();
    } else if (other.points().length === 0 && this.points().length !== 0) {
      this.pushSelfIntoSubmobjects();
    }
  }

  alignSubmobjects(other) {
    if (this.submobjects().length === other.submobjects().length) {
      return;
    }

    let fewer, more;
    if (this.submobjects().length < other.submobjects().length) {
      fewer = this;
      more = other;
    } else {
      fewer = other;
      more = this;
    }
    fewer.addSubmobjects(
      more.submobjects().length - fewer.submobjects().length
    );
  }

  addSubmobjects(n) {
    let np = window.pyodide.pyimport("numpy");
    let currentNumSubmobjects = this.submobjects().length;
    if (currentNumSubmobjects === 0) {
      // TODO: this is probably buggy
      // If empty, simply add n point mobjects
      for (let i = 0; i < n; i++) {
        this.add(this.getPointMobject());
      }
      return;
    }
    let target = currentNumSubmobjects + n;
    let repeatIndices = np.arange(target).map(
      x => Math.floor(x * currentNumSubmobjects / target)
    );
    let splitFactors = [];
    for (let i = 0; i < currentNumSubmobjects; i++) {
      splitFactors.push(repeatIndices.filter(x => x === i).length);
    }
    let newSubmobjects = [];
    for (let i = 0; i < this.submobjects().length; i++) {
      let sf = splitFactors[i];
      let submob = this.submobjects()[i].clone();
      newSubmobjects.push(submob);
      for (let j = 0; j < sf - 1; j++) {
        let submob = this.submobjects()[i].clone();
        let oldStyle = this.submobjects()[i].getStyleDict();
        submob.applyStyle({
          strokeColor: chroma(oldStyle.strokeColor).alpha(0).hex(),
          fillColor: chroma(oldStyle.fillColor).alpha(0).hex(),
        });
        newSubmobjects.push(submob);
      }
    }
    this.remove(this.submobjects());
    // eslint-disable-next-line
    console.assert(
      this.submobjects().length === 0,
      "A submobject was not removed properly.",
      this.submobjects().length,
    );
    this.add(newSubmobjects);
  }

  alignPoints(other) {
    if (this.points().length === other.points().length) {
      return;
    }

    for (let mob of [this, other]) {
      // If there are no points, add one to
      // wherever the "center" is
      if (mob.points().length === 0) {
        let center = this.getPixelCenter();
        mob.points().push(new Two.Anchor(
          center[0], center[1],
          center[0], center[1],
          center[0], center[1],
          'C',
        ));
      }
    }

    let fewer, more;
    if (this.points().length < other.points().length) {
      fewer = this;
      more = other;
    } else {
      fewer = other;
      more = this;
    }
    let newPoints = fewer.addPoints(
      more.points().length - fewer.points().length
    );

    fewer.setAnchorsFromPoints(newPoints);
  }

  /* Takes a style of the form
   * {
   *   strokeColor: '#fff',
   *   strokeOpacity: 1,
   *   strokeWidth: 4,
   *   fillColor: '#000',
   *   fillOpacity: 0,
   * }
   * and applies it to the Mobject.
   */
  applyStyle(style) {
    if (this.__proto__ === Group.prototype) {
      this.submobjects().forEach(submob => submob.applyStyle(style));
      return;
    }
    let combinedStyle = Object.assign(this.getStyleDict(), style);
    let strokeChroma = chroma(combinedStyle.strokeColor).alpha(combinedStyle.strokeOpacity);
    let fillChroma = chroma(combinedStyle.fillColor).alpha(combinedStyle.fillOpacity);
    this.stroke = strokeChroma.hex();
    this.fill = fillChroma.hex();
    this.linewidth = combinedStyle.strokeWidth / 100;
    return this;
  }

  transformWithMatrix(matrix) {
    const matrixDimensions = math.size(matrix).toArray();
    // eslint-disable-next-line
    console.assert(
      _.isEqual(matrixDimensions, [3,3]),
      "Invalid dimensions for matrix transformation",
      matrixDimensions,
    );
    for (let anchor of this.children[0].vertices) {
      for (let vector of [anchor, anchor.controls.left, anchor.controls.right]) {
        const mappedVector = (matrixDimensions[1] === 2)
          ? math.multiply(matrix, [vector.x, vector.y]).toArray()
          : math.multiply(matrix, [vector.x, vector.y].concat(1)).toArray();
        vector.x = mappedVector[0];
        vector.y = mappedVector[1];
      }
    }
  }

  applyTransformations(transformations) {
    for (let i = 0; i < transformations.length; i++) {
      let command = transformations[i][0];
      let args = transformations[i].slice(1);
      if (command === 'flip') {
        let reflectionMatrix = utils.reflectionMatrixAcrossVector(args[0]);
        this.transformWithMatrix(reflectionMatrix);
      } else if (command === 'rotate') {
        let rotationMatrix = utils.rotationMatrixByAngle(args[0]);
        this.transformWithMatrix(rotationMatrix);
      } else {
        // eslint-disable-next-line
        console.error(`Unknown transformation ${command} with args ${args}`);
      }
    }
  }

  getStyleDict() {
    let strokeChroma = chroma(this.stroke);
    let fillChroma = chroma(this.fill);
    return {
      strokeColor: strokeChroma.hex(),
      strokeOpacity: strokeChroma.alpha(),
      fillColor: fillChroma.hex(),
      fillOpacity: fillChroma.alpha(),
      strokeWidth: this.linewidth * 100,
    };
  }

  normalizeToCanvas(
    canvasWidth = 640,
    canvasHeight = 360,
    /*sceneWidth=consts.FRAME_WIDTH,*/
    sceneHeight = consts.FRAME_HEIGHT,
  ) {
    this.children[0].matrix.manual = true;
    this.children[0].matrix.identity()
      .translate(canvasWidth / 2, canvasHeight / 2)
      .scale(canvasHeight / sceneHeight)
      .multiply(
        1, 0, 0, /* reflect over x axis */
        0, -1, 0,
        0, 0, 1,
      );
  }

  suspendUpdating(recursive = true) {
    this.updatingSuspended = true;
    if (recursive) {
      for (let submob of this.children.slice(1)) {
        submob.suspendUpdating(recursive);
      }
    }
    return this;
  }

  setAnchorsFromPoints(points) {
    let anchors = [];
    for (let i = 0; i < points.length / 4 + 1; i++) {
      let a = new Two.Anchor(0, 0, 0, 0, 0, 0, 'C');
      a.relative = false;
      anchors.push(a);
    }
    for (let i = 0; i < points.length; i += 4) {
      anchors[i / 4].x = points[i][0];
      anchors[i / 4].y = points[i][1];
      anchors[i / 4].controls.right.x = points[i + 1][0];
      anchors[i / 4].controls.right.y = points[i + 1][1];
      anchors[i / 4 + 1].controls.left.x = points[i + 2][0];
      anchors[i / 4 + 1].controls.left.y = points[i + 2][1];
      anchors[i / 4 + 1].x = points[i + 3][0];
      anchors[i / 4 + 1].y = points[i + 3][1];
    }
    this.children[0].vertices = anchors;
  }

  addPoints(n) {
    let np = window.pyodide.pyimport("numpy");
    let curNum = this.points().length;
    if (curNum === 1) {
      for (let i = 0; i < n; i++) {
        this.points().push(this.points()[0].clone());
      }
    }

    // there is no curve between the last and first anchor
    curNum -= 1;
    let targetNum = curNum + n;
    // This is an array with values ranging from 0
    // up to curr_num,  with repeats such that
    // it's total length is target_num.  For example,
    // with curr_num = 10, target_num = 15, this would
    // be [0, 0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9]
    let repeatIndices = np.arange(targetNum)
      .map(x => x * curNum)
      .map(x => Math.floor(x / targetNum));

    // If the nth term of this list is k, it means
    // that the nth curve of our path should be split
    // into k pieces.  In the above example, this would
    // be [2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
    let splitFactors = [];
    for (let i = 0; i < curNum; i++) {
      let count = repeatIndices.reduce(
        (total, x) => (x == i ? total + 1 : total),
        0,
      );
      splitFactors.push(count);
    }

    let newPoints = [];
    for (let i = 0; i < curNum; i++) {
      let curveStart = this.points()[i];
      let curveEnd = this.points()[i + 1];
      let splitFactor = splitFactors[i];
      let alphas = np.linspace(0, 1, splitFactor + 1);
      for (let j = 0; j < alphas.length - 1; j++) {
        let a1 = alphas[j], a2 = alphas[j + 1];
        let bezierPoints = utils.partialBezierPoints(curveStart, curveEnd, a1, a2);
        bezierPoints.forEach(x => newPoints.push(x));
      }
    }
    return newPoints;
  }

  getPointMobject() {
    let center = this.getPointCenter();
    return new Mobject(utils.pathFromAnchors([center], [center], [center]));
  }

  path() {
    return this.children[0];
  }

  submobjects() {
    return this.children.slice(1);
  }

  points() {
    return this.children[0].vertices;
  }

  getPointCenter() {
    if (this.__proto__ === TexMobject.prototype) {
      // eslint-disable-next-line
      console.warn("getPointCenter() doesn't work on latex");
    }
    if (this.points().length === 0) {
      return [0, 0];
    }
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;
    this.getMobjectHeirarchy().forEach(submob => {
      submob.points().forEach(p => {
        xMin = Math.min(xMin, p.x);
        xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      });
    });
    return [(xMax + xMin) / 2, (yMax + yMin) / 2];
  }

  getDimensions() {
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;
    this.getMobjectHeirarchy().forEach(submob => {
      submob.points().forEach(p => {
        xMin = Math.min(xMin, p.x);
        xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      });
    });
    if (xMin === Infinity) {
      return null;
    }
    let center = {
      x: (xMax + xMin) / 2,
      y: (yMax + yMin) / 2,
    };
    let height = yMax - yMin;
    let width = xMax - xMin;
    return {
      center: center,
      height: height,
      width: width,
      topLeft:     { x: center.x - width / 2, y: center.y - height / 2 },
      topRight:    { x: center.x + width / 2, y: center.y - height / 2 },
      bottomRight: { x: center.x + width / 2, y: center.y + height / 2 },
      bottomLeft:  { x: center.x - width / 2, y: center.y + height / 2 },
    };
  }

  getPixelCenter() {
    if (this.points().length === 0) {
      // TODO: This needs the scene's height and width
      return [this.width / 2, this.height / 2];
    }
    let rect = this.getBoundingClientRect();
    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
  }

  familyMembersWithPoints() {
    let ret = [];
    let family = this.getFamily();
    for (let i = 0; i < family.length; i++) {
      if (family[i].points().length > 0) {
        ret.push(family[i]);
      }
    }
    return ret;
  }

  getMobjectHeirarchy() {
    let ret = [this];
    this.submobjects().forEach(submob => {
      ret.push(...submob.getMobjectHeirarchy())
    });
    return utils.removeListRedundancies(ret);
  }

  interpolate(mobject1, mobject2, alpha) {
    // interpolate points
    let newAnchors = [];
    for (let i = 0; i < this.points().length; i++) {
      let a = mobject1.points()[i].clone().lerp(mobject2.points()[i], alpha);
      a.controls.left = mobject1.points()[i].controls.left.clone().lerp(mobject2.points()[i].controls.left, alpha);
      a.controls.right = mobject1.points()[i].controls.right.clone().lerp(mobject2.points()[i].controls.right, alpha);
      newAnchors.push(a);
    }
    this.children[0].vertices = newAnchors;

    // interpolate styles
    this.applyStyle(utils.interpolateStyles(
      mobject1.getStyleDict(),
      mobject2.getStyleDict(),
      alpha,
    ));
  }

  clone(parent) {
    let clone = new Group();

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }

  // TODO: Use a
  pointwiseBecomePartial(other, a, b) {
    // eslint-disable-next-line
    console.assert(0 <= a && a <= 1 && 0 <= b && b <= 1 && a <= b, a, b);
    let bezierQuads = _.chunk(utils.getManimPoints(other), 4);

    // let aScaled = a * bezierQuads.length;
    // let aIndex = Math.floor(aScaled);
    // let aResidue = aScaled % 1;

    let [bIndex, bResidue] = utils.integerInterpolate(0, bezierQuads.length, b);

    let newPathCoeffs = bezierQuads.slice(0, bIndex);
    let bResidueCoeffs = [];
    if (bIndex < bezierQuads.length) {
      bResidueCoeffs = utils.splitBezier(bezierQuads[bIndex], bResidue);
    }
    if (bResidueCoeffs.length > 0) {
      newPathCoeffs.push(bResidueCoeffs);
    }
    let vertexCommands = other.children[0].vertices.slice(0, newPathCoeffs.length + 1).map(v => v.command);
    // eslint-disable-next-line
    console.assert(
      vertexCommands.length === newPathCoeffs.length + 1,
      vertexCommands.length,
      newPathCoeffs.length,
    );

    // TODO: Why doesn't this.path() work???
    let newPath = this.children[0].clone();
    let partialPath = utils.pathFromManimPoints(newPathCoeffs.flat(), vertexCommands);
    newPath.vertices = partialPath.vertices;
    newPath.closed = false;
    this.remove(this.children[0]);
    this.add(newPath);
    if (!(this instanceof TexSymbol)) {
      this.normalizeToCanvas();
    }
    this.applyStyle(this.getStyleDict());
  }
}

class Mobject extends Group {
  constructor(
    path = null,
    submobjects = [],
    style = DEFAULT_STYLE,
  ) {
    if (path === null) {
      path = new Two.Path();
    }
    super([path].concat(submobjects), /*fillTopLevel=*/true);
    this.normalizeToCanvas();
    this.applyStyle(Object.assign({}, DEFAULT_STYLE, style));
  }

  clone(parent) {
    let clone = new Mobject(this.path().clone(), [], this.getStyleDict());

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }
}

class Arc extends Mobject {
  constructor({
    startAngle = 0,
    angle = consts.TAU / 4,
    radius = 1.0,
    numComponents = 9,
    style = {},
  } = {}) {
    let np = window.pyodide.pyimport("numpy");
    let anchors = Array.from(np.linspace(
      startAngle,
      startAngle + angle,
      numComponents,
    )).map(x => [np.cos(x), np.sin(x), 0]);

    // Figure out which control points will give the
    // Appropriate tangent lines to the circle
    let dTheta = angle / (numComponents - 1.0)
    // Rotate all 90 degress, via (x, y) -> (-y, x)
    let tangentVectors = [];
    for (let i = 0; i < anchors.length; i++) {
      tangentVectors.push([-anchors[i][1], anchors[i][0], 0]);
    }
    // Use tangent vectors to deduce anchors
    let handles2 = [];
    for (let i = 0; i < tangentVectors.length; i++) {
      handles2.push([
        anchors[i][0] + (dTheta / 3) * tangentVectors[i][0],
        anchors[i][1] + (dTheta / 3) * tangentVectors[i][1],
        anchors[i][2] + (dTheta / 3) * tangentVectors[i][2],
      ]);
    }
    let handles1 = [];
    for (let i = 0; i < tangentVectors.length; i++) {
      handles1.push([
        anchors[i][0] - (dTheta / 3) * tangentVectors[i][0],
        anchors[i][1] - (dTheta / 3) * tangentVectors[i][1],
        anchors[i][2] - (dTheta / 3) * tangentVectors[i][2],
      ]);
    }
    let path = utils.pathFromAnchors(anchors, handles1, handles2);

    super(path, [], style);
    this.scaleMobject(radius);

    this.startAngle = startAngle;
    this.angle = angle;
    this.radius = radius;
  }
}

class Circle extends Arc {
  constructor({
    radius = 1.0,
    style = {strokeColor: consts.RED}
  } = {}) {
    super({
      startAngle: 0,
      angle: consts.TAU,
      radius: radius,
      numComponents: 9,
      style: style,
    });
    this.radius = radius;
  }

  clone(parent) {
    let clone = new Circle({
      radius: this.radius,
      style: this.getStyleDict(),
    });

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }
}

class Polygon extends Mobject {
  constructor(
    vertices,
    style = {strokeColor: consts.BLUE}
  ) {
    let path = utils.pathFromPoints(vertices);
    super(path, [], style);
  }
}

class RegularPolygon extends Polygon {
  constructor({
    numSides = 3,
    height = 2,
    style = {},
  } = {}) {
    let np = window.pyodide.pyimport("numpy");
    let vertices = [];
    let angle;
    for (let i = 0; i < numSides; i++) {
      angle = 2 * np.pi * i / numSides;
      if (numSides % 2 == 0) {
        angle -= np.pi / numSides;
      }
      vertices.push([np.sin(angle), np.cos(angle)]);
    }
    let halfway = np.trunc(numSides / 2);
    let oldHeight = np.abs(vertices[0][1] - vertices[halfway][1]);
    vertices.forEach(function (vertex) {
      vertex[0] *= height / oldHeight;
      vertex[1] *= height / oldHeight;
    });
    let shiftDist = height / 2 - vertices[0][1];
    vertices.forEach(function (vertex) {
      vertex[1] += shiftDist;
    });
    super(vertices, style);
  }
}

class Star extends Polygon {
  constructor({
    numPoints = 5,
    height = 2,
    ratio = 0.5,
    style = {}
  } = {}) {
    let np = window.pyodide.pyimport("numpy");
    let vertices = [];
    let angle;
    for (let i = 0; i < numPoints; i++) {
      angle = 2 * np.pi * i / numPoints;
      vertices.push([np.sin(angle), np.cos(angle)]);
      angle += np.pi / numPoints;
      vertices.push([ratio * np.sin(angle), ratio * np.cos(angle)]);
    }
    let halfway = 2 * np.trunc(numPoints / 2);
    let oldHeight = np.abs(vertices[0][1] - vertices[halfway][1]);
    vertices.forEach(function (vertex) {
      vertex[0] *= height / oldHeight;
      vertex[1] *= height / oldHeight;
    });
    let shiftDist = height / 2 - vertices[0][1];
    vertices.forEach(function (vertex) {
      vertex[1] += shiftDist;
    });
    super(vertices, style);
  }
}

class StarOfDavid extends Star {
  constructor({
    height = 2,
    ratio = 1 / Math.sqrt(3),
    style = {strokeColor: consts.GREEN}
  } = {}) {
    super({
      numPoints: 6,
      height: height,
      ratio: ratio,
      style: style,
    });
  }
}

class Triangle extends RegularPolygon {
  constructor({
    height = 2,
    style = {strokeColor: consts.GREEN}
  } = {}) {
    super({
      numSides: 3,
      height: height,
      style: style,
    });
  }
}

class Pentagon extends RegularPolygon {
  constructor({
    height = 2,
    style = {strokeColor: consts.GREEN}
  } = {}) {
    super({
      numSides: 5,
      height: height,
      style: style,
    });
  }
}

class Hexagon extends RegularPolygon {
  constructor({
    height = 2,
    style = {strokeColor: consts.GREEN}
  } = {}) {
    super({
      numSides: 6,
      height: height,
      style: style,
    });
  }
}

class Octagon extends RegularPolygon {
  constructor({
    height = 2,
    style = {strokeColor: consts.GREEN}
  } = {}) {
    super({
      numSides: 8,
      height: height,
      style: style,
    });
  }
}

class Rectangle extends Polygon {
  constructor({
    height = 2.0,
    width = 4.0,
    style = {strokeColor: consts.WHITE}
  } = {}) {
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    super(
      [[-halfWidth, halfHeight],
      [halfWidth, halfHeight],
      [halfWidth, -halfHeight],
      [-halfWidth, -halfHeight]],
      style,
    );

    this.width = width;
    this.height = height;
  }
}

class Square extends RegularPolygon {
  constructor({
    sideLength = 2.0,
    style = {strokeColor: consts.GREEN}
  } = {}) {
    super({
      numSides: 4,
      height: sideLength,
      style: style,
    });
    this.sideLength = sideLength;
  }

  clone(parent) {
    let clone = new Square({
      sideLength: this.sideLength,
      style: this.getStyleDict(),
    });

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }
}

class TexSymbol extends Group {
  constructor(path) {
    super([path], /*fillTopLevel=*/true);
    this.path = path;
  }

  clone(parent) {
    let clone = new TexSymbol(this.path.clone());

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }
}

class StringTexMobject extends Mobject {
  constructor(
    texString,
    texSymbols,
    style = {strokeColor: consts.WHITE, fillColor: consts.WHITE, fillOpacity: 1}
  ) {
    super(null, texSymbols, style);
    this.texString = texString;
  }

  // TODO: should eventually take tex -> sstm
  static fromSVGGroup(texString, group, style) {
    let texSymbols = utils.extractPathsFromGroup(group).map(path => {
      let newSymbol = new TexSymbol(utils.normalizePath(path));
      newSymbol.applyStyle(Object.assign({}, DEFAULT_STYLE, style));
      return newSymbol;
    });
    return new StringTexMobject(texString, texSymbols, style);
  }

  static fromSingleStringTexMobject(sstm, style) {
    let newSymbols = sstm.submobjects().map(symbol => {
      let newSymbol = new TexSymbol(utils.normalizePath(symbol.children[0]));
      newSymbol.applyStyle(Object.assign({}, DEFAULT_STYLE, style));
      return newSymbol;
    });
    let s = new StringTexMobject(sstm.texString, newSymbols, style);
    return s;
  }
}

class SingleStringTexMobject extends Mobject {
  constructor(
    texString,
    group,
    style = {strokeColor: consts.WHITE, fillColor: consts.WHITE, fillOpacity: 1}
  ) {
    let texSymbols = [];
    for (let path of utils.extractPathsFromGroup(group)) {
      let parent = path.parent;
      parent.remove(path);
      let texSymbol = new TexSymbol(path);
      parent.add(texSymbol);
      texSymbols.push(texSymbol);
    }
    super(null, [group], style);
    this.texString = texString;
    this.texSymbols = texSymbols;
    this.viewBox = group.viewBox;
  }

  submobjects() {
    return this.texSymbols;
  }

  clone(parent) {
    let clone = new SingleStringTexMobject(
      _.cloneDeep(this.texString),
      new Two.Group(),
      this.getStyleDict()
    );

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    let texSymbols = [];
    for (let path of utils.extractPathsFromGroup(clone.children[1])) {
      texSymbols.push(path.parent);
    }
    clone.texSymbols = texSymbols;

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }
}

class TexMobject extends Mobject {
  constructor(
    texStrings,
    scene,
    style = {
      fillColor: consts.WHITE,
      fillOpacity: 1,
      strokeColor: consts.WHITE,
      strokeOpacity: 1,
      strokeWidth: 1,
    },
    startString = "",
    endString = "",
  ) {
    let submobLatex = [];
    let submobLatexLengths = [];
    let newSubmobLatex = [];

    // Prepend an (unwrapped) a for scaling later.
    let wrappedTexString = "a";
    let group = scene.texToSvgGroup(wrappedTexString);
    newSubmobLatex.push(StringTexMobject.fromSVGGroup(wrappedTexString, group, style));
    submobLatex.push(new SingleStringTexMobject(wrappedTexString, group, style));
    submobLatexLengths.push(utils.extractPathsFromGroup(group).length);

    for (let texString of texStrings) {
      let wrappedTexString = `${startString}${texString}${endString}`;
      let group = scene.texToSvgGroup(wrappedTexString);
      newSubmobLatex.push(StringTexMobject.fromSVGGroup(wrappedTexString, group, style));
      submobLatex.push(new SingleStringTexMobject(wrappedTexString, group, style));
      submobLatexLengths.push(utils.extractPathsFromGroup(group).length);
    }
    let combinedTexString = `a${startString}${texStrings.join(' ')}${endString}`;
    let combinedLatexGroup = scene.texToSvgGroup(combinedTexString);
    // let combinedLatex = StringTexMobject.fromSVGGroup(combinedTexString, combinedLatexGroup);
    let combinedLatex = new SingleStringTexMobject(combinedTexString, combinedLatexGroup);

    // Scale the SingleStringTexMobjects within this TexMobject.
    combinedLatex.getBoundingClientRect();
    for (let submob of submobLatex) {
      submob.getBoundingClientRect();
    }
    let currentIndex = 0;
    for (let i = 0; i < submobLatex.length; i++) {
      let submob = submobLatex[i];
      let submobScalingMob = submob.submobjects()[0];
      // TODO: Why are these calls necessary? The only modification seems to be
      // that _update() is called on each mobject in the heirarchy.
      submob.getBoundingClientRect();
      combinedLatex.getBoundingClientRect();
      submob.scaleMobject(
        combinedLatex.submobjects()[currentIndex].getBoundingClientRect().height /
        submobScalingMob.getBoundingClientRect().height
      );
      currentIndex += submobLatexLengths[i];
    }

    // Translate the SingleStringTexMobjects within this TexMobject.
    let currentTexStringIndex = 0;
    let currentTexSymbolIndex = 0;
    for (let i = 0; i < combinedLatex.submobjects().length; i++) {
      let combinedTexSymbol = combinedLatex.submobjects()[i];
      let currentTexString = submobLatex[currentTexStringIndex];
      let currentTexSymbol = currentTexString.submobjects()[currentTexSymbolIndex];
      let combinedSymbolCenter = utils.getBoundingClientRectCenter(combinedTexSymbol.getBoundingClientRect());
      let currentSymbolCenter = utils.getBoundingClientRectCenter(currentTexSymbol.getBoundingClientRect());
      let currentSymbolMatrix = Two.Utils.getComputedMatrix(currentTexSymbol.children[0]);
      // TODO: Use actual matrix multiplication
      utils.translatePath(
        [
          (combinedSymbolCenter[0] - currentSymbolCenter[0]) * 1/currentSymbolMatrix.elements[0],
          (combinedSymbolCenter[1] - currentSymbolCenter[1]) * 1/currentSymbolMatrix.elements[4],
        ],
        currentTexSymbol.children[0],
      );
      if (currentTexSymbolIndex === currentTexString.submobjects().length - 1) {
        currentTexStringIndex += 1;
        currentTexSymbolIndex = 0;
      } else {
        currentTexSymbolIndex += 1;
      }
    }

    submobLatex = submobLatex.map(sstm => StringTexMobject.fromSingleStringTexMobject(sstm, style));
    combinedLatex = StringTexMobject.fromSingleStringTexMobject(combinedLatex, style);

    super(null, submobLatex, style);

    // Center the TexMobject
    const dimensions = this.getDimensions();
    Mobject.prototype.translateMobject.call(this, [-dimensions.center.x, -dimensions.center.y]);

    // Scale the TexMobject to the proper size
    const scalerHeight = submobLatex[0].getBoundingClientRect().height;
    const scalingRatio = consts.aHeightTwo / scalerHeight;
    this.scaleMobject(scalingRatio);

    // Remove the scaler
    this.remove(this.submobjects()[0]);

    this.texStrings = texStrings;
    this.scene = scene;
  }

  translateMobject(manimVector) {
    let manim2two = utils.getManimToTwoTransformationMatrix();
    let twoVector = math.multiply(manim2two, manimVector).toArray().slice(0, 2);
    for (let singleStringTexMobject of this.submobjects()) {
      for (let texSymbol of singleStringTexMobject.submobjects()) {
        if (texSymbol.children[0].vertices.length === 0) {
          continue;
        }
        let matrix = Two.Utils.getComputedMatrix(texSymbol.children[0]);
        let mappedTranslation = [
          twoVector[0] / matrix.elements[0],
          twoVector[1] / matrix.elements[4],
        ];
        utils.translatePath(mappedTranslation, texSymbol.children[0]);
      }
    }
  }

  getMobjectHeirarchy() {
    let ret = [this];
    for (let submob of this.submobjects()) {
      ret.push(submob);
      for (let texSymbol of submob.submobjects()) {
        ret.push(texSymbol);
      }
    }
    return ret;
  }

  applyStyle(style) {
    for (let submob of this.submobjects()) {
      if ("strokeWidth" in style && submob.hasOwnProperty("viewBox")) {
        let styleCopy = Object.assign({}, style);
        let viewBoxFields = submob.viewBox.split(" ").map(x => parseInt(x));
        let [width, height] = viewBoxFields.slice(2);
        let majorDimension = Math.max(width, height);
        if (majorDimension < 400) {
          // eslint-disable-next-line
          console.warn(`The latex for ${submob.texString} is too small to guess accurately. strokeWidth may be inconsistent`);
        }
        let convertedStrokeWidth = style["strokeWidth"] * majorDimension * consts.strokeWidthConstant;
        styleCopy["strokeWidth"] = convertedStrokeWidth;
        submob.applyStyle(styleCopy);
      } else {
        submob.applyStyle(style);
      }
    }
  }

  clone(parent) {
    // TODO: This is very wasteful, since the children are removed later
    let clone = new TexMobject(_.cloneDeep(this.texStrings), this.scene);
    clone.startString = this.startString;
    clone.endString = this.endString;

    let children = Two.Utils.map(this.children, function (child) {
      return child.clone();
    });

    clone.remove(clone.children);
    clone.add(children);

    clone.opacity = this.opacity;

    if (this.mask) {
      clone.mask = this.mask;
    }

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    if (this.matrix.manual) {
      clone.matrix.copy(this.matrix);
    }

    if (parent) {
      parent.add(clone);
    }

    return clone._update();
  }
}

class TextMobject extends TexMobject {
  constructor(
    texStrings,
    scene,
    style = {
      fillColor: consts.WHITE,
      fillOpacity: 1,
      strokeColor: consts.WHITE,
      strokeOpacity: 1,
      strokeWidth: 1,
    },
    startString = "\\textrm{",
    endString = "}",
  ) {
    super(texStrings, scene, style, startString, endString);
  }
}

export {
  Group,
  Mobject,
  Arc,
  Circle,
  Polygon,
  RegularPolygon,
  Star,
  StarOfDavid,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Rectangle,
  Square,
  TexSymbol,
  SingleStringTexMobject,
  TexMobject,
  TextMobject,
  Animation,
  ReplacementTransform,
  ShowCreation,
  Write,
  FadeOut,
  FadeIn,
  Wait,
  Scene,
};
