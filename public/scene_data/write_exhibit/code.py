from manimlib.imports import *

class WriteExhibit(Scene):
    def construct(self):
        text = TextMobject(
            "Philosophiae Naturalis Principia Mathematica"
        )
        self.play(Write(text))
