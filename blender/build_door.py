"""Builds the door and its five locks, then exports public/models/door.glb.

Run headless:  blender --background --python blender/build_door.py -- <out.glb> <out.blend> [preview.png]

Geometry is authored in the web scene's coordinates (x right, y up, z toward the
viewer, drawing units as in app/lockSpec.ts) and rotated into Blender's Z-up on
the way out, so the exported nodes land exactly where LockScene expects them.
Every moving part is its own object with its origin on its pivot.
"""
import math, random, sys
import bpy, bmesh
import numpy as np
from mathutils import Matrix, Vector, noise as mnoise

argv = sys.argv[sys.argv.index("--") + 1:]
OUT_GLB, OUT_BLEND = argv[0], argv[1]
OUT_PREVIEW = argv[2] if len(argv) > 2 else None

Y = {"L1": 16, "L2": 8, "L3": 0, "L4": -8, "L5": -16}   # lockSpec.ts
TOP, BOTTOM = 22, -22
FACE = 0.6                                               # the door's front plane
rng = random.Random(7)

bpy.ops.wm.read_factory_settings(use_empty=True)

# ── clay surface: a tileable normal map of thumb dents and fine grain ─────────
def noise(n, su, sv, seed):
    g = np.random.default_rng(seed).normal(size=(n, n))
    fu, fv = np.fft.fftfreq(n)[None, :], np.fft.fftfreq(n)[:, None]
    f = np.fft.ifft2(np.fft.fft2(g) * np.exp(-((fu * su) ** 2 + (fv * sv) ** 2))).real
    return (f - f.min()) / (f.max() - f.min())

N = 512
height = noise(N, 60, 60, 1) * 7.0 + noise(N, 14, 14, 2) * 0.8 + noise(N, 2.2, 2.2, 3) * 0.12
gy, gx = np.gradient(height)
nrm = np.stack([-gx * 12, -gy * 12, np.ones((N, N))], axis=2)
nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
px = np.concatenate([nrm * 0.5 + 0.5, np.ones((N, N, 1))], axis=2).astype(np.float32)
clay_img = bpy.data.images.new("clay_normal", N, N, alpha=False)
clay_img.colorspace_settings.name = "Non-Color"
clay_img.pixels.foreach_set(px.ravel())
clay_img.pack()

def material(name, color, rough=0.6):
    """Matte clay: no metal anywhere, the reading of brass and pewter is colour alone."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = 0.0
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = clay_img
    n = nt.nodes.new("ShaderNodeNormalMap"); n.inputs["Strength"].default_value = 0.14
    nt.links.new(t.outputs["Color"], n.inputs["Color"])
    nt.links.new(n.outputs["Normal"], p.inputs["Normal"])
    return m

MATS = [
    material("brass", (0.578, 0.328, 0.078), 0.46),   # #C89B4F
    material("pewter", (0.323, 0.366, 0.407)),        # #9AA3AB
    material("slate", (0.061, 0.087, 0.114)),         # #46535F door
    material("frame", (0.027, 0.038, 0.051)),         # #2E3740 jamb, lintel, sill, post
    material("dark", (0.007, 0.009, 0.012)),          # #14181C slots and recesses
    material("red", (0.644, 0.044, 0.027)),           # #D23B2E the seam
]
BRASS, STEEL, PAINT, TIMBER, DARK, RED = range(6)
UV_SCALE = {m: 9 for m in range(6)}

# ── mesh pieces ───────────────────────────────────────────────────────────────
def finish(bm, mat, along="x"):
    """Material, smooth flag and box-mapped UVs. `along` is the grain direction."""
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    uv = bm.loops.layers.uv.verify()
    s = UV_SCALE[mat]
    for f in bm.faces:
        f.material_index = mat
        f.smooth = True
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            c = l.vert.co
            a, b = {0: (c.z, c.y), 1: (c.x, c.z), 2: (c.x, c.y)}[ax]
            # streaks in the textures run along v, so the grain axis goes on v
            grain_first = (along == "x" and ax != 0) or (along == "y" and ax == 0)
            l[uv].uv = (b / s, a / s) if grain_first else (a / s, b / s)
    return bm

def box(w, h, d, x, y, z0, mat, r=0.18, seg=2, along="x"):
    """Rounded block centred at (x, y) with its back face at z0."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=(w, h, d), verts=bm.verts)
    r = min(r * 1.7, w * 0.49, h * 0.49, d * 0.49)
    seg = max(seg, 3)
    bmesh.ops.bevel(bm, geom=list(bm.verts) + list(bm.edges), offset=r, offset_type="OFFSET", segments=seg, profile=0.5, affect="EDGES", clamp_overlap=True)
    bmesh.ops.translate(bm, vec=(x, y, z0 + d / 2), verts=bm.verts)
    return finish(bm, mat, along)

AXIS = {"z": Matrix.Identity(3), "x": Matrix.Rotation(math.pi / 2, 3, "Y"), "y": Matrix.Rotation(-math.pi / 2, 3, "X")}

def lathe(profile, center, axis, mat, seg=32, closed=False, along="x"):
    """Spins (radius, height) points about an axis. Open profiles are capped."""
    bm = bmesh.new()
    rings = [[bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), h)) for i in range(seg)] for r, h in profile]
    n = len(rings)
    for k in range(n if closed else n - 1):
        a, b = rings[k], rings[(k + 1) % n]
        for i in range(seg):
            j = (i + 1) % seg
            bm.faces.new((a[i], a[j], b[j], b[i]))
    if not closed:
        bm.faces.new(rings[0]); bm.faces.new(rings[-1])
    bmesh.ops.transform(bm, matrix=AXIS[axis].to_4x4(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=center, verts=bm.verts)
    return finish(bm, mat, along)

def cyl(r, length, center, axis, mat, chamfer=0.06, seg=32, along="x"):
    c, h = min(chamfer, r * 0.4, length * 0.4), length / 2
    return lathe([(r - c, -h), (r, -h + c), (r, h - c), (r - c, h)], center, axis, mat, seg, along=along)

def sleeve(inner, outer, x0, x1, y, z, mat):
    """A hollow guide the barrel runs through."""
    c = 0.08
    return lathe([(inner, x0), (outer - c, x0), (outer, x0 + c), (outer, x1 - c), (outer - c, x1), (inner, x1)], (0, y, z), "x", mat, closed=True, seg=36)

def tube(points, r, mat, closed=False, seg=12, along="x"):
    """Sweeps a round wire along a polyline, keeping its frame from twisting."""
    pts = [Vector(p) for p in points]
    n = len(pts)
    tan = []
    for i in range(n):
        a = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
        b = pts[(i + 1) % n] if (closed or i < n - 1) else pts[i]
        tan.append((b - a).normalized())
    u = tan[0].orthogonal().normalized()
    bm = bmesh.new()
    rings = []
    for i in range(n):
        u = (u - tan[i] * u.dot(tan[i])).normalized()
        v = tan[i].cross(u)
        rings.append([bm.verts.new(pts[i] + (u * math.cos(2 * math.pi * k / seg) + v * math.sin(2 * math.pi * k / seg)) * r) for k in range(seg)])
    for i in range(n if closed else n - 1):
        a, b = rings[i], rings[(i + 1) % n]
        for k in range(seg):
            m = (k + 1) % seg
            bm.faces.new((a[k], a[m], b[m], b[k]))
    if not closed:
        bm.faces.new(rings[0]); bm.faces.new(rings[-1])
    return finish(bm, mat, along)

def arc(cx, cy, R, a0, a1, n, z=0.0):
    return [(cx + R * math.cos(a0 + (a1 - a0) * i / n), cy + R * math.sin(a0 + (a1 - a0) * i / n), z) for i in range(n + 1)]

def moulding(x0, y0, x1, y1, profile, mat, cap=True):
    """Sweeps (inset, z) points around a rectangle with mitred corners; caps the field."""
    bm = bmesh.new()
    rows = [[bm.verts.new((px, py, z)) for px, py in ((x0 + i, y0 + i), (x1 - i, y0 + i), (x1 - i, y1 - i), (x0 + i, y1 - i))] for i, z in profile]
    for a, b in zip(rows, rows[1:]):
        for k in range(4):
            m = (k + 1) % 4
            bm.faces.new((a[k], a[m], b[m], b[k]))
    if cap: bm.faces.new(rows[-1])
    finish(bm, mat)
    for f in bm.faces:
        if f.normal.z < 0: f.normal_flip()
    return bm

def screw(x, y, z):
    """A slotted countersunk head, each one turned to its own angle."""
    a = lathe([(0.34, 0), (0.34, 0.07), (0.27, 0.17), (0, 0.19)], (x, y, z), "z", STEEL, seg=18)
    slot = box(0.56, 0.09, 0.05, 0, 0, 0, DARK, r=0.01, seg=1)
    bmesh.ops.rotate(slot, cent=(0, 0, 0), matrix=Matrix.Rotation(rng.uniform(0, math.pi), 3, "Z"), verts=slot.verts)
    bmesh.ops.translate(slot, vec=(x, y, z + 0.155), verts=slot.verts)
    return [a, slot]

# ── parts: each exported node ─────────────────────────────────────────────────
TO_BLENDER = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
col = bpy.data.collections.new("door"); bpy.context.scene.collection.children.link(col)

def hand_shape(bm, amp, cell):
    """Breaks up the long edges, then pushes the surface in and out as fingers would."""
    for _ in range(5):
        long_edges = [e for e in bm.edges if e.calc_length() > cell]
        if not long_edges: break
        bmesh.ops.subdivide_edges(bm, edges=long_edges, cuts=1, use_grid_fill=True)
    bm.normal_update()
    for v in bm.verts:
        c = v.co
        n = mnoise.noise(c * 0.22) + 0.4 * mnoise.noise(c * 0.8 + Vector((7, 3, 1)))
        v.co = c + v.normal * n * amp

def part(name, pieces, pivot=(0, 0, 0), amp=0.02, cell=2.6):
    flat = []
    for p in pieces:
        flat.extend(p if isinstance(p, list) else [p])
    bm = bmesh.new()
    for p in flat:
        t = bpy.data.meshes.new("_t"); p.to_mesh(t); bm.from_mesh(t); bpy.data.meshes.remove(t); p.free()
    hand_shape(bm, amp, cell)
    pv = Vector(pivot)
    bmesh.ops.translate(bm, vec=-pv, verts=bm.verts)
    bmesh.ops.transform(bm, matrix=TO_BLENDER.to_4x4(), verts=bm.verts)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    for m in MATS: mesh.materials.append(m)
    mesh.shade_smooth()
    ob = bpy.data.objects.new(name, mesh)
    ob.location = TO_BLENDER @ pv
    col.objects.link(ob)
    return ob

def carve(target, cutter):
    """Exact boolean between two pieces, back to a bmesh."""
    def ob(bm, n):
        me = bpy.data.meshes.new(n); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(n, me); bpy.context.scene.collection.objects.link(o)
        return o
    a, c = ob(target, "_a"), ob(cutter, "_c")
    mod = a.modifiers.new("cut", "BOOLEAN"); mod.operation = "DIFFERENCE"; mod.solver = "EXACT"; mod.object = c
    dg = bpy.context.evaluated_depsgraph_get()
    out = bmesh.new(); out.from_object(a, dg)
    for o in (a, c):
        me = o.data; bpy.data.objects.remove(o); bpy.data.meshes.remove(me)
    return out

# ── the frame: boarded jamb, lintel, sill, hinge post ────────────────────────
jamb = [
    box(4.8, TOP - BOTTOM, 4, -11.6, 0, -4, TIMBER, 0.14, along="y"),
    box(4.6, TOP - BOTTOM, 4, -6.9, 0, -4, TIMBER, 0.14, along="y"),
    box(4.6, TOP - BOTTOM, 4, -2.3, 0, -4, TIMBER, 0.14, along="y"),
    box(48, 2.4, 4.6, 10, TOP + 1.2, -4, TIMBER, 0.2),
    box(48, 2.4, 4.6, 10, BOTTOM - 1.2, -4, TIMBER, 0.2),
    box(3.4, TOP - BOTTOM, 4, 32.3, 0, -4, TIMBER, 0.14, along="y"),
]
jamb.append(box(0.6, TOP - BOTTOM, 0.3, 0.3, 0, -0.1, RED, 0.08))   # the seam
for hy in (14, 0, -14):   # butt hinges: the knuckles stay with the frame
    jamb.append(cyl(0.55, 4.2, (30.05, hy, 0.15), "y", BRASS, along="y"))
    jamb.append(box(1.6, 4, 0.14, 31.0, hy, 0, BRASS, 0.05))

# 1 · barrel bolt keep, 2 · strike, 3 · chain anchor, 4 · staple plate, 5 · screw eye
jamb += [
    box(6, 3.4, 0.5, -4, Y["L1"], 0, STEEL), box(3.2, 1.8, 0.8, -4, Y["L1"], 0.4, STEEL, 0.1),
    sleeve(1.03, 1.4, -5.6, -2.4, Y["L1"], 2.0, STEEL),
    screw(-6.4, Y["L1"] + 1.1, 0.5), screw(-1.6, Y["L1"] - 1.1, 0.5),
    box(4, 6, 0.8, -3, Y["L2"], 0, STEEL), box(2.5, 2.2, 0.14, -2.6, Y["L2"], 0.76, DARK, 0.04),
    screw(-3, Y["L2"] + 2.3, 0.8), screw(-3, Y["L2"] - 2.3, 0.8),
    box(4, 4, 0.6, -3.5, Y["L3"], 0, STEEL), screw(-4.7, Y["L3"] + 1.3, 0.6), screw(-4.7, Y["L3"] - 1.3, 0.6),
    box(3.2, 3.8, 0.4, -2.5, Y["L4"], 0, STEEL), screw(-3.6, Y["L4"] + 1.5, 0.4), screw(-1.4, Y["L4"] - 1.5, 0.4),
    tube([(-2.5, Y["L4"] + 1.3 * math.cos(a), 1.0 + 1.3 * math.sin(a)) for a in [i * 2 * math.pi / 28 for i in range(28)]], 0.27, STEEL, closed=True),
    cyl(0.9, 0.3, (-1.6, Y["L5"] - 0.9, 0.15), "z", STEEL),
    cyl(0.2, 0.6, (-1.6, Y["L5"] - 0.9, 0.3), "z", STEEL, 0.02, 12),
    tube([(-1.6 + 0.7 * math.cos(a), Y["L5"] - 0.9, 1.2 + 0.7 * math.sin(a)) for a in [i * 2 * math.pi / 24 for i in range(24)]], 0.17, STEEL, closed=True),
]
part("jamb", jamb, amp=0.05, cell=3.6)

# ── the leaf: a heavy lock stile, rails, two fielded panels ──────────────────
PX0, PX1 = 14.2, 26.6
panel_profile = [(0, FACE), (0.45, 0.05), (0.75, -0.6), (1.25, -0.6), (2.5, 0.2)]
leaf = [
    box(29.4, TOP - BOTTOM, 2, 15.3, 0, -3, PAINT, 0.12),
    box(PX0 - 0.6, TOP - BOTTOM, FACE + 1, (0.6 + PX0) / 2, 0, -1, PAINT, 0.12),
    box(30 - PX1, TOP - BOTTOM, FACE + 1, (PX1 + 30) / 2, 0, -1, PAINT, 0.12),
    box(PX1 - PX0, 3.5, FACE + 1, (PX0 + PX1) / 2, TOP - 1.75, -1, PAINT, 0.08),
    box(PX1 - PX0, 3.5, FACE + 1, (PX0 + PX1) / 2, BOTTOM + 1.75, -1, PAINT, 0.08),
    box(PX1 - PX0, 5, FACE + 1, (PX0 + PX1) / 2, 0, -1, PAINT, 0.08),
    moulding(PX0, 2.5, PX1, TOP - 3.5, panel_profile, PAINT),
    moulding(PX0, BOTTOM + 3.5, PX1, -2.5, panel_profile, PAINT),
]
for hy in (14, 0, -14):
    leaf.append(box(2.2, 4, 0.14, 28.8, hy, FACE, BRASS, 0.05))
    leaf += screw(28.4, hy + 1.3, FACE + 0.14) + screw(28.4, hy - 1.3, FACE + 0.14)

Z = FACE
# 1 · barrel bolt: backplate and two guides, with the knob's run clear between them
leaf += [
    box(12.8, 3.4, 0.4, 7.4, Y["L1"], Z, STEEL),
    box(1.6, 1.8, 0.6, 2.3, Y["L1"], Z + 0.3, STEEL, 0.1), box(1.6, 1.8, 0.6, 12.3, Y["L1"], Z + 0.3, STEEL, 0.1),
    sleeve(1.03, 1.4, 1.5, 3.1, Y["L1"], Z + 1.4, STEEL), sleeve(1.03, 1.4, 11.5, 13.1, Y["L1"], Z + 1.4, STEEL),
    screw(4.2, Y["L1"] - 1.2, Z + 0.4), screw(10.4, Y["L1"] - 1.2, Z + 0.4),
]
# 2 · deadbolt case
leaf += [box(11, 6, 1.9, 6.5, Y["L2"], Z, STEEL, 0.38, 3), screw(2, Y["L2"] + 2.2, Z + 1.9), screw(11, Y["L2"] - 2.2, Z + 1.9)]
# 3 · chain track, with the slot sunk and its wide end
leaf += [
    box(10, 3.6, 0.9, 6.5, Y["L3"], Z, STEEL, 0.2),
    box(7, 1.2, 0.1, 6.3, Y["L3"], Z + 0.85, DARK, 0.03), box(1.8, 2.2, 0.1, 9.4, Y["L3"], Z + 0.85, DARK, 0.03),
    screw(2.2, Y["L3"] + 1.35, Z + 0.9), screw(11, Y["L3"] - 1.35, Z + 0.9),
]
# 4 · hasp base, 5 · hook base
leaf += [box(4, 4, 0.6, 11, Y["L4"], Z, STEEL), screw(12.3, Y["L4"] + 1.4, Z + 0.6), screw(12.3, Y["L4"] - 1.4, Z + 0.6)]
leaf += [box(2.6, 2.6, 0.6, 8, Y["L5"], Z, STEEL), screw(9, Y["L5"] + 0.9, Z + 0.6), screw(9, Y["L5"] - 0.9, Z + 0.6)]
part("leaf", leaf, amp=0.05, cell=3.6)

# ── moving parts, each on its pivot ──────────────────────────────────────────
BX, BY, BZ = 1, Y["L1"], Z + 1.4
part("barrel", [
    cyl(1, 16, (BX, BY, BZ), "x", BRASS, 0.14, 40),
    cyl(0.34, 2.0, (BX + 3, BY + 1.5, BZ), "y", BRASS, 0.04, 14, along="y"),
    lathe([(0.34, -0.5), (0.62, -0.3), (0.72, 0), (0.62, 0.3), (0.25, 0.52)], (BX + 3, BY + 2.9, BZ), "y", BRASS, 20, along="y"),
], (BX, BY, BZ))

part("bolt", [box(6.5, 2, 1.2, -0.35, Y["L2"], 0.2, BRASS, 0.2, 3)], (-2, Y["L2"], 0.2))

TX, TY, TZ = 8, Y["L2"], Z + 1.9
part("thumb", [
    lathe([(1.5, 0), (1.5, 0.12), (1.34, 0.3), (0.9, 0.42), (0, 0.46)], (TX, TY, TZ), "z", BRASS, 40),
    box(0.95, 3.5, 0.95, TX, TY, TZ + 0.38, BRASS, 0.3, 3, along="y"),
], (TX, TY, TZ))

SX, SY, SZ = 2.6, Y["L3"], Z + 1.3
part("slider", [
    cyl(0.5, 0.9, (SX, SY, SZ - 0.2), "z", STEEL, 0.03, 20),
    lathe([(0.78, 0.2), (0.78, 0.34), (0.62, 0.5), (0, 0.56)], (SX, SY, SZ), "z", BRASS, 28),
], (SX, SY, SZ))

AX, AY, AZ = -2, Y["L3"], 1.1
part("anchorRing", [tube(arc(AX, AY, 0.8, 0, 2 * math.pi * 23 / 24, 23, AZ), 0.24, BRASS, closed=True)], (AX, AY, AZ))

# one chain link, in its own plane, long axis on x; the page clones it
stadium = arc(0.42, 0, 0.33, -math.pi / 2, math.pi / 2, 7) + arc(-0.42, 0, 0.33, math.pi / 2, 3 * math.pi / 2, 7)
part("link", [tube(stadium, 0.125, BRASS, closed=True, seg=8)], (0, 0, 0))

HX, HY, HZ = 10, Y["L4"], Z + 0.9
hasp = carve(box(14, 4.2, 0.5, HX - 7, HY, HZ, BRASS, 0.2, 2), box(1.1, 3.1, 2, HX - 12.5, HY, HZ - 0.7, BRASS, 0.2, 2))
finish(hasp, BRASS)
part("hasp", [
    hasp,
    cyl(0.5, 1.2, (HX, HY, HZ + 0.1), "z", STEEL, 0.05, 20),
    lathe([(0.72, 0.5), (0.72, 0.6), (0.5, 0.78), (0, 0.84)], (HX, HY, HZ), "z", STEEL, 24),
], (HX, HY, HZ))

PX, PY, PZ = -2.5, Y["L4"], 1.0
body = [box(3.4, 0.62, 1.8, PX, PY - 3.1 - 0.63 * i, PZ - 0.9, STEEL, 0.1, 2) for i in range(6)]   # laminated plates
body += [
    cyl(0.6, 0.2, (PX, PY - 4.7, PZ + 0.92), "z", BRASS, 0.05, 24),
    box(0.16, 0.62, 0.06, PX, PY - 4.78, PZ + 1.0, DARK, 0.02, 1),
    cyl(0.17, 0.06, (PX, PY - 4.55, PZ + 1.03), "z", DARK, 0.01, 12),
]
part("padlock", body, (PX, PY, PZ))

SHY = PY - 1.6
shackle = [(PX + 1.1, SHY - 1.8, PZ)] + [(PX + a, b, PZ) for a, b, _ in arc(0, SHY, 1.1, 0, math.pi, 22)] + [(PX - 1.1, SHY - 3.0, PZ)]
part("shackle", [tube(shackle, 0.27, BRASS)], (PX, SHY, PZ))

KX, KY, KZ = 8, Y["L5"], Z + 0.6   # low enough for the hasp to swing over it
hook = [(KX, KY, KZ), (KX - 8.8, KY, KZ)] + [(KX - 8.8 + a, KY + b, KZ) for a, b, _ in arc(0, -0.8, 0.8, math.pi / 2, math.pi, 8)] + [(KX - 9.6, KY - 1.55, KZ)]
part("hook", [
    tube(hook, 0.28, BRASS),
    cyl(0.42, 1.0, (KX, KY, KZ - 0.3), "z", STEEL, 0.04, 20),
    lathe([(0.5, 0), (0.5, 0.1), (0.38, 0.2), (0, 0.24)], (KX, KY, KZ), "z", STEEL, 24),
], (KX, KY, KZ))

# ── out ───────────────────────────────────────────────────────────────────────
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND, compress=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB, export_format="GLB", export_yup=True, export_apply=True,
    export_image_format="JPEG", export_image_quality=78, export_meshopt_compression_enable=True, export_cameras=False, export_lights=False,
    export_animations=False, export_morph=False, export_skins=False, export_tangents=False,
)
tris = sum(len(o.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.polygons) for o in col.objects)
print("BUILD_OK objects", len(col.objects), "polygons", tris)

if OUT_PREVIEW:
    s = bpy.context.scene
    s.render.engine = "BLENDER_EEVEE"
    s.render.resolution_x, s.render.resolution_y = 1100, 1000
    s.render.filepath = OUT_PREVIEW
    w = bpy.data.worlds.new("w"); w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.92, 0.9, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    s.world = w
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 3.5; sun.rotation_euler = (math.radians(55), 0, math.radians(-25))
    s.collection.objects.link(sun)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    cam.data.type = "ORTHO"; cam.data.ortho_scale = 54
    cam.location = (10, -80, 0); cam.rotation_euler = (math.pi / 2, 0, 0)
    s.collection.objects.link(cam); s.camera = cam
    bpy.ops.render.render(write_still=True)
    print("PREVIEW_OK")
