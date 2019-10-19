import * as Two from '../node_modules/two.js/build/two.js';
import * as consts from './constants.js';
import * as utils from './utils.js';
import chroma from 'chroma-js';
import { Animation, Transform, Wait } from './animation.js';
import { Scene } from './scene.js';

const DEFAULT_STYLE = {
  strokeColor: consts.WHITE,
  strokeOpacity: 1,
  fillColor: consts.BLACK,
  fillOpacity: 0,
  strokeWidth: 4,
};

/* TODO: error check python access */
class Group extends Two.Group {
  constructor (submobjects, fillTopLevel=false) {
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
    for (let submob of this.children.slice(1)) {
      submob.scaleMobject(factor);
    }
    return this;
  }

  translateMobject(vector) {
    utils.translatePath(vector, this.children[0]);
    for (let submob of this.children.slice(1)) {
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
  }

  nullPointAlign(/*other*/) {
    // eslint-disable-next-line
    console.log('Mobject.nullPointAlign not implemented');
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

  setAnchorsFromPoints(points) {
    let anchors = [];
    for (let i = 0; i < points.length / 4 + 1; i++) {
      let a = new Two.Anchor(0, 0, 0, 0, 0, 0, 'C');
      a.relative = false;
      anchors.push(a);
    }
    for (let i = 0; i < points.length; i += 4) {
      anchors[i/4].x = points[i][0];
      anchors[i/4].y = points[i][1];
      anchors[i/4].controls.right.x = points[i+1][0];
      anchors[i/4].controls.right.y = points[i+1][1];
      anchors[i/4+1].controls.left.x = points[i+2][0];
      anchors[i/4+1].controls.left.y = points[i+2][1];
      anchors[i/4+1].x = points[i+3][0];
      anchors[i/4+1].y = points[i+3][1];
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
      let curveEnd = this.points()[i+1];
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

  addSubmobjects(/*numSubmobjects*/) {
    // eslint-disable-next-line
    console.log('Mobject.addSubmobjects not implemented');
  }

  submobjects() {
    return this.children.slice(1);
  }

  points() {
    return this.children[0].vertices;
  }

  getPointCenter() {
    if (this.points().length === 0) {
      return [0, 0];
    }
    let xMin =  Infinity,
        xMax = -Infinity,
        yMin =  Infinity,
        yMax = -Infinity;
    this.points().forEach(p => {
      xMin = Math.min(xMin, p.x);
      xMax = Math.max(xMax, p.x);
      yMin = Math.min(yMin, p.y);
      yMax = Math.max(yMax, p.y);
    });
    return [(xMax + xMin) / 2, (yMax + yMin) / 2];
  }

  getPixelCenter() {
    if (this.points().length === 0) {
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

  getFamily() {
    // A family is a mobject together with all of its submobjects, recursively
    // def get_family(self):
    //     sub_families = list(map(Mobject.get_family, self.submobjects))
    //     all_mobjects = [self] + list(it.chain(*sub_families))
    //     return remove_list_redundancies(all_mobjects)
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
    let style = {};
    let style1 = mobject1.getStyleDict();
    let style2 = mobject2.getStyleDict();
    style['strokeColor']   = chroma.scale([style1.strokeColor, style2.strokeColor])(alpha);
    style['strokeOpacity'] = utils.interpolate(style1.strokeOpacity, style2.strokeOpacity, alpha);
    style['strokeWidth']   = utils.interpolate(style1.strokeWidth, style2.strokeWidth, alpha);
    style['fillColor']     = chroma.scale([style1.fillColor, style2.fillColor])(alpha);
    style['fillOpacity']   = utils.interpolate(style1.fillOpacity, style2.fillOpacity, alpha);
    this.applyStyle(style);
  }
}

class Mobject extends Group {
  constructor (
    path=null,
    submobjects=[],
    style=DEFAULT_STYLE,
  ) {
    super([path].concat(submobjects), /*fillTopLevel=*/true);
    this.normalizeToCanvas();
    this.applyStyle(style);
  }

  applyStyle(style) {
    let combinedStyle = this.getFullStyle(style);
    this.stroke = combinedStyle.strokeColor;
    this.fill = combinedStyle.fillColor;
    this.linewidth = combinedStyle.strokeWidth / 100;
    return this;
  }

  getFullStyle(style) {
    return Object.assign(Object.assign({}, DEFAULT_STYLE), style);
  }

  getStyleDict() {
    return {
      strokeColor: this.stroke,
      fillColor: this.fill,
      strokeWidth: this.linewidth * 100,
    };
  }

  normalizeToCanvas(
    canvasWidth=640,
    canvasHeight=360,
    /*sceneWidth=consts.FRAME_WIDTH,*/
    sceneHeight=consts.FRAME_HEIGHT,
  ) {
    this.children[0].matrix.manual = true;
    this.children[0].matrix.identity()
                    .translate(canvasWidth / 2, canvasHeight / 2)
                    .scale(canvasHeight / sceneHeight)
                    .multiply(
                      1,  0, 0, /* reflect over +x axis */
                      0, -1, 0,
                      0,  0, 1,
                    );
  }

  suspendUpdating(recursive=true) {
    this.updatingSuspended = true;
    if (recursive) {
      for (let submob of this.children.slice(1)) {
        submob.suspendUpdating(recursive);
      }
    }
    return this;
  }
}

class Arc extends Mobject {
  constructor(
    startAngle=0,
    angle=consts.TAU / 4,
    radius=1.0,
    numComponents=9,
    style={},
  ) {
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

    this.startAngle=startAngle;
    this.angle=angle;
    this.radius=radius;
  }
}

class Circle extends Arc {
  constructor(
    radius=1.0,
    style={strokeColor: consts.RED}
  ) {
    super(0, consts.TAU, radius, /*numComponents=*/9, style);
    this.radius=radius;
  }
}

class Polygon extends Mobject {
  constructor(
    vertices,
    style={strokeColor: consts.BLUE}
  ) {
    let path = utils.pathFromPoints(vertices);
    super(path, [], style);
  }
}

class RegularPolygon extends Polygon {
  constructor(
    numSides=3,
    height=2,
    style={},
  ) {
    let np = window.pyodide.pyimport("numpy");
    let vertices = [];
    let angle;
    for (let i = 0; i < numSides; i++) {
      angle = 2*np.pi * i/numSides;
      if (numSides % 2 == 0) {
        angle -= np.pi / numSides;
      }
      vertices.push([np.sin(angle), np.cos(angle)]);
    }
    let halfway = Math.trunc(numSides / 2);
    let oldHeight = np.abs(vertices[0][1] - vertices[halfway][1]);
    vertices.forEach(function(vertex) {
      vertex[0] *= height/oldHeight;
      vertex[1] *= height/oldHeight;
    });
    super(vertices, style);
  }
}

class Triangle extends RegularPolygon {
  constructor(
    height=2,
    style={strokeColor: consts.GREEN}) {
    super(3, height, style);
  }
}

class Pentagon extends RegularPolygon {
  constructor(
    height=2,
    style={strokeColor: consts.GREEN}) {
    super(5, height, style);
  }
}

class Hexagon extends RegularPolygon {
  constructor(
    style={strokeColor: consts.GREEN}) {
    super(6, height, style);
  }
}

class Octagon extends RegularPolygon {
  constructor(
    height=2,
    style={strokeColor: consts.GREEN}) {
    super(8, height, style);
  }
}

class Rectangle extends Polygon {
  constructor(
    width=4.0,
    height=2.0,
    style={strokeColor: consts.WHITE}
  ) {
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    super(
      [[-halfWidth,  halfHeight],
       [ halfWidth,  halfHeight],
       [ halfWidth, -halfHeight],
       [-halfWidth, -halfHeight]],
      style,
    );

    this.width=width;
    this.height=height;
  }
}

class Square extends RegularPolygon {
  constructor(
    height=2,
    style={strokeColor: consts.GREEN}) {
    super(4, height, style);
  }
}

export {
  Group,
  Mobject,
  Arc,
  Circle,
  Polygon,
  RegularPolygon,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Rectangle,
  Square,
  Animation,
  Transform,
  Wait,
  Scene,
};
