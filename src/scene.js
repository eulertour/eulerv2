import * as Two from 'two.js/build/two.js'
import * as consts from './constants.js'
import * as utils from './utils.js'

class Scene extends Two {
  constructor(conf) {
    super(conf);
    this.lastStoppingFrame = 0;
    this.elapsedTime = 0;
    this.wrapper = null;
    this.onAnimationFinished = null;
    this.paused = null;
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
    this.elapsedTime = 0;
    this.paused = false;
    this.wrapper = function(frameCount, timeDelta) {
      if (this.paused) {
        // On the first call after being paused, timeDelta will typically be
        // much larger than it should be. Ignore this large timeDelta and it
        // will be fixed on the next call.
        this.elapsedTime += 0;
        this.paused = false;
      } else {
        this.elapsedTime += timeDelta;
      }
      let percentFinished = this.elapsedTime / (animation.runtime * 1000);
      animation.interpolate(percentFinished);
      if (onStep !== null) {
        onStep(percentFinished);
      }
      if (animation.isFinished(percentFinished)) {
        if (this.removeMobjectUponFinish) {
          this.remove(animation.mobject);
        }
        this.clearAnimation();
        animation.finish();
        if (this.onAnimationFinished !== null) {
          this.onAnimationFinished(animation);
        }
      }
    };
    this.bind('update', this.wrapper).play();
  }

  pause() {
    this.paused = true;
    Two.prototype.pause.call(this);
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
    let y = -(p[1] - this.height / 2) / this.height * consts.FRAME_HEIGHT;
    return [x, y];
  }

  normalizePixel(p) {
    let x = p[0] / consts.FRAME_WIDTH * this.width + this.width / 2;
    let y = this.height / 2 - p[1] / consts.FRAME_HEIGHT * this.height;
    return [x, y];
  }

  texToSvgGroup(texString) {
    let svgNode = window.MathJax.tex2svg(texString).children[0];
    let svgGroup = this.interpret(svgNode);
    this.remove(svgGroup);
    return utils.convertSVGGroup(svgGroup);
  }
}

export { Scene }
