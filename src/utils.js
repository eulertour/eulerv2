import * as Two from 'two.js/build/two.js'
import * as _ from 'lodash'
import chroma from 'chroma-js'

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
    ret.push([curV.x, curV.y]);
    ret.push([curV.controls.right.x, curV.controls.right.y]);
    ret.push([nextV.controls.left.x, nextV.controls.left.y]);
    ret.push([nextV.x, nextV.y]);
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
      // Perform a depth-first traversal of the heirarchy, taking note of which
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
  // Convert all paths to Two.Path
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
