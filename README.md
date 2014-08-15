what is jsBoing?
----------------
jsBoing is an attempt to re-create, in the browser, the famous Boing! demo for the original Amiga 1000.

What does it require?
---------------------
Currently, support for Canvas and requestAnimationFrame should be all that this needs to run. It also requires Rhino and YUI Compressor to build.

What's different from Boing?
----------------------------
Some differences are obvious. jsBoing is written in JavaScript instead of 680x0 assembly language. We render using an HTML5 canvas instead of Intuition (the Amiga's graphics library). Our rendering and physics are driven by callbacks to requestAnimationFrame (or an oversimplified polyfill) instead of a loop. We render in full 32-bit color, instead of the Amiga's 4-bit, because the HTML5 canvas will not let us change the bit depth. These are basic, boring logistical matters, but they're differences. Of more interest are the cheats.

When feasible, we use the same kinds of cheats that Boing! did. But because the Amiga's hardware is so different from what's provided in a modern JavaScript environment, not all of those cheats make sense. We still try to hold to the spirit of the Boing! demo, however, in picking analogous ways to cheat.

To someone versed in how early video game graphics work, it might seem as though Boing! renders the ball as a sprite and the grid as the background, but it's actually the opposite: the ball is the background, and the grid is made with sprites. In fact, the ball is a single static image, using a carefully-chosen set of colors and an animated palette to achieve the illusion of a spinning ball. The background is then scrolled to move the ball, while the sprites are held in place.

JavaScript's canvas doesn't understand concepts like sprites, backgrounds, and color palettes, so it doesn't make as much sense for jsBoing to work quite this way. Our method more closely matches what an old-school gamer might expect: the ball and its shadow are both sprites, while the grid is a static background. Both the ball and shadow are created as a set of eight images, since color cycling is not as feasible a trick on the JavaScript canvas ([it has been implemented][Huckaby], but it is complex and costly).

Despite the differences in the real-time system, we do still attempt to mirror Boing! when feasible. The graphics are drawn programmatically as the demonstration begins, just like Boing!'s (even though we have more pictures to render). We still fundamentally move 2-D sprites in a plane, even though the result is designed to look like 3-D. We even still draw the shadow before the grid, rather than the other way around: it looks like the shadow is transparent and the grid is opaque, but it's actually the opposite.

We also allow you to "pull back the curtain" in certain ways, to better understand how the cheats work.

What's the same as Boing?
-------------------------
Although we do have to depart from Boing! in a number of ways, we try to stay similar where feasible (and sensible).
- The system is fundamentally 2-D, using pre-rendered sprites that make it look like 3-D.
- All graphics are rendered programmatically at boot time: there are no additional images to download.
- We do not make use of transparency, other the simple binary/opaque sort of transparency that the Amiga used.
- Physics, like rendering, is locked to the frame rate: slow the rendering, slow the animation.

Why do this?
------------
Mostly because I wanted to learn more about graphics, physics, and demos. It's been a blast.

Issues
------
None known at this time.

License
-------
This code is dedicated to the public domain wherever feasible, under the [Creative Commons Zero 1.0 Universal Public Domain Dedication][CC0].

Acknowledgments
---------------
Very special thinks to [Robert J. Mical][Mical] and Dale Luck, for the original Boing! demo.

Thanks to Jimmy Maher for [his re-creation of Boing! in C][Maher]. I didn't wind up using any significant code, but it was invaluable in figuring out some of the fiddly particulars.

Thanks to Jim Brooks for [the Boing xscreensaver demo][Brooks], and to "Cuthbert" from Khan Academy for [his Processing.js adaptation][Cuthbert]. Again, I wound up not really reusing much, but their code was still valuable for researching certain effects.

Thanks to Michael J. Norton, for [his article on simple software 3D rendering pipelines][Norton]. My final code wound up not looking so much like it (even if you discount the differences between Tcl and JavaScript), but much of the early code did. These were the first seeds that made this possible.

[Brooks]: <http://www.jimbrooks.org/programming/opengl/boing/> "OpenGL Amiga Boing"
[CC0]: <https://creativecommons.org/publicdomain/zero/1.0/> "Creative Commons Zero 1.0 Universal"
[Cuthbert]: <https://www.khanacademy.org/cs/amiga-ball/6260170543857664> "Amiga Ball"
[Huckaby]: <http://www.effectgames.com/effect/article.psp.html/joe/Old_School_Color_Cycling_with_HTML5> "Old School Color Cycling with HTML5"
[Maher]: <http://amiga.filfire.net/?page_id=5> "The Future Was Here, Chapter 2"
[Mical]: <http://mical.org> "RJ Mical Page"
[Norton]: <http://www.macdevcenter.com/pub/a/mac/2005/08/12/tcl.html> "Build a Simple 3D Pipeline in Tcl"
