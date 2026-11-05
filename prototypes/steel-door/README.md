# Steel door prototype (parked)

Standalone test of the next direction. It is not part of the live page and is not served by the site.

The door is the page: a long dark steel bulkhead with a seam down it. Scrolling travels down the door, a clamp lever releases and reveals Projects, then a brass wheel spins, draws two bars back, and the door swings open on warm light beside Contact. Everything reverses on scroll back.

## Run it

From the repo root, after `npm install`:

    python3 -m http.server 3200

Then open http://localhost:3200/prototypes/steel-door/steel.html

## Rebuild the model

    blender --background --python prototypes/steel-door/build_steel.py -- blender/build_door.py prototypes/steel-door/steel.glb

`build_steel.py` borrows its shape helpers from `blender/build_door.py`.

## Where it was left

- Lag: improved but still not fully smooth (under 55 fps reported). Next ideas are painted-on shadows instead of real-time ones, and checking whether stepped scroll wheels are part of it.
- The opening is the weakest part: the light is a flat strip with hard edges and the swung door goes nearly black.
- The lever looks too clean next to the wheel.
- Only two of the five locks exist. Planned order: clamp lever, bar bolt, chain, padlocked hasp, wheel.
- Contact has links only, no form yet. No nav, reduced-motion or no-3D versions yet.
