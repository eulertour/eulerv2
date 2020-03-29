import * as utils from './utils.js';
import * as _ from 'lodash';

class Animation {
  constructor(
    mobject,
    config = {},
  ) {
    const fullConfig = Object.assign(Animation.defaultConfig(), config);
    Object.assign(this, fullConfig);
    this.mobject = mobject;
    this.startingMobject = null;
  }

  static defaultConfig() {
    return {
      rateFunc: utils.smooth,
      lagRatio: 0,
      runtime: 1,
    };
  }

  /* This is called right as an animation is being
   * played.  As much initialization as possible,
   * especially any mobject copying, should live in
   * this method.
   */
  begin() {
    if (this.mobject !== null) {
      // eslint-disable-next-line
      console.assert(
        this.startingMobject !== null,
        "Attempted to begin() an Animation with no startingMobject set",
      );
    }
    this.interpolate(0);
  }

  finish() {}

  setStartingMobject(mobject) {
    this.startingMobject = mobject;
  }

  /* On each frame of the Animation, each Mobject in the top-level Mobject's
   * hierarchy will be passed to interpolateSubmobject. Depending on the
   * Animation, the Mobjects may be passed together with some other Mobjects
   * which will serve to parameterize the interpolation. For each parameterizing
   * Mobject, the Animation must provide a "copy" Mobject with whose hierarchy
   * is one-to-one with that of its input Mobject. These copies will be
   * decomposed into the arguments to interpolateSubmobject.
   */
  getCopiesForInterpolation() {
    return [this.mobject];
  }

  interpolate(alpha) {
    if (alpha < 0) {
      alpha = 0;
    } else if (alpha > 1) {
      alpha = 1;
    }
    this.interpolateMobject(this.rateFunc(alpha));
  }

  interpolateMobject(alpha) {
    /* A list of arguments to interpolateSubmobject() for each Mobject in the
     * hierarchy which contains a top-level path (i.e. those that don't function
     * only as Groups).
     */
    let interpolateSubmobjectArgs = this.getAllArgsToInterpolateSubmobject();
    for (let i = 0; i < interpolateSubmobjectArgs.length; i++) {
      let subAlpha = this.getSubAlpha(alpha, i, interpolateSubmobjectArgs.length);
      this.interpolateSubmobject(subAlpha, ...interpolateSubmobjectArgs[i]);
    }
  }

  /* For each Mobject which is in the hierarchy of the one being animated and
   * has points, returns a list containing the Mobject along with any
   * parameterizing Mobjects necessary to interpolate it. Each of these lists
   * will have their Mobjects passed to interpolateSubmobject. For Transforms
   * this will be
   * [
   *   [submob1, starting_sumobject1, target_submobject1],
   *   [submob2, starting_sumobject2, target_submobject2],
   *   [submob3, starting_sumobject3, target_submobject3],
   * ]
   */
  getAllArgsToInterpolateSubmobject() {
    let mobjectHierarchies = [];
    for (let mobjectCopy of this.getCopiesForInterpolation()) {
      let hierarchy = mobjectCopy.getMobjectHierarchy();
      let hierarchyMembersWithPoints = hierarchy.filter(
        submob => submob.points().length > 0
      );
      mobjectHierarchies.push(hierarchyMembersWithPoints);
    }
    let argsList = [];
    for (let i = 0; i < mobjectHierarchies[0].length; i++) {
      argsList.push(mobjectHierarchies.map(h => h[i]));
    }
    return argsList;
  }

  /* In order to stagger the start times of animations for multiple Mobjects,
   * have the Mobject at index i begin its animation at a proportion
   * this.lagRatio * i * alpha from the start of the Animation.
   */
  getSubAlpha(alpha, index, numSubmobjects) {
    // eslint-disable-next-line
    console.assert(0 <= alpha && alpha <= 1);
    let fullRuntime = (numSubmobjects - 1) * this.lagRatio + 1;
    let fullRuntimeAlpha = fullRuntime * alpha;
    let startTime = this.lagRatio * index;
    let endTime = startTime + 1;
    if (fullRuntimeAlpha <= startTime) {
      return 0;
    } else if (endTime <= fullRuntimeAlpha) {
      return 1;
    } else {
      return fullRuntimeAlpha - startTime;
    }
  }

  isFinished(alpha) {
    return alpha >= 1;
  }

  mobjectNameFromArgs(args) {
    return args[0];
  }

  static interpolateSubmobject() {
    // eslint-disable-next-line
    console.error(`${this.name} does not override interpolateSubmobject()`);
  }

  static getDiff() {
    // eslint-disable-next-line
    console.error(`${this.name} does not override getDiff()`);
  }

  static getDescription() {
    // eslint-disable-next-line
    console.error(`${this.name} does not override getDescription()`);
  }
}

class ReplacementTransform extends Animation {
  constructor(mobject, config={}) {
    const fullConfig = Object.assign(ReplacementTransform.defaultConfig(), config);
    super(mobject, fullConfig);
  }

  static defaultConfig() {
    return { targetMobject: null }
  }

  begin() {
    // Use a copy of targetMobject for the alignData call so that the actual
    // targetMobject is preserved.
    this.targetCopy = this.targetMobject.clone();
    // Note, this potentially changes the structure
    // of both this.mobject and this.targetMobject
    this.mobject.alignData(this.targetCopy);
    this.startingMobject = this.mobject.clone();
    Animation.prototype.begin.call(this);
  }

  // The startingMobject may have had to be mutated in begin() in order to align
  // it with targetMobject.
  setStartingMobject(/*mobject*/) {}

  getCopiesForInterpolation() {
    return [this.mobject, this.startingMobject, this.targetCopy];
  }

  interpolateSubmobject(alpha, submob, start, targetCopy) {
    submob.interpolate(start, targetCopy, alpha);
  }

  static getDiff(startMobject, config, mobjectsInScene, /* mobjectData */) {
    let targetMobject = config.targetMobject;
    let ret = { mobjects: {}};
    if (mobjectsInScene.includes(startMobject)) {
      ret['mobjects'][startMobject] = {"added": [true, false]};
    }
    ret['mobjects'][targetMobject] = {"added": [false, true]};
    return ret;
  }

  static getDescription() {
    return "Morph one Mobject into another";
  }
}

class ShowCreation extends Animation {
  constructor(mobject, config={}) {
    const fullConfig = Object.assign(ShowCreation.defaultConfig(), config);
    super(mobject, fullConfig);
  }

  static defaultConfig() {
    return {
      lagRatio: 1,
    };
  }

  interpolateSubmobject(alpha, submob, startingSubmobject) {
    submob.pointwiseBecomePartial(startingSubmobject, 0, alpha);
  }

  getCopiesForInterpolation() {
    return [this.mobject, this.startingMobject];
  }

  static getDiff(mobject) {
    return {
      'add': [mobject],
    };
  }

  static getDescription() {
    return "Show a Mobject being created";
  }
}

class Write extends Animation {
  constructor(mobject, config={}) {
    let fullConfig = Object.assign(
      {},
      Write.defaultConfig(),
      config,
      { rateFunc: utils.linear }
    );
    Write.ensureLagRatioAndRuntime(
      fullConfig,
      mobject.getMobjectHierarchy().length,
    );
    super(mobject, fullConfig);
  }

  // These will be set in ensureLagRatioAndRuntime().
  static defaultConfig() {
    return {
      runtime: null,
      lagRatio: null,
      initialStrokeWidth: 5,
      slowWriteThreshold: 12,
    };
  }

  static ensureLagRatioAndRuntime(config, length) {
    if (config.runtime === null) {
      if (length < Write.defaultConfig.slowWriteThreshold) {
        config.runtime = 1;
      } else {
        config.runtime = 2;
      }
    }
    if (config.lagRatio === null) {
      config.lagRatio = Math.min(4 / length, 0.2);
    }
  }

  // TODO: Modify TexMobject / TextMobject to have consistent strokeWidth.
  begin() {
    this.mobject.applyStyle({
      strokeWidth: this.initialStrokeWidth,
      fillOpacity: 0,
    });
    Animation.prototype.begin.call(this);
    this.startingMobject.applyStyle({ fillOpacity: 0 });
  }

  finish() {
    this.startingMobject.applyStyle({ fillOpacity: 1 });
  }

  interpolateSubmobject(alpha, submob, startingSubmobject) {
    if (alpha <= 0.5) {
      submob.pointwiseBecomePartial(startingSubmobject, 0, 2 * alpha);
    } else {
      if(!_.last(submob.children[0].vertices).equals(_.last(startingSubmobject.children[0].vertices))) {
        submob.pointwiseBecomePartial(startingSubmobject, 0, 1);
      }
      let subAlpha = 2 * alpha - 1;
      submob.applyStyle({
        fillOpacity: subAlpha,
        strokeWidth: utils.interpolate(this.initialStrokeWidth, 1, subAlpha),
      });
    }
  }

  getCopiesForInterpolation() {
    return [this.mobject, this.startingMobject];
  }

  static getDiff(mobject) {
    return {
      'add': [mobject],
    };
  }

  static getDescription() {
    return "Write in LaTeX";
  }
}

// class ApplyPointwiseFunction extends Animation {
//   constructor(func, mobject) {
//     super(mobject);
//     this.func = func;
//   }
//
//   begin() {
//     console.log(this.mobject.path().vertices.slice(0, 4).map(v => [v.x, v.y]));
//     this.transformedMobject = this.mobject.clone();
//     console.log(this.mobject.path().vertices.slice(0, 4).map(v => [v.x, v.y]));
//     // this.transformedMobject.applyFunction(this.func);
//     // this.transformedMobject.path().vertices[0].x = 500;
//     console.log(this.mobject.path().vertices.slice(0, 4).map(v => [v.x, v.y]));
//     Animation.prototype.begin.call(this);
//   }
//
//   interpolateSubmobject(alpha, submob, transformed) {
//     submob.interpolate(submob, transformed, alpha);
//   }
//
//   getCopiesForInterpolation() {
//     return [this.mobject, this.transformedMobject];
//   }
//
//   static getDiff() {
//     // TODO: Add modify diff
//     return {};
//   }
// }

class FadeIn extends Animation {
  interpolateSubmobject(alpha, mob, startingMob) {
    let style1 = startingMob.getStyleDict();
    let style2 = Object.assign({}, style1);
    style1.strokeOpacity = 0;
    style1.fillOpacity = 0;
    mob.applyStyle(utils.interpolateStyles(style1, style2, alpha));
  }

  getCopiesForInterpolation() {
    return [this.mobject, this.startingMobject];
  }

  static getDiff(mobject) {
    return {
      'add': [mobject],
    };
  }

  static getDescription() {
    return "Fade a Mobject in";
  }
}

class FadeOut extends Animation {
  interpolateMobject(alpha) {
    this.mobject.opacity = 1 - alpha;
  }

  static getDiff(mobject, mobjectData) {
    let ret = {
      remove: [mobject],
      modify: [],
    };
    for (let mobjectName of Object.keys(mobjectData)) {
      let data = mobjectData[mobjectName];
      if (data.submobjects.includes(mobject)) {
        ret['modify'].push([
          mobjectName,
          "remove " + mobject,
          "add " + mobject,
        ]);
      }
    }
    return ret;
  }

  static getDescription() {
    return "Fade out a Mobject";
  }
}

class Wait extends Animation {
  constructor(config={}) {
    const fullConfig = Object.assign(Wait.defaultConfig(), config);
    super(null, fullConfig);
  }

  static defaultConfig() {
    return {
      duration: 1,
      stopCondition: undefined,
    };
  }

  mobjectNameFromArgs(/*args*/) {
    return null;
  }

  interpolateMobject() {}

  static getDiff() {
    return {};
  }

  static getDescription() {
    return "Hold a still frame";
  }
}

class ApplyFunction extends ReplacementTransform {
  constructor(func, mobject, config={}, diff) {
    const fullConfig = Object.assign(ApplyFunction.defaultConfig(), config);
    super(mobject, fullConfig);
    this.func = func;
    this.diff = diff;
  }

  begin() {
    this.targetMobject = this.mobject.clone();
    ReplacementTransform.prototype.begin.call(this);
    // Mock MobjectLabContainer.mobjects for the call to applyDiff().
    let mobjectHierarchy = this.targetCopy.getMobjectHierarchy();
    let mobjectDict = {};
    for (let mob of mobjectHierarchy) {
      if (mob.name !== undefined) {
        mobjectDict[mob.name] = { mobject: mob };
      }
    }
    utils.applyDiff(this.diff, /*reverse=*/false, mobjectDict, null);
  }

  mobjectNameFromArgs(args) {
    return args[1];
  }

  static defaultConfig() {
    return {};
  }

  static getDiff() {
    // eslint-disable-next-line
    console.error("The diff for ApplyFunction will have to be passed from python");
    return {};
  }

  static getDescription() {
    return "Transform a Mobject based on a function";
  }
}

// Any Animation exported here must also be exported in manim.js before it can
// be imported.
export {
  Animation,
  Wait,
  ReplacementTransform,
  ShowCreation,
  // ApplyPointwiseFunction,
  ApplyFunction,
  Write,
  FadeOut,
  FadeIn,
}
