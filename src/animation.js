import * as utils from './utils.js';
import * as _ from 'lodash';
import chroma from 'chroma-js';

class Animation {
  constructor(
    mobject,
    rateFunc=utils.smooth,
    removeWhenFinished=false,
    /* suspendMobjectUpdating=true, */
  ) {
    this.mobject = mobject;
    this.rateFunc = rateFunc;
    this.removeWhenFinished = removeWhenFinished;
  }

  begin() {
    // This is called right as an animation is being
    // played.  As much initialization as possible,
    // especially any mobject copying, should live in
    // this method
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

  getFamily() {
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
    // let families = this.getAllFamiliesZipped();
    // this.interpolateSubmobject
    // this.mobject.translateMobject([0.1, 0]);
    let family = this.getFamily();
    this.interpolateSubmobject(alpha, ...family);
  }

  // for each submobject in the animation, return a list
  // [submob, starting_sumobject, [target_submobject ...]]
  getAllFamiliesZipped() {
    let familiesList = [];
    let allMobjects = this.getAllMobjects();
    for (let i = 0; i < allMobjects.length; i++) {
      familiesList.push(allMobjects[i].familyMembersWithPoints());
    }
    /* zip familiesList and return it */
    // return zip(*[
    //     mob.family_members_with_points()
    //     for mob in self.get_all_mobjects()
    // ])
  }

  getAllMobjects() {
    // Ordering must match the ording of arguments to interpolateSubmobject
    return [this.mobject, this.startingMobject];
  }

  isFinished(alpha) {
    return alpha >= 1;
  }

  createStartingMobject() {
    return _.cloneDeep(this.mobject);
  }
}

class ReplacementTransform extends Animation {
  constructor(mobject, targetMobject) {
    super(mobject);
    this.targetMobject = targetMobject;
  }

  begin() {
    // Use a copy of target_mobject for the align_data
    // call so that the actual target_mobject stays
    // preserved.
    this.targetMobject = this.createTarget();
    this.targetCopy = _.cloneDeep(this.targetMobject);
    // Note, this potentially changes the structure
    // of both mobject and target_mobject

    // this should be printing 32 points (take out the last path)
    this.mobject.alignData(this.targetCopy);

    Animation.prototype.begin.call(this)
  }

  createTarget() {
    return this.targetMobject;
  }

  getFamily() {
    return [this.mobject, this.startingMobject, this.targetCopy];
  }

  interpolateSubmobject(alpha, submob, start, targetCopy) {
    submob.interpolate(start, targetCopy, alpha);
  }

  getDiff(mobject, targetMobject) {
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

  getDiff(mobject) {
    return {
      'add': [mobject],
    };
  }
}

class FadeIn extends Animation {
  begin() {
    // Since the mobject's opacity will change over the course of the animation,
    // we check the mobject's initial style so that we can determine the range
    // of interpolation later.
    let style = this.mobject.getStyleDict();
    this.finalStrokeOpacity = chroma(style['strokeColor']).alpha();
    this.finalFillOpacity = chroma(style['fillColor']).alpha();
  }

  interpolateSubmobject(alpha, submob) {
    let style = submob.getStyleDict();
    let strokeOpacity = alpha * this.finalStrokeOpacity;
    let fillOpacity = alpha * this.finalFillOpacity;
    style['strokeColor'] = chroma(style['strokeColor']).alpha(strokeOpacity).hex();
    style['fillColor'] = chroma(style['fillColor']).alpha(fillOpacity).hex();
    submob.applyStyle(style);
  }

  createStartingMobject() {
    let mob = Animation.prototype.createStartingMobject.call(this)
    let style = mob.getStyleDict();
    style['strokeOpacity'] = 0;
    style['fillOpacity'] = 0;
    return mob.applyStyle(style);
  }

  getDiff(mobject) {
    return {
      'add': [mobject],
    };
  }
}

class FadeOut extends Animation {
  begin() {
    // Since the mobject's opacity will change over the course of the animation,
    // we check the mobject's initial style so that we can determine the range
    // of interpolation later.
    let style = this.mobject.getStyleDict();
    this.initialStrokeOpacity = chroma(style['strokeColor']).alpha();
    this.initialFillOpacity = chroma(style['fillColor']).alpha();
  }


  interpolateSubmobject(alpha, submob) {
    let style = submob.getStyleDict();
    let strokeOpacity = (1 - alpha) * this.initialStrokeOpacity;
    let fillOpacity = (1 - alpha) * this.initialFillOpacity;
    style['strokeColor'] = chroma(style['strokeColor']).alpha(strokeOpacity).hex();
    style['fillColor'] = chroma(style['fillColor']).alpha(fillOpacity).hex();
    submob.applyStyle(style);
  }

  getDiff(mobject) {
    return {
      'remove': [mobject],
    };
  }
}

class Wait extends Animation {
  interpolateSubmobject() {
    // do nothing
  }

  getDiff() {
    return {};
  }
}

export {
  Animation,
  Wait,
  ReplacementTransform,
  ShowCreation,
  FadeOut,
  FadeIn,
}
