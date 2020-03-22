import * as Two from 'two.js/build/two.js'
import * as _ from 'lodash'
import chroma from 'chroma-js'
import * as math from 'mathjs'
import * as consts from './constants.js'

export function pathFromAnchors(anchors, leftHandles, rightHandles, commands=null) {
  // eslint-disable-next-line
  console.assert(anchors.length === leftHandles.length);
  // eslint-disable-next-line
  console.assert(leftHandles.length === rightHandles.length);
  if (commands !== null) {
    // eslint-disable-next-line
    console.assert(rightHandles.length === commands.length);
  }
  let vertices = [];
  for (let i = 0; i < anchors.length; i++) {
    vertices.push(new Two.Anchor(
      anchors[i][0],
      anchors[i][1],
      leftHandles[i][0],
      leftHandles[i][1],
      rightHandles[i][0],
      rightHandles[i][1],
      commands !== null ? commands[i] : 'C',
    ));
  }
  vertices.forEach(v => v.relative = false);
  let path = new Two.Path(
    vertices,
    /*closed=*/false,
    /*curved=*/true,
    /*manual=*/true,
  );
  path.cap = 'square';
  return path;
}

/* Returns a path composed of straight lines through points. */
export function pathFromPoints(points) {
  let np = window.pyodide.pyimport("numpy");
  let interpolation = [];
  for (let a of np.linspace(0, 1, 4)) {
    interpolation.push(interpolateMatrices(
      points,
      points.slice(1).concat([points[0]]),
      a,
    ));
  }

  let args = [];
  args.push(interpolation[0]);
  args.push([interpolation[2][points.length - 1]].concat(interpolation[2].slice(0, -1)));
  args.push(interpolation[1]);
  // close the polygon
  args.forEach(arg => arg.push(arg[0]));
  return pathFromAnchors(args[0], args[1], args[2]);
}

export function scalePath(factor, path) {
  for (let v of path.vertices) {
    v.multiplyScalar(factor);
    v.controls.left.multiplyScalar(factor);
    v.controls.right.multiplyScalar(factor);
  }
}

export function translatePath(vector, path) {
  let vec = new Two.Vector(vector[0], vector[1]);
  if (path.vertices)
    for (let v of path.vertices) {
      v.addSelf(vec);
      v.controls.left.addSelf(vec);
      v.controls.right.addSelf(vec);
    }
}

export function interpolate(start, end, alpha) {
  return (1 - alpha) * start + alpha * end;
}

export function interpolateArrays(arr1, arr2, alpha) {
  let ret = [];
  for (let i = 0; i < arr1.length; i++) {
    ret.push((1 - alpha) * arr1[i] + alpha * arr2[i]);
  }
  return ret;
}

export function interpolateMatrices(m1, m2, alpha) {
  let ret = [];
  for (let i = 0; i < m1.length; i++) {
    ret.push(interpolateArrays(m1[i], m2[i], alpha));
  }
  return ret;
}

export function interpolateStyles(style1, style2, alpha) {
  return {
    strokeColor : chroma.scale([style1.strokeColor, style2.strokeColor])(alpha),
    strokeOpacity : interpolate(style1.strokeOpacity, style2.strokeOpacity, alpha),
    fillColor : chroma.scale([style1.fillColor, style2.fillColor])(alpha),
    fillOpacity : interpolate(style1.fillOpacity, style2.fillOpacity, alpha),
    strokeWidth : interpolate(style1.strokeWidth, style2.strokeWidth, alpha),
  }
}

/* Returns a list of points of the form: [
 *   anchor1,
 *   rightControl1,
 *   leftControl2,
 *   anchor2,
 *   anchor2,
 *   rightControl2,
 *   leftControl3,
 *   ...
 * ]
 */
export function getManimPoints(mobject) {
  let ret = [];
  let length = mobject.children[0].vertices.length;
  for (let i = 0; i < length - 1; i++) {
    let curV = mobject.children[0].vertices[i];
    let nextV = mobject.children[0].vertices[i + 1];
    ret.push([curV.x, curV.y, 0]);
    ret.push([curV.controls.right.x, curV.controls.right.y, 0]);
    ret.push([nextV.controls.left.x, nextV.controls.left.y, 0]);
    ret.push([nextV.x, nextV.y, 0]);
  }
  return ret;
}

/* Returns a Path from a list of points of the form: [
 *   anchor1,
 *   rightControl1,
 *   leftControl2,
 *   anchor2,
 *   anchor2,
 *   rightControl2,
 *   leftControl3,
 *   ...
 * ]
 */
export function pathFromManimPoints(points, commands=null) {
  if (commands !== null) {
    // eslint-disable-next-line
    console.assert(commands.length === points.length / 4 + 1)
  }
  if (points.length === 0) {
    return new Two.Path();
  }
  // eslint-disable-next-line
  console.assert(points.length % 4 === 0);
  let leftControls = [points[0]];
  let anchors = [];
  let rightControls = [];
  for (let i = 0; i < points.length; i += 4) {
    anchors.push(points[i]);
    rightControls.push(points[i + 1]);
    leftControls.push(points[i + 2]);
  }
  anchors.push(points[points.length - 1]);
  rightControls.push(points[points.length - 1]);
  return pathFromAnchors(anchors, leftControls, rightControls, commands);
}

export function isGroupData(mobjectData) {
  return ["Group", "Mobject", "VGroup"].includes(mobjectData.className);
}

export function isTexData(mobjectData) {
  return ["TexSymbol", "SingleStringTexMobject", "TexMobject", "TextMobject"].includes(mobjectData.className);
}

let CHOOSE_CACHE = [[1]];

export function choose(n, k) {
  if (CHOOSE_CACHE.length > n && CHOOSE_CACHE[n].length > k) {
    return CHOOSE_CACHE[n][k];
  }

  // find the first incomplete row
  let i;
  for (i = 0; i < Math.min(CHOOSE_CACHE.length, n + 1); i++) {
    if (CHOOSE_CACHE[i].length < Math.min(k + 1, i + 1)) {
      break;
    }
  }

  for (; i < n + 1; i++) {
    if (i === CHOOSE_CACHE.length) {
      CHOOSE_CACHE.push([1]);
    }
    // complete the row
    let j;
    for (j = CHOOSE_CACHE[i].length; j < Math.min(k + 1, i + 1); j++) {
      CHOOSE_CACHE[i].push(
        (CHOOSE_CACHE[i - 1][j - 1] !== undefined ? CHOOSE_CACHE[i - 1][j - 1] : 0) +
        (CHOOSE_CACHE[i - 1][j] !== undefined ? CHOOSE_CACHE[i - 1][j] : 0)
      );
    }
  }
  return CHOOSE_CACHE[n][k];
}

export function bezier(points) {
  let n = points.length - 1;
  let f = function (t) {
    let ret = [0, 0, 0];
    for (let k = 0; k < points.length; k++) {
      let point = points[k];
      ret[0] += ((1 - t) ** (n - k)) * (t ** k) * choose(n, k) * point[0]
      ret[1] += ((1 - t) ** (n - k)) * (t ** k) * choose(n, k) * point[1]
    }
    return ret;
  };
  return f;
}

export function partialBezierPoints(curveStart, curveEnd, alpha1, alpha2) {
  let points = [
    [curveStart.x, curveStart.y],
    [curveStart.controls.right.x, curveStart.controls.right.y],
    [curveEnd.controls.left.x, curveEnd.controls.left.y],
    [curveEnd.x, curveEnd.y],
  ];

  if (alpha1 === 1) {
    let ret = [];
    for (let i = 0; i < 4; i++) {
      ret.push(points[points.length - 1]);
    }
    return ret;
  }

  let aTo1 = [];
  for (let i = 0; i < points.length; i++) {
    aTo1.push(bezier(points.slice(i))(alpha1));
  }
  let endProp = (alpha2 - alpha1) / (1 - alpha1);
  let ret = [];
  for (let i = 0; i < points.length; i++) {
    ret.push(bezier(aTo1.slice(0, i + 1))(endProp));
  }
  return ret;
}

export function sigmoid(x) {
  let np = window.pyodide.pyimport("numpy");
  return 1.0 / (1 + np.exp(-x));
}

export function smooth(t, inflection = 10) {
  let np = window.pyodide.pyimport("numpy");
  let error = sigmoid(-inflection / 2);
  return np.clip(
    (sigmoid(inflection * (t - 0.5)) - error) / (1 - 2 * error),
    0,
    1,
  );
}

export function linear(t) {
  return t;
}

export function removeListRedundancies(l) {
  return l;
}

export function getFullDiff(diff) {
  return {
    add: diff["add"] || [],
    remove: diff["remove"] || [],
    modify: diff["modify"] || [],
  };
}

export function getReversedDiff(diff) {
  return {
    add: diff["remove"] || [],
    remove: diff["add"] || [],
    modify: (diff["modify"] || []).map(list => [list[0], list[2], list[1]]),
  };
}

export function getMobjectsRemovedFromParent(diff) {
  let ret = [];
  for (let arr of diff["modify"]) {
    let [command, arg] = arr[1].split(" ");
    if (command === "remove") {
      ret.push(arg);
    }
  }
  return ret;
}

export function getMobjectsAddedToParent(diff) {
  let ret = [];
  for (let arr of diff["modify"]) {
    let [command, arg] = arr[1].split(" ");
    if (command === "add") {
      ret.push(arg);
    }
  }
  return ret;
}

export function applyModification(mobjectData, modificationString) {
  // Commands have the form "add mobject1", "move mobject2 x y", etc.
  let [command, arg] = modificationString.split(" ");
  switch (command) {
    case "add":
      mobjectData.submobjects.push(arg);
      break;
    case "remove":
      _.remove(mobjectData.submobjects, name => name === arg);
      break;
    default:
      // eslint-disable-next-line
      console.error("Invalid modification command", modificationString);
  }
}

// function getModification(beforeNode, afterNode) {
//   let mobsToAdd = _.difference(afterNode.submobjects, beforeNode.submobjects);
//   let mobsToRemove = _.difference(beforeNode.submobjects, afterNode.submobjects);
//   if (mobsToAdd.length > 0) {
//     return ["add", mobsToAdd];
//   }
//   if (mobsToRemove.length > 0) {
//     return ["remove", mobsToRemove];
//   }
//   return [];
// }

export function getDiffFromTwoScenes(beforeScene, afterScene) {
  let beforeNames = beforeScene.map(node => node.name);
  let afterNames = afterScene.map(node => node.name);
  let mobsToAdd = _.difference(afterNames, beforeNames);
  let mobsToRemove = _.difference(beforeNames, afterNames);

  let modifications = [];
  // for (let node1 of beforeScene) {
  //   for (let node2 of afterScene) {
  //     if (node1.name === node2.name) {
  //       let modification = getModification(node1, node2);
  //       if (modification.length !== 0) {
  //         modifications.push(modification);
  //       }
  //     }
  //   }
  // }

  let diff = {
    add: mobsToAdd,
    remove: mobsToRemove,
    modify: modifications,
  };
  return diff;
}

function nodeFromName(name, nodeDict) {
  let ret = {
    name: name,
    submobjects: nodeDict[name].submobjects.map(name => nodeFromName(name, nodeDict)),
  };
  return ret;
}

export function updateSceneWithDiff(scene, diff, nodeDict) {
  if ("remove" in diff && diff["remove"].length > 0) {
    scene = scene.filter(node => !diff["remove"].includes(node.name));
    for (let root of scene) {
      // Perform a depth-first traversal of the hierarchy, taking note of which
      // nodes should be kept.
      let parentMap = {};
      let stack = [root];
      while (stack.length > 0) {
        let node = stack.pop();
        if (diff["remove"].includes(node.name)) {
          let parentNode = parentMap[node];
          _.remove(
            parentNode.submobjects,
            n => n.name === node.name,
          );
          _.remove(
            nodeDict[parentNode.name].submobjects,
            n => n.name === node.name,
          );
        } else {
          let children = node.submobjects;
          children.forEach(c => {parentMap[c] = node});
          stack = _.concat(stack, children);
        }
      }
    }
  }

  // the node dict only has names, not nodes
  let nodesToAdd = (diff["add"] || []).map(name => nodeFromName(name, nodeDict));
  scene = _.concat(scene, nodesToAdd);
  return scene;
}

export function extractPathsFromGroup(group) {
  let ret = [];
  if (group instanceof Two.Group) {
    group.children.forEach(child =>
      ret.push(...extractPathsFromGroup(child))
    );
  } else {
    ret.push(group);
  }
  return ret;
}

export function logPoints(path) {
  // eslint-disable-next-line
  console.assert(!path.automatic, path);
  let ret = [];
  for (let v of path.vertices) {
    ret.push({
      point: [v.x, v.y],
      left: [v.controls.left.x, v.controls.left.y],
      right: [v.controls.right.x, v.controls.right.y],
      command: v.command,
    });
  }
  return ret;
}

export function logMatrixMappedPoints(path) {
  let points = logPoints(path);
  let matrix = Two.Utils.getComputedMatrix(path);
  for (let obj of points) {
    for (let attr of ['point', 'left', 'right']) {
      let mappedObj = matrix.multiply(obj[attr][0], obj[attr][1], 1);
      obj[attr] = [mappedObj.x, mappedObj.y];
    }
  }
  return points;
}

export function deCasteljauReduction(points, alpha) {
  let ret = [];
  for (let i = 0; i < points.length - 1; i++) {
    ret.push(interpolateArrays(points[i], points[i + 1], alpha));
  }
  return ret;
}

/* Splits a bezier curve specified by its list of Bernstein coefficients, e.g.
 * for degree 3 [rightAnchor, rightControl, leftControl, leftAnchor]
 */
export function splitBezier(points, alpha, /* fromStart=true */) {
  let bernsteinCoefficients = [_.clone(points)];
  while (_.last(bernsteinCoefficients).length > 1) {
    bernsteinCoefficients.push(deCasteljauReduction(_.last(bernsteinCoefficients), alpha));
  }
  return bernsteinCoefficients.map(arr => _.first(arr));
}

export function convertSVGGroup(svgGroup) {
  // Convert all paths (e.g. Two.Rectangles) to Two.Path
  for (let path of extractPathsFromGroup(svgGroup)) {
    let parent = path.parent;
    let newPath = Two.Path.prototype.clone.call(path);
    parent.remove(path);
    parent.add(newPath);
  }

  // Convert anchors to absolute coordinates
  for (let path of extractPathsFromGroup(svgGroup)) {
    for (let v of path.vertices) {
      v.controls.left.add(v);
      v.controls.right.add(v);
      v.relative = false;
    }
  }

  // Convert all commands to C (and M)
  for (let path of extractPathsFromGroup(svgGroup)) {
    if (path.vertices.length === 0) {
      continue;
    }
    let lastMove;
    if (path.vertices[0].command === "M") {
      lastMove = path.vertices[0];
    }
    for (let i = 1; i < path.vertices.length; i++) {
      let previousVertex = path.vertices[i - 1];
      let currentVertex = path.vertices[i];
      if (currentVertex.command === "C") {
        continue;
      } else if (currentVertex.command === "L") {
        previousVertex.controls.right = previousVertex
          .clone()
          .lerp(currentVertex, 1 / 3);
        currentVertex.controls.left = previousVertex
          .clone()
          .lerp(currentVertex, 2 / 3);
        currentVertex.command = "C";
      } else if (currentVertex.command === "M") {
        lastMove = currentVertex;
      } else if (currentVertex.command === "Z") {
        currentVertex.copy(lastMove);
        previousVertex.controls.right = previousVertex
          .clone()
          .lerp(currentVertex, 1 / 3);
        currentVertex.controls.left = previousVertex
          .clone()
          .lerp(currentVertex, 2 / 3);
        currentVertex.command = "C";
      } else {
        // eslint-disable-next-line
        console.error(
          "Encountered an unknown SVG command",
          currentVertex.command
        );
      }
    }
  }
  return svgGroup;
}

export function integerInterpolate(start, end, alpha) {
  if (alpha >= 1) {
    return [end - 1, 1];
  } else if (alpha <= 0) {
    return [start, 0];
  } else {
    let interpolation = interpolate(start, end, alpha);
    return [Math.floor(interpolation), interpolation % 1];
  }
}

export function reflectionMatrixAcrossVector(vector) {
  if (vector[0] === 0 && vector[1] === 0) {
    // eslint-disable-next-line
    console.error(`Cannot reflect across ${vector}`);
  } else if (vector[0] === 0) {
    return math.matrix([[-1, 0], [0, 1]]);
  } else {
    let m = vector[1] / vector[0];
    return math.multiply(
      1 / (1 + m**2),
      math.matrix([
        [1-m**2, 2*m, 0],
        [2*m, m**2-1, 0],
        [0, 0, 1],
      ]),
    );
  }
}

export function rotationMatrixByAngle(angle) {
  return math.matrix([
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 1],
  ]);
}

export function getRotationMatrix(axis, angle) {
  let manimlib = window.pyodide.pyimport("manimlib");
  let matrix = manimlib.utils.space_ops.rotation_matrix(axis, angle)
    .map(arr => [].slice.call(arr));
  return math.matrix(matrix);
}

/* Returns a matrix for transforming points in two space to points in manim
 * space. Given tx ty in two space and matrix M returned from this function, the
 * corresponding point mx my in manim space is given by
 * M * [tx] = [mx]
 *     [ty]   [my]
 *     [ 1]
 */
export function getTwoToManimTransformationMatrix(
  manimWidth = consts.FRAME_WIDTH,
  manimHeight = consts.FRAME_HEIGHT,
  twoWidth = 640,
  twoHeight = 360,
) {
  return math.matrix([
    [manimWidth/twoWidth, 0, -manimWidth/2],
    [0, -manimHeight/twoHeight, manimHeight/2],
    [0, 0, 1],
  ]);
}

/* Returns a matrix for transforming points in manim space to points in two
 * space. Given mx my in manim space and matrix M returned from this function,
 * the corresponding point tx ty in manim space is given by
 * M * [mx] = [tx]
 *     [my]   [ty]
 *     [ 1]
 */
export function getManimToTwoTransformationMatrix({
  manimWidth = consts.FRAME_WIDTH,
  manimHeight = consts.FRAME_HEIGHT,
  twoWidth = 640,
  twoHeight = 360,
} = {}) {
  return math.matrix([
    [twoWidth/manimWidth, 0, twoWidth/2],
    [0, -twoHeight/manimHeight, twoHeight/2],
    [0, 0, 1],
  ]);
}

/* Converts a Two.Path with an arbitrary matrix hierarchy to an equivalent one
 * in Manim coordinates.
 */
export function normalizePath(path) {
  let anchors = [], leftHandles = [], rightHandles = [];
  let commands = path.vertices.map(v => v.command);
  let newAnchors, newLeftHandles, newRightHandles;
  let zippedAnchors;

  path.vertices.forEach(v => {
    anchors =      [...anchors,      [v.x, v.y]];
    leftHandles =  [...leftHandles,  [v.controls.left.x, v.controls.left.y]];
    rightHandles = [...rightHandles, [v.controls.right.x, v.controls.right.y]];
  });

  // Multiply each point by the matrix obtained from multiplying each matrix in
  // its hierarchy.
  const transformationMatrix = getCurrentTransformationMatrix(path);
  zippedAnchors = anchors.map((_, i) => [anchors[i], leftHandles[i], rightHandles[i]]);
  newAnchors = [], newLeftHandles = [], newRightHandles = [];
  zippedAnchors.forEach(v => {
    let [a, l, r] = v;
    let aManimObj = transformationMatrix.multiply(...a, 1);
    let lManimObj = transformationMatrix.multiply(...l, 1);
    let rManimObj = transformationMatrix.multiply(...r, 1);
    newAnchors =      [...newAnchors,      [aManimObj.x, aManimObj.y]];
    newLeftHandles =  [...newLeftHandles,  [lManimObj.x, lManimObj.y]];
    newRightHandles = [...newRightHandles, [rManimObj.x, rManimObj.y]];
  });
  anchors = newAnchors;
  leftHandles = newLeftHandles;
  rightHandles = newRightHandles;

  // Multiply each point by the Two->Manim matrix to convert each point to
  // manim coordinates. Then set the path's .matrix attribute to the Manim->Two
  // matrix to preserve their location in the Scene.
  let two2manim = getTwoToManimTransformationMatrix();
  zippedAnchors = anchors.map((_, i) => [anchors[i], leftHandles[i], rightHandles[i]]);
  let manimAnchors = [], manimLeftHandles = [], manimRightHandles = [];
  zippedAnchors.forEach(v => {
    let [a, l, r] = v;
    let aManim = math.multiply(two2manim, [...a, 1]).toArray().slice(0, 2);
    let lManim = math.multiply(two2manim, [...l, 1]).toArray().slice(0, 2);
    let rManim = math.multiply(two2manim, [...r, 1]).toArray().slice(0, 2);
    manimAnchors =      [...manimAnchors, aManim];
    manimLeftHandles =  [...manimLeftHandles, lManim];
    manimRightHandles = [...manimRightHandles, rManim];
  });
  let newPath = pathFromAnchors(manimAnchors, manimLeftHandles, manimRightHandles, commands);
  newPath.matrix.manual = true;
  let manim2two = getManimToTwoTransformationMatrix();
  newPath.matrix.set(...manim2two.toArray().flat());
  return newPath;
}

/* Converts a Two.Group with an arbitrary matrix hierarchy to an equivalent one
 * in Manim coordinates with two levels.
 */
export function normalizeGroup(group) {
  let normalizedPaths = extractPathsFromGroup(group)
    .map(path => normalizePath(path));
  let g = new Two.Group();
  g.add(normalizedPaths);
  return g;
}

function getTransformationMatrix(path) {
  let M = new Two.Matrix();
  if (path.translation !== undefined) {
    M.translate(path.translation.x, path.translation.y);
  }
  if (path.scale !== undefined) {
    if (path.scale instanceof Two.Vector) {
      M.scale(path.scale.x, path.scale.y);
    } else {
      M.scale(path.scale);
    }
  }
  return M;
}

function getCurrentTransformationMatrix(path) {
  let matrices = [getTransformationMatrix(path)];
  let currentPath = path;
  while (currentPath.hasOwnProperty("parent")) {
    currentPath = currentPath.parent;
    matrices.push(getTransformationMatrix(currentPath));
  }
  matrices.reverse();
  return matrices.reduce(
    (prev, cur) => prev.multiply(...cur.elements),
    new Two.Matrix(),
  );
}

// Ensures all style attributes are set.
// TODO: Can this be replaced with Object.assign()?
export function styleFromConfigAndDefaults(defaults, config = {}) {
  let combinedStyle = {};
  if ("strokeColor" in config || "strokeColor" in defaults) {
    combinedStyle.strokeColor = config.strokeColor || defaults.strokeColor;
  }
  if ("strokeOpacity" in config || "strokeOpacity" in defaults) {
    combinedStyle.strokeOpacity = config.strokeOpacity || defaults.strokeOpacity;
  }
  if ("strokeWidth" in config || "strokeWidth" in defaults) {
    combinedStyle.strokeWidth = config.strokeWidth || defaults.strokeWidth;
  }
  if ("fillColor" in config || "fillColor" in defaults) {
    combinedStyle.fillColor = config.fillColor || defaults.fillColor;
  }
  if ("fillOpacity" in config || "fillOpacity" in defaults) {
    combinedStyle.fillOpacity = config.fillOpacity || defaults.fillOpacity;
  }
  return combinedStyle;
}

function snakeToCamel(s) {
  return s.replace(/(_\w)/g, function(m){return m[1].toUpperCase();});
}

export function renameSnakeKeys(o) {
  let ret = {};
  for (let key of Object.keys(o)) {
    ret[snakeToCamel(key)] = o[key];
  }
  return ret;
}

function applyAddDiff(mobject, addDiff, reverse, scene) {
  let presentBefore, presentAfter;
  if (!reverse) {
    [presentBefore, presentAfter] = addDiff;
  } else {
    [presentAfter, presentBefore] = addDiff;
  }
  if (presentBefore && !presentAfter) {
    // eslint-disable-next-line
    console.assert(scene.contains(mobject));
    scene.remove(mobject);
  } else if (!presentBefore && presentAfter) {
    // eslint-disable-next-line
    console.assert(!scene.contains(mobject));
    scene.add(mobject);
  } else {
    // eslint-disable-next-line
    console.error(
      "Attempted to apply add diff with invalid parameters",
      mobject.name,
      presentBefore,
      presentAfter,
    );
  }
  scene.update();
}

function applyStyleDiff(mobject, styleDiff, reverse) {
  let style = {};
  for (let styleAttr of Object.keys(styleDiff)) {
    if (!reverse) {
      style[styleAttr] = styleDiff[styleAttr][1];
    } else {
      style[styleAttr] = styleDiff[styleAttr][0];
    }
    mobject.applyStyle(style);
  }
}

function applySubmobjectDiff(mobject, submobjectDiff, reverse, mobjectDict) {
  let startMobjects, endMobjects;
  if (!reverse) {
    startMobjects = submobjectDiff[0];
    endMobjects  = submobjectDiff[1];
  } else {
    startMobjects = submobjectDiff[1];
    endMobjects  = submobjectDiff[0];
  }
  let alignedEndMobjects = _.filter(endMobjects, mobjectName => {
      return mobjectName.includes(consts.ALIGNMENT_SUBMOBJECT_TAG);
  }).length !== 0;
  if (alignedEndMobjects) {
    // This is likely a ReplacementTransform that had to split the
    // submobjects. Ignore the change.
    // eslint-disable-next-line
    console.assert(!reverse);
    return;
  }
  let alignedStartMobjects = _.filter(startMobjects, mobjectName => {
      return mobjectName.includes(consts.ALIGNMENT_SUBMOBJECT_TAG);
  }).length !== 0;
  if (alignedStartMobjects) {
    // This change was ignored while going forward, so there's nothing to do
    // now (TODO: Do you also have to check for a copied mobject here?).
    // eslint-disable-next-line
    console.assert(reverse);
    return;
  }
  mobject.remove(mobject.submobjects());
  for (let mobjectName of endMobjects) {
    if (!(mobjectName in mobjectDict)) {
      // eslint-disable-next-line
      console.error(`Attempted to apply a submobject diff with unknown submobject ${mobjectName}`);
    }
    mobject.add(mobjectDict[mobjectName].mobject);
  }
}

export function applyDiff(diff, reverse, mobjectDict, scene) {
  if ('mobjects' in diff) {
    for (let mobjectName of Object.keys(diff.mobjects)) {
      let mobjectDiff = diff['mobjects'][mobjectName];
      let mobject = mobjectDict[mobjectName].mobject;
      for (let attr of Object.keys(mobjectDiff)) {
        switch(attr) {
          case "added":
            if (scene !== null) {
              applyAddDiff(mobject, mobjectDiff.added, reverse, scene);
            }
            break;
          case "style":
            applyStyleDiff(mobject, mobjectDiff.style, reverse);
            break;
          case "submobjects":
            applySubmobjectDiff(mobject, mobjectDiff.submobjects, reverse, mobjectDict);
            break;
          default:
            // eslint-disable-next-line
            console.error(`Ignoring unknown Mobject diff attribute ${attr}`);
        }
      }
    }
  }
  if ('transformations' in diff) {
    for (let i = 0; i < diff.transformations.length; i++) {
      let transformation;
      if (!reverse) {
        transformation = diff.transformations[i];
      } else {
        transformation = diff.transformations[diff.transformations.length - i - 1];
      }
      let mobjectName = transformation[1];
      let transformationType = transformation[2];
      let transformationArgs = transformation.slice(3);
      switch (transformationType) {
        case 'rotate':
          mobjectDict[mobjectName].mobject.handleRotate(...transformationArgs, reverse);
          break;
        case 'shift':
          mobjectDict[mobjectName].mobject.handleShift(...transformationArgs, reverse);
          break;
        case 'scale':
          mobjectDict[mobjectName].mobject.handleScale(...transformationArgs, reverse);
          break;
        default: {
          // eslint-disable-next-line
          console.error(`Ignoring unknown transformation ${transformationType}`);
        }
      }
    }
  }
  if (scene !== null) {
    scene.update();
  }
}
