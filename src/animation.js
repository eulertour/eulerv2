import * as utils from './utils.js';

class Animation {
  constructor(
    mobject,
    rateFunc=utils.smooth,
    /* suspendMobjectUpdating=true, */
  ) {
    this.mobject = mobject;
    this.rateFunc = rateFunc;
  }

  /* This is called right as an animation is being
   * played.  As much initialization as possible,
   * especially any mobject copying, should live in
   * this method.
   */
  begin() {
    this.startingMobject = this.createStartingMobject();
    if (this.suspendMobjectUpdating) {
      // All calls to self.mobject's internal updaters
      // during the animation, either from this Animation
      // or from the surrounding scene, should do nothing.
      // It is, however, okay and desirable to call
      // the internal updaters of self.starting_mobject,
      // or any others among self.get_all_mobjects()
      this.mobject.suspendUpdating();
    }
    this.interpolate(0);
  }

  /* On each frame of the Animation, each Mobject in the top-level Mobject's
   * heirarchy will be passed to interpolateSubmobject. Depending on the
   * Animation, the Mobjects may be passed together with some other Mobjects
   * which will serve to parameterize the interpolation. For each parameterizing
   * Mobject, the Animation must provide a "copy" Mobject with whose heirarchy
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
     * heirarchy which contains a top-level path (i.e. those that don't function
     * only as Groups).
     */
    let interpolateSubmobjectArgs = this.getAllArgsToInterpolateSubmobject();
    for (let args of interpolateSubmobjectArgs) {
      this.interpolateSubmobject(alpha, ...args);
    }
  }

  /* For each Mobject which is in the heirarchy of the one being animated and
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
    let mobjectHeirarchies = [];
    for (let mobjectCopy of this.getCopiesForInterpolation()) {
      let heirarchy = mobjectCopy.getMobjectHeirarchy();
      let heirarchyMembersWithPoints = heirarchy.filter(
        submob => submob.points().length > 0
      );
      mobjectHeirarchies.push(heirarchyMembersWithPoints);
    }
    let argsList = [];
    for (let i = 0; i < mobjectHeirarchies[0].length; i++) {
      argsList.push(mobjectHeirarchies.map(h => h[i]));
    }
    return argsList;
  }

  isFinished(alpha) {
    return alpha >= 1;
  }

  createStartingMobject() {
    return this.mobject.clone();
  }
}

class ReplacementTransform extends Animation {
  constructor(mobject, targetMobject) {
    super(mobject);
    this.targetMobject = targetMobject;
  }

  begin() {
    // Use a copy of targetMobject for the alignData
    // call so that the actual targetMobject is
    // preserved.
    this.targetCopy = this.targetMobject.clone()
    // Note, this potentially changes the structure
    // of both this.mobject and this.targetMobject
    this.mobject.alignData(this.targetCopy);
    Animation.prototype.begin.call(this)
  }

  getCopiesForInterpolation() {
    return [this.mobject, this.startingMobject, this.targetCopy];
  }

  interpolateSubmobject(alpha, submob, start, targetCopy) {
    submob.interpolate(start, targetCopy, alpha);
  }

  static getDiff(mobject, targetMobject) {
    return {
      'add': [targetMobject],
      'remove': [mobject],
    };
  }
}

class ShowCreation extends Animation {
  constructor(mobject) {
    super(mobject);
  }

  static getDiff(mobject) {
    return {
      'add': [mobject],
    };
  }
}

class FadeIn extends Animation {
  interpolateMobject(alpha) {
    this.mobject.opacity = alpha;
  }

  static getDiff(mobject) {
    return {
      'add': [mobject],
    };
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
}

class Wait extends Animation {
  interpolateMobject() {}

  static getDiff() {
    return {};
  }

  createStartingMobject() {}
}

export {
  Animation,
  Wait,
  ReplacementTransform,
  ShowCreation,
  FadeOut,
  FadeIn,
}
