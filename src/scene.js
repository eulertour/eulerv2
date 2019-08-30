import * as Two from '../node_modules/two.js/build/two.js';
import * as consts from './constants.js';

class Scene extends Two {
  constructor(conf) {
    super(conf);
    this.lastStoppingFrame = 0;
    this.lastFrame = 0;
    this.bind('update', (frameCount) => {
      this.lastFrame = frameCount; 
    });
  }

  beginAnimation(animation) {
    this.add(animation.mobject);
    this.lastStoppingFrame = this.lastFrame;
    animation.begin();
  }

  finishAnimation(animation) {
    animation.finish();
  }

  playAnimation(animation) {
    this.beginAnimation(animation);

    this.update();
    let wrapper = function(frameCount) {
      animation.interpolate((frameCount - this.lastStoppingFrame) / 60);
      if (animation.isFinished((frameCount - this.lastStoppingFrame) / 60)) {
        this.unbind('update', wrapper);
        this.pause();
        this.lastStoppingFrame = frameCount;
        this.finishAnimation(animation);
        animation.cleanUpFromScene(this);
      }
    };

    this.bind('update', wrapper).play();
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
}

export { Scene }
