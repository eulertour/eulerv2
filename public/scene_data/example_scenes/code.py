from manimlib.imports import *

class SquareToCircle(Scene):
    def construct(self):
        circle = Circle()
        square = Square()
        square.flip(RIGHT)
        square.rotate(-3 * TAU / 8)
        circle.set_fill(PINK, opacity=0.5)

        self.play(ShowCreation(square))
        self.play(ReplacementTransform(square, circle))
        self.play(FadeOut(circle))


class WriteStuff(Scene):
    def construct(self):
        example_text = TextMobject(
            "This is some text",
            tex_to_color_map={"text": YELLOW}
        )
        example_tex = TexMobject(
            "\int_{-\infty}^\infty {e^{x^{-2}}}dx= {\sqrt{\pi}}",
            # "\sum_{k=1}^\infty {1 \over k^2} = {\pi^2 \over 6}",
        )
        group = VGroup(example_text, example_tex)
        group.arrange(DOWN)
        group.set_width(FRAME_WIDTH - 2 * LARGE_BUFF)

        self.play(Write(example_text))
        self.play(Write(example_tex))
        self.wait()


class GroupExample(Scene):
    def construct(self):
        c1 = Circle().shift(LEFT)
        s1 = Square().shift(RIGHT)
        g1 = Group(c1, s1)

        c2 = Circle().shift(RIGHT + 2 * DOWN)
        s2 = Square().shift(LEFT + 2 * DOWN)
        r2 = Rectangle(height=4, width=2) \
               .shift(2 * LEFT + 2 * DOWN)
        g2 = Group(r2, s2, c2)

        self.play(FadeIn(g1))
        self.play(ReplacementTransform(g1, g2))
        self.play(FadeOut(c2))
        self.wait()
