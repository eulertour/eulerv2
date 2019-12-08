import * as Two from 'two.js/build/two.js'
import * as consts from './constants.js'
import * as utils from './utils.js'

class Scene extends Two {
  constructor(conf) {
    super(conf);
    this.lastStoppingFrame = 0;
    this.wrapper = null;
    this.onAnimationFinished = null;
  }

  clearAnimation() {
    this.pause();
    this.unbind('update', this.wrapper);
  }

  beginAnimation(animation) {
    // If the Mobject isn't contained in the Scene, we have to add it here so
    // that it will be visible during the animation. In order to prevent
    // double-adding the Mobject when the diff is applied, we will remove it
    // upon finishing the animation.
    this.removeMobjectUponFinish = animation.mobject && !this.contains(animation.mobject);
    animation.begin();
    if (this.removeMobjectUponFinish) {
      this.add(animation.mobject);
    }
  }

  playAnimation(animation, onStep=null, onAnimationFinished=null) {
    this.beginAnimation(animation);
    this.update();
    this.onAnimationFinished = onAnimationFinished;
    this.lastStoppingFrame = this.frameCount;
    this.wrapper = function(frameCount) {
      animation.interpolate((frameCount - this.lastStoppingFrame) / 60);
      if (onStep !== null) {
        onStep((frameCount - this.lastStoppingFrame) / 60);
      }
      if (animation.isFinished((frameCount - this.lastStoppingFrame) / 60)) {
        if (this.removeMobjectUponFinish) {
          this.remove(animation.mobject);
        }
        this.clearAnimation();
        if (this.onAnimationFinished !== null) {
          this.onAnimationFinished(animation);
        }
      }
    };
    this.bind('update', this.wrapper).play();
  }

  contains(mobject) {
    let currentMobject = mobject;
    while (currentMobject.parent !== undefined) {
      currentMobject = currentMobject.parent;
    }
    return currentMobject.hasOwnProperty("domElement");
  }

  normalizePoint(p) {
    let x = p[0] / this.width * consts.FRAME_WIDTH - consts.FRAME_WIDTH / 2;
    let y =  -(p[1] - this.height / 2) / this.height * consts.FRAME_HEIGHT;
    return [x, y];
  }

  normalizePixel(p) {
    let x = p[0] / consts.FRAME_WIDTH * this.width + this.width / 2;
    let y = this.height / 2 - p[1] / consts.FRAME_HEIGHT * this.height;
    return [x, y];
  }

  texToSvgGroup(texString) {
    let svgNode = window.MathJax.tex2svg(texString).children[0];
    let svgGroup = this.interpret.call(this, svgNode);
    this.remove(svgGroup);
    svgGroup = utils.convertSVGGroup(svgGroup);
    return svgGroup;
  }
}

export { Scene }
