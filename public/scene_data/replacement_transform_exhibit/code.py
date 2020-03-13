from manimlib.imports import *

class ReplacementTransformExhibit(Scene):
    def construct(self):
        square = Square().shift(LEFT)
        circle = Circle().shift(RIGHT)
        self.play(ReplacementTransform(square, circle))
