from manimlib.imports import *

class TextExhibit(Scene):
    def construct(self):
        tex = TextMobject(
            "Think deeply of simple things."
        )
        self.add(tex)
        self.wait()
