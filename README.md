<<<<<<< HEAD
What is jsBoing?
================
jsBoing is a clone of the famous "Boing!" demo, originally written for the Commodore Amiga.

What can it run on?
===================
The short version is that it should work on at least the following browsers:
- Firefox 23 or later
- Chrome 24 or later
- Internet Explorer 10 or later
- Safari 6.1 or later

At a minimum, jsBoing needs support for the W3C event model, the canvas tag, and requestAnimationFrame(). 

Why clone Boing?
================
Because I wanted to learn more about computer graphics and demos.

It also helped me gain appreciation for just how much modern operating systems and environments actually do for us. The original Boing!s source code clocked in at over 3000 lines of uncommented 68K assembler; we clock in at under 1000 lines of generously commented JavaScript. Even in terms of file size, our source code is only some 20% as large as Boing!'s, and when minified and gzipped, our code is actually smaller than the 68K machine code version.

I could not, of course, port the original Boing!'s source code, which was written in 68K assembler with the advantage of direct hardware access. Browser graphics work according to a fundamentally different model, and so my code ends up being drastically different from Boing!'s in a number of ways. But I did try to use corresponding algorithms and tricks, when it was feasible to do so, so you may still find it useful if you want to understand the way Boing! works. Just be aware that it does not come too close.

What's different from Boing?
============================
To the untrained eye, Boing! runs on a 7 MHz Motorola 68000 processor, handling realtime physics and 3D graphics while multitasking, all without skipping a beat. The naysayers came out in force: they said it was impossible for a machine like this to do the things it seemed to be doing. More than one person started looking around the original demo booth, trying to find the hidden VCR.

The VCR was never found, of course: Boing! really did run on that machine. But the naysayers were right in one important aspect: it was impossible. Boing! cheated shamelessly to achieve the effects that it did.

We strive to achieve the same spirit that Boing! did, and so, much like Boing!, we cheat. We do our best, in fact, to cheat in all the same places Boing! did. We do not, however, cheat in all the same *ways* that Boing! did, simply because some were of these ways were not feasible for a small JavaScript demo: the system abstracts out so much that it no longer makes sense to do the work to un-abstract it back.

Perhaps the way in which we're most like Boing! is that while we use proper 3D projection to determine the bounds of the "room", we only do it once: at startup, before the actual demo begins. The result, much like with Boing!, is that we incur a considerable startup delay, but take very little CPU time when the demo is actually running.

The way we are most unlike Boing! is in the way we render the ball itself. Boing! used a single image and careful color cycling to provide the illusion of motion. This isn't really feasible in JavaScript: color cycling *has* been implemented, but the Amiga did it in hardware, and JavaScript just doesn't. So instead, we draw eight frames of animation, and cycle through them. Note that we do still tie the ball's spinning to its position on the x-axis, just as Boing! did.

- Although we draw to the same resolution that Boing! did (320/200), we do not scale to the full screen size that Boing! did.
- The size of jsBoing's "world" is very slightly different: close to what Boing! used, but off by a pixel or two in order to make the dimensions into prime numbers. This drastically cuts the repetitiveness of the animation. The speed of jsBoing's ball is also very slightly different, for the same reason.
- The background/floor should look familiar -two sides of a cube, carved into a 15x15 grid- but we draw the entire floor grid (Boing! only draws part of it). This is done once, when the page loads.
- The original demo used only a single image for the ball, using color-cycling on its palette to provide the illusion of motion. This isn't impossible with the HTML5 Canvas, but the amount of code it takes makes it infeasible, so we take a different approach: 

Why JavaScript?
===============
Partly because I'm comfortable with it. Partly for the challenge: JavaScript engine performance has improved greatly over the past few years, but it is still not considered a high-performance environment, and I wanted to see if I could make a JavaScript version still run smoothly.

I had one other reason. It seems to me that JavaScript is becoming a sort of lingua franca of the coding world. By expressing the Boing! algorithms in it, I hoped to put them into a form that more people could understand.

It's also interesting as an illustrative difference of just how far computing has come, and what advantages the browser environment gives us. The original Boing! was written using just over 3000 lines of uncommented assembly language. Not counting HTML and CSS, jsBoing comes in at less than 1000 lines, and that's with significant commenting.

And yet, it's also interesting as a reminder of exactly what those luxuries cost us. Boing! is *still* smoother, even on a machine two orders of magnitude slower.

Why not WebGL?
==============
Because this was an attempt to stay fairly faithful to the spirit of the Boing! demo. WebGL would undoubtedly be faster, and also a more accurate recreation of what the scene suggested by Boing! might actually look like, and be considerably more flexible in what it can do. But that wasn't our goal, because among other things, it would involve playing fair.

That said, we *are* looking to do an OpenGL-based recreation as well. A WebGL recreation would be a complement to this, not a replacement for it. We are also looking to do an SVG-based version. These are, however, later projects.

How do you get this running so quickly?
=======================================
The same way Boing did: shameless, brazen cheating.

The biggest secret (which is also true of Boing!) is that this is not actually a 3-D system. It's a 2-D system that uses some pre-rendered sprites: we render them at boot time, yes, but they're not the realtime 3-D graphics that they might seem to be at first glance.

The secret to quick responsiveness is that we start the world before all of
our assets are in place. On the first 17 frames, we create the background grid and the ball sprites. Since we return to the event loop after each of these frames, the browser continues to respond.

Special Thanks To...
====================
- R.J. Mical and Dale Luck, for the original Boing! demo.
- Michael J. Norton, for his article "Build a Simple 3D Pipeline in Tcl", which provided some initial inspiration and help with equations.
- Jimmy Maher, author of *The Future Was Here*, a text that included a wealth of information on the Amiga and a re-creation of Boing! in C. The assembly-language source to the original Boing! can also be found at his Website.

=======
jsboing
=======

Yet another Boing! clone
>>>>>>> 51ffb8efaee64711086c36ab9d622ee4ec8b560d
