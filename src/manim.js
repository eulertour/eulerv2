import * as Two from 'two.js/build/two.js'
import * as consts from './constants.js'
import * as utils from './utils.js'
import chroma from 'chroma-js'
import {
  Animation,
  Wait,
  ReplacementTransform,
  ShowCreation,
  // ApplyPointwiseFunction,
  ApplyFunction,
  Write,
  FadeOut,
  FadeIn,
} from './animation.js';
import {Scene} from './scene.js';
import * as _ from 'lodash'
import * as math from 'mathjs'

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

  scaleRelativeToOrigin(factor) {
    utils.scalePath(factor, this.children[0]);
    for (let submob of this.submobjects()) {
      submob.scaleRelativeToOrigin(factor);
    }
    return this;
  }

  scaleMobject(factor) {
    const dimensions = this.getDimensions();
    if (dimensions === null) {
      return;
    }
    let center = dimensions.center;
    this.translateMobject(math.multiply(-1, center));
    this.scaleRelativeToOrigin(factor);
    this.translateMobject(center);
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
    // TODO: Consider a parent Mobject which has never been styled directly and
    // which contains children that have been styled independently of the
    // parent. When the parent is styled with a partial style dict, the
    // attributes missing from the style dict will be set on the child mobjects
    // to the default values from two.js. This is because getStyleDict() can't
    // distinguish between an unset value and a default value from two.js. As a
    // workaround, simply never style a parent Mobject which isn't styled during
    // initialization.
    if (
      this.__proto__ === Group.prototype ||
      this.__proto__ === TexMobject.prototype ||
      this.__proto__ === TextMobject.prototype
    ) {
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
        const mappedVector = math.multiply(matrix, [vector.x, vector.y].concat(0)).toArray();
        vector.x = mappedVector[0];
        vector.y = mappedVector[1];
      }
    }
  }

  // Always assume rotation about the z axis.
  handleRotate(angle, axis, config, reverse) {
    let rotationMatrix = utils.getRotationMatrix(reverse ? -angle : angle, axis);
    this.transformWithMatrix(rotationMatrix);
  }

  handleShift(vector, reverse) {
    this.translateMobject(reverse ? vector.map(x => -x) : vector);
  }

  // Always assume scaling about the Mobject's center.
  handleScale(factor, config, reverse) {
    this.scaleMobject(reverse ? 1 / factor : factor);
  }

  applyTransformations(transformations) {
    for (let i = 0; i < transformations.length; i++) {
      let command = transformations[i][0];
      let args = transformations[i].slice(1);
      if (command === 'rotate') {
        let rotationMatrix = utils.getRotationMatrix(...args);
        this.transformWithMatrix(rotationMatrix);
      } else if (command === 'scale') {
        this.scaleMobject(args[0]);
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

  submobjects(index) {
    if (index === undefined) {
      return this.children.slice(1);
    } else {
      return this.children.slice(1)[index];
    }
  }

  points() {
    if (this.children.length > 0) {
      return this.children[0].vertices;
    } else {
      return [];
    }
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
    this.getMobjectHierarchy().forEach(submob => {
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
    this.getMobjectHierarchy().forEach(submob => {
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
    let center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
    let height = yMax - yMin;
    let width = xMax - xMin;
    return {
      center: center,
      height: height,
      width: width,
      topLeft:     math.add(center, [-width / 2, -height / 2]),
      topRight:    math.add(center, [+width / 2, -height / 2]),
      bottomRight: math.add(center, [+width / 2, +height / 2]),
      bottomLeft:  math.add(center, [-width / 2, +height / 2]),
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

  getMobjectHierarchy() {
    let ret = [this];
    this.submobjects().forEach(submob => {
      ret.push(...submob.getMobjectHierarchy())
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
    clone.name = this.name;

    let children = this.children.map(child => child.clone());

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
    /* For some reason, putting only a single point in the Mobject's path causes
     * Two to render a line from the origin to that point. As a workaround, set
     * the opacity of the Mobject to 0 when no points should be visible.
     */
    if (a === b) {
      this.opacity = 0;
    } else {
      this.opacity = 1;
    }
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

    let newPath = this.path().clone();
    let partialPath = utils.pathFromManimPoints(newPathCoeffs.flat(), vertexCommands);
    newPath.vertices = partialPath.vertices;
    newPath.closed = false;
    this.remove(this.children[0]);
    this.add(newPath);
    this.applyStyle(this.getStyleDict());
  }

  applyFunction(func) {
    for (let vertex of this.path().vertices) {
      [vertex.x, vertex.y] = func([vertex.x, vertex.y]);
      [vertex.controls.left.x, vertex.controls.left.y] = func([vertex.controls.left.x, vertex.controls.left.y]);
      [vertex.controls.right.x, vertex.controls.right.y] = func([vertex.controls.right.x, vertex.controls.right.y]);
    }
    return this;
  }
}

class Mobject extends Group {
  constructor(
    path = null,
    submobjects = [],
    config = {},
  ) {
    let fullConfig = Object.assign(
      Mobject.defaultConfig(),
      config,
      Mobject.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Mobject.defaultStyle(),
      config.style,
    );

    if (path === null) {
      path = new Two.Path();
    }
    if (path !== null) {
      path.matrix.manual = true;
      path.matrix.set(...utils.getManimToTwoTransformationMatrix({
        twoWidth: fullConfig.sceneWidth,
        twoHeight: fullConfig.sceneHeight,
      }).toArray().flat());
    }

    super([path].concat(submobjects), /*fillTopLevel=*/true);
    this.config = _.cloneDeep(config);

    if (!config.skipStyling && fullConfig.style !== null) {
      this.applyStyle(fullConfig.style);
    }
  }

  static defaultConfig() {
    return {};
  }

  static defaultStyle() {
    return {
      strokeColor: consts.WHITE,
      strokeOpacity: 1,
      fillColor: consts.BLACK,
      fillOpacity: 0,
      strokeWidth: 4,
    };
  }

  static staticConfig() {
    return {};
  }

  clone(parent) {
    let clone = new Mobject(this.path().clone(), [], this.config);
    clone.name = this.name;
    clone.applyStyle(this.getStyleDict());

    let children = this.children.map(child => child.clone());

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
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Arc.defaultConfig(),
      config,
      Arc.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Arc.defaultStyle(),
      config.style,
    );

    let {
      startAngle,
      angle,
      radius,
      numComponents,
    } = fullConfig;
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

    super(path, [], fullConfig);
    this.config = _.cloneDeep(config);

    this.scaleMobject(radius);
  }

  static defaultConfig() {
    return {
      startAngle: 0,
      angle: consts.TAU / 4,
      radius: 1.0,
      numComponents: 9,
      style: {},
    };
  }

  static defaultStyle() {
    return {};
  }

  static staticConfig() {
    return {};
  }
}

class Circle extends Arc {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Circle.defaultConfig(),
      config,
      Circle.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Circle.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return {
      radius: 1.0,
    };
  }

  static defaultStyle() {
    return { strokeColor: consts.RED };
  }

  static staticConfig() {
    return {
      startAngle: 0,
      angle: consts.TAU,
      numComponents: 9,
    };
  }

  clone(parent) {
    let clone = new Circle(this.config);
    clone.name = this.name;
    clone.applyStyle(this.getStyleDict());

    let children = this.children.map(child => child.clone());

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
  constructor(vertices, config = {}) {
    let fullConfig = Object.assign(
      Polygon.defaultConfig(),
      config,
      Polygon.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Polygon.defaultStyle(),
      config.style,
    );
    let path = utils.pathFromPoints(vertices);
    super(path, [], fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return {};
  }

  static defaultStyle() {
    return { strokeColor: consts.BLUE };
  }

  static staticConfig() {
    return {};
  }
}

class RegularPolygon extends Polygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      RegularPolygon.defaultConfig(),
      config,
      RegularPolygon.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      RegularPolygon.defaultStyle(),
      config.style,
    );

    let {
      numSides,
      height,
    } = fullConfig;
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
    super(vertices, fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return {
      numSides: 3,
      height: 2,
    };
  }

  static defaultStyle() {
    return {};
  }

  static staticConfig() {
    return {};
  }
}

class Star extends Polygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Star.defaultConfig(),
      config,
      Star.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Star.defaultStyle(),
      config.style,
    );

    let {
      numPoints,
      ratio,
      height,
    } = fullConfig;
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
    super(vertices, fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return {
      numPoints: 5,
      height: 2,
      ratio: 0.5,
    };
  }

  static defaultStyle() {
    return {};
  }

  static staticConfig() {
    return {};
  }
}

class StarOfDavid extends Star {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      StarOfDavid.defaultConfig(),
      config,
      StarOfDavid.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      StarOfDavid.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return {
      height: 2,
      ratio: 1 / Math.sqrt(3),
    };
  }

  static defaultStyle() {
    return { strokeColor: consts.GREEN }
  }

  static staticConfig() {
    return { numPoints: 6 };
  }
}

class Triangle extends RegularPolygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Triangle.defaultConfig(),
      config,
      Triangle.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Triangle.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return { height: 2 };
  }

  static defaultStyle() {
    return { strokeColor: consts.GREEN }
  }

  static staticConfig() {
    return { numSides: 3 };
  }
}

class Pentagon extends RegularPolygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Pentagon.defaultConfig(),
      config,
      Pentagon.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Pentagon.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return { height: 2 };
  }

  static defaultStyle() {
    return { strokeColor: consts.GREEN }
  }

  static staticConfig() {
    return { numSides: 5 };
  }
}

class Hexagon extends RegularPolygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Hexagon.defaultConfig(),
      config,
      Hexagon.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Hexagon.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return { height: 2 };
  }

  static defaultStyle() {
    return { strokeColor: consts.GREEN }
  }

  static staticConfig() {
    return { numSides: 6 };
  }
}

class Octagon extends RegularPolygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Octagon.defaultConfig(),
      config,
      Octagon.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Octagon.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return { height: 2 };
  }

  static defaultStyle() {
    return { strokeColor: consts.GREEN }
  }

  static staticConfig() {
    return { numSides: 8 };
  }
}

class Rectangle extends Polygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Rectangle.defaultConfig(),
      config,
      Rectangle.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Rectangle.defaultStyle(),
      config.style,
    );

    let { width, height } = fullConfig;
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    super(
      [[-halfWidth, halfHeight],
      [halfWidth, halfHeight],
      [halfWidth, -halfHeight],
      [-halfWidth, -halfHeight]],
      fullConfig,
    );
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return { height: 2, width: 4 };
  }

  static defaultStyle() {
    return { strokeColor: consts.WHITE }
  }

  static staticConfig() {
    return {};
  }
}

class Square extends RegularPolygon {
  constructor(config = {}) {
    let fullConfig = Object.assign(
      Square.defaultConfig(),
      config,
      Square.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      Square.defaultStyle(),
      config.style,
    );
    super(fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return { sideLength: 2.0 };
  }

  static defaultStyle() {
    return { strokeColor: consts.GREEN };
  }

  static staticConfig() {
    return {
      numSides: 4,
      height: 2,
    };
  }

  clone(parent) {
    let clone = new Square(this.config);
    clone.name = this.name;
    clone.applyStyle(this.getStyleDict());

    let children = this.children.map(child => child.clone());

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

class TexSymbol extends Mobject {
  constructor(path, config = {}) {
    let fullConfig = Object.assign(
      TexSymbol.defaultConfig(),
      config,
      TexSymbol.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      TexSymbol.defaultStyle(),
      config.style,
    );
    super(path, [], fullConfig);
    this.config = _.cloneDeep(config);
  }

  static defaultConfig() {
    return {};
  }

  static defaultStyle() {
    return {};
  }

  static staticConfig() {
    return {};
  }

  clone(parent) {
    let clone = new TexSymbol(this.path().clone(), this.config);
    clone.name = this.name;
    clone.applyStyle(this.getStyleDict());

    let children = this.children.map(child => child.clone());

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

class SingleStringTexMobject extends Mobject {
  constructor(
    texString,
    texSymbols,
    config = {},
  ) {
    let fullConfig = Object.assign(
      SingleStringTexMobject.defaultConfig(),
      config,
      SingleStringTexMobject.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      SingleStringTexMobject.defaultStyle(),
      config.style,
    );
    super(null, texSymbols, fullConfig);
    this.texString = texString;
  }

  static defaultConfig() {
    return {};
  }

  static defaultStyle() {
    return {
      fillColor: consts.WHITE,
      fillOpacity: 1,
      strokeColor: consts.WHITE,
      strokeOpacity: 1,
      strokeWidth: 1,
    };
  }

  static staticConfig() {
    return {};
  }

  static fromTexString(texString, config, scene) {
    if (texString.length === 0) {
      return new SingleStringTexMobject("", [], {});
    }
    // Create the Mobject with an a prepended for scaling later.
    let group = scene.texToSvgGroup(`a${texString}`);
    group = utils.normalizeGroup(group);
    let texSymbols = group.children.map(path => new TexSymbol(path.clone(), config));
    let mob = new SingleStringTexMobject(texString, texSymbols, config);

    // Scale and center the Mobject.
    const currentScalerHeight = mob.submobjects()[0].getDimensions().height;
    mob.scaleMobject(consts.aHeightManim / currentScalerHeight);
    mob.remove(mob.submobjects()[0]);
    let center = mob.getDimensions().center;
    mob.translateMobject(math.multiply(-1, center));

    return mob;
  }

  static texToPoints(tex, scene, dumpToFile=false) {
    let points = SingleStringTexMobject
      .fromTexString(tex, {}, scene)
      .submobjects()
      .map(texSymbol => utils.getManimPoints(texSymbol));

    if (dumpToFile) {
      let f = new File([JSON.stringify(points)], `${tex}.txt`, {type: "text/plain"});
      let url = URL.createObjectURL(f);
      // eslint-disable-next-line
      console.info(`Dumped points for ${tex} to ${url}`);
    }

    return points;
  }

  clone(parent) {
    let clone = new SingleStringTexMobject(this.texString, [], this.config);
    clone.name = this.name;
    clone.applyStyle(this.getStyleDict());

    let children = this.children.map(child => child.clone());

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

class TexMobject extends Mobject {
  constructor(
    texStrings,
    config = {},
    scene,
  ) {
    // eslint-disable-next-line
    console.assert(
      scene !== null,
      "Called TexMobject constructor without a scene",
    );
    let fullConfig = Object.assign(
      TexMobject.defaultConfig(),
      config,
      TexMobject.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      TexMobject.defaultStyle(),
      config.style,
    );

    const { texToColorMap, startString, endString } = fullConfig;
    let splitTexStrings = TexMobject.splitStringsWithMap(texStrings, texToColorMap);

    // Scale and position the combined tex string.
    let combinedTexString = SingleStringTexMobject.fromTexString(
      `${startString}${splitTexStrings.join(' ')}${endString}`, fullConfig, scene,
    );

    // Align individual tex strings with the combined string.
    let singleStringTexMobjects = splitTexStrings.map(tex => {
      let wrappedString = `${startString}${tex}${endString}`;
      let stringConfig = {...fullConfig};
      stringConfig.style = _.cloneDeep(fullConfig.style);
      if (tex in texToColorMap) {
        stringConfig.style.fillColor = texToColorMap[tex];
        stringConfig.style.strokeColor = texToColorMap[tex];
      }
      return [wrappedString, stringConfig];
    }).map(texStringWithConfig => {
      return SingleStringTexMobject.fromTexString(...texStringWithConfig, scene)
    });

    let combinedIndex = 0;
    for (let texString of singleStringTexMobjects) {
      let currentSymbol = texString.submobjects()[0];
      let targetSymbol = combinedTexString.submobjects()[combinedIndex];
      let currentDimensions = currentSymbol.getDimensions();
      let targetDimensions = targetSymbol.getDimensions();
      const {center: currentCenter} = currentDimensions;
      const {center: targetCenter} = targetDimensions;
      texString.translateMobject(math.subtract(targetCenter, currentCenter));
      combinedIndex += texString.submobjects().length;

      // Skip blank spaces.
      if (combinedIndex < combinedTexString.submobjects().length) {
        while (combinedTexString.submobjects()[combinedIndex].path().vertices.length === 0) {
          combinedIndex += 1;
        }
      }
    }

    super(null, singleStringTexMobjects, { ...fullConfig, skipStyling: true });
    this.texStrings = _.cloneDeep(texStrings);
    this.config = _.cloneDeep(config);
    this.scene = scene;
  }

  static defaultConfig() {
    return {
      texToColorMap: {},
      startString: "",
      endString: "",
    };
  }

  static defaultStyle() {
    return {
      fillColor: consts.WHITE,
      fillOpacity: 1,
      strokeColor: consts.WHITE,
      strokeOpacity: 1,
      strokeWidth: 1,
    };
  }

  static staticConfig() {
    return {};
  }

  static splitStringsWithMap(texStrings, texMap) {
    if (_.isEmpty(texMap)) {
      return _.clone(texStrings);
    }
    let ret = [];
    for (let texString of texStrings) {
      for (let key of Object.keys(texMap)) {
        let split = texString.split(key);
        if (split.length === 1) {
          ret.push(...split);
        } else {
          if (split[0].length > 0) {
            ret.push(split[0].trim());
          }
          ret.push(key);
          if (split[1].length > 0) {
            ret.push(split[1].trim());
          }
        }
      }
    }
    return ret;
  }

  clone(parent) {
    let clone = new TexMobject([], {}, {});
    clone.name = this.name;
    clone.applyStyle(this.getStyleDict());

    clone.texStrings = _.cloneDeep(this.texStrings);
    clone.config = _.cloneDeep(this.config);
    clone.scene = this.scene;

    let children = this.children.map(child => child.clone());

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
    config = {},
    scene = null,
  ) {
    let fullConfig = Object.assign(
      TextMobject.defaultConfig(),
      config,
      TextMobject.staticConfig(),
    );
    fullConfig.style = utils.styleFromConfigAndDefaults(
      TextMobject.defaultStyle(),
      config.style,
    );
    super(texStrings, fullConfig, scene);
    this.config = _.cloneDeep(config);
    this.texStrings = _.cloneDeep(texStrings);
    this.scene = scene;
  }

  static defaultConfig() {
    return { texToColorMap: {} };
  }

  static defaultStyle() {
    return {
      fillColor: consts.WHITE,
      fillOpacity: 1,
      strokeColor: consts.WHITE,
      strokeOpacity: 1,
      strokeWidth: 1,
    };
  }

  static staticConfig() {
    return {
      startString: "\\textrm{",
      endString: "}",
    };
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
  // ApplyPointwiseFunction,
  ApplyFunction,
  Write,
  FadeOut,
  FadeIn,
  Wait,
  Scene,
};
