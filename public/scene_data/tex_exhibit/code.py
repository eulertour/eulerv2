from manimlib.imports import *

class TexExhibit(Scene):
    def construct(self):
        tex = TexMobject("3^2=9")
        self.add(tex)
        self.wait()
