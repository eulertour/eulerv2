from manimlib.imports import *

class WhatCanDo(Scene):
    def construct(self):
        text = VGroup(
                TextMobject("What animations"),
                TextMobject("can we do?")
            )
        text.arrange(DOWN)\
                .scale(2.5)\
                .set_fill(opacity=0)

        screen = Rectangle(
                            width=FRAME_WIDTH,
                            height=FRAME_HEIGHT
                )
        for position,t in zip([LEFT,RIGHT],text):
            t_c = t.copy()
            t.next_to(screen,position,buff=0)
            t.set_y(t_c.get_y())

        def show_text(text_):
            t1,t2 = text_
            t1.set_x(0)
            t2.set_x(0)
            text_.set_fill(opacity=1)
            return text_

        def disappear_text(text_):
            for position,t in zip([RIGHT,LEFT],text_):
                t_c = t.copy()
                t.next_to(screen,position,buff=0)
                t.set_y(t_c.get_y())
                t.set_fill(opacity=0)
            return text_

        self.play(ApplyFunction(show_text,text))
        self.wait()
        self.play(ApplyFunction(disappear_text,text))
        self.wait()
