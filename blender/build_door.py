"""Builds the door and its five locks, then exports a GLB.

Run headless:  blender --background --python blender/build_door.py -- <out.glb> <out.blend>

A designed object rather than a replica: plaster door, aged brass, slim frame.
Soft edges and no surface texture, with restrained proportions so it stays adult.

Geometry is authored in the web scene's coordinates (x right, y up, z toward the
viewer, drawing units as in app/lockSpec.ts) and rotated into Blender's Z-up on
the way out. Every moving part is its own object with its origin on its pivot.
"""
import math, sys
import bpy, bmesh
from mathutils import Matrix, Vector, noise as mnoise

argv = sys.argv[sys.argv.index("--") + 1:]
OUT_GLB, OUT_BLEND = argv[0], argv[1]

Y = {"L1": 16.5, "L2": 8, "L3": 0, "L4": -7, "L5": -17}   # lockSpec.ts
TOP, BOTTOM = 22, -22
Z = 1.4   # the leaf's front plane

bpy.ops.wm.read_factory_settings(use_empty=True)

def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)

def material(name, hex_color, rough, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*srgb(hex_color), 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    return m

MATS = [
    material("plaster", "E8E1D3", 0.8),        # the leaf
    material("stone", "D2CABA", 0.84),         # the frame
    material("brass", "BC955A", 0.42, 0.55),   # what moves
    material("bronze", "6E5A42", 0.55, 0.35),  # what stays
    material("dark", "2B221A", 0.9),           # slots and the keyhole
]
CREAM, SAND, BRASS, BRONZE, DARK = range(5)

# ── soft forms ────────────────────────────────────────────────────────────────
def finish(bm, mat):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        f.material_index = mat
        f.smooth = True
    return bm

def rbox(w, h, d, x, y, z0, mat, r=0.6, puff=0.0, cuts=7):
    """A true rounded box, centred at (x, y), back face at z0, optionally swollen on its face."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2)
    bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=cuts, use_grid_fill=True)
    half = (w / 2, h / 2, d / 2)
    r = min(r, *[v * 0.98 for v in half])
    inner = [v - r for v in half]
    for v in bm.verts:
        o = list(v.co)
        pos = []
        for i in range(3):
            u = o[i]
            # half the rows go to the rounded corners, so curves stay smooth on long sides
            a = abs(u)
            c = a / 0.5 * inner[i] if a < 0.5 else inner[i] + (a - 0.5) / 0.5 * r
            pos.append(math.copysign(c, u))
        p = [max(-inner[i], min(inner[i], pos[i])) for i in range(3)]
        n = Vector([pos[i] - p[i] for i in range(3)])
        q = Vector(p) + (n.normalized() * r if n.length > 1e-6 else Vector((0, 0, 0)))
        if puff and q.z > 0:
            q.z += puff * max(0, 1 - (q.x / half[0]) ** 2) * max(0, 1 - (q.y / half[1]) ** 2)
        v.co = q + Vector((x, y, z0 + d / 2))
    return finish(bm, mat)

AXIS = {"z": Matrix.Identity(3), "x": Matrix.Rotation(math.pi / 2, 3, "Y"), "y": Matrix.Rotation(-math.pi / 2, 3, "X")}

def lathe(profile, center, axis, mat, seg=40, closed=False):
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
    return finish(bm, mat)

def pill(r, length, center, axis, mat, end=None, seg=40):
    """A cylinder with fully rounded ends."""
    e = min(end if end is not None else r * 0.75, r, length / 2)
    h = length / 2
    prof = [(max(0.001, (r - e) + e * math.sin(a * math.pi / 16)), -h + e - e * math.cos(a * math.pi / 16)) for a in range(9)]
    prof += [(max(0.001, (r - e) + e * math.sin(a * math.pi / 16)), h - e + e * math.cos(a * math.pi / 16)) for a in range(8, -1, -1)]
    return lathe(prof, center, axis, mat, seg)

def collar(inner, outer, x0, x1, y, z, mat):
    """A fat hollow guide that a bolt runs through."""
    c = (outer - inner) / 2
    m = (inner + outer) / 2
    prof = [(m + c * math.cos(a), (x0 + c) - c * math.sin(a)) for a in [math.pi * i / 8 for i in range(9)]]
    prof += [(m - c * math.cos(a), (x1 - c) + c * math.sin(a)) for a in [math.pi * i / 8 for i in range(9)]]
    return lathe(prof, (0, y, z), "x", mat, closed=True, seg=44)

def sweep(points, section, mat, closed=True):
    """Sweeps a section of (u, z) points along a path in the XY plane."""
    pts = [Vector(p) for p in points]
    n, m = len(pts), len(section)
    bm = bmesh.new()
    rings = []
    for i in range(n):
        a = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
        b = pts[(i + 1) % n] if (closed or i < n - 1) else pts[i]
        t = (b - a).normalized()
        o = Vector((-t.y, t.x))
        rings.append([bm.verts.new((pts[i].x + o.x * u, pts[i].y + o.y * u, z)) for u, z in section])
    for i in range(n if closed else n - 1):
        a, b = rings[i], rings[(i + 1) % n]
        for k in range(m):
            j = (k + 1) % m
            bm.faces.new((a[k], a[j], b[j], b[k]))
    return finish(bm, mat)

def tube(points, r, mat, closed=False, seg=16):
    """Round wire along a 3D path, ends domed by shrinking the last rings."""
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
    return finish(bm, mat)

def arc(cx, cy, R, a0, a1, n, z=0.0):
    return [(cx + R * math.cos(a0 + (a1 - a0) * i / n), cy + R * math.sin(a0 + (a1 - a0) * i / n), z) for i in range(n + 1)]

def ring(cx, cy, z, R, r, mat):
    return tube(arc(cx, cy, R, 0, 2 * math.pi * 31 / 32, 31, z), r, mat, closed=True)

def rounded_rect(x0, y0, x1, y1, R, step=2.5):
    """A closed path around a rectangle with round corners."""
    out = []
    def line(ax, ay, bx, by):
        k = max(1, int(math.hypot(bx - ax, by - ay) / step))
        out.extend((ax + (bx - ax) * i / k, ay + (by - ay) * i / k) for i in range(k))
    def corner(cx, cy, a):
        out.extend((cx + R * math.cos(a + math.pi / 2 * i / 10), cy + R * math.sin(a + math.pi / 2 * i / 10)) for i in range(10))
    line(x0 + R, y0, x1 - R, y0); corner(x1 - R, y0 + R, -math.pi / 2)
    line(x1, y0 + R, x1, y1 - R); corner(x1 - R, y1 - R, 0)
    line(x1 - R, y1, x0 + R, y1); corner(x0 + R, y1 - R, math.pi / 2)
    line(x0, y1 - R, x0, y0 + R); corner(x0 + R, y0 + R, math.pi)
    return out

# ── parts: each exported node ─────────────────────────────────────────────────
TO_BLENDER = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
col = bpy.data.collections.new("door"); bpy.context.scene.collection.children.link(col)

def part(name, pieces, pivot=(0, 0, 0), amp=0.05):
    """Merges pieces, nudges them very slightly out of true so nothing looks machined, and exports on the pivot."""
    flat = []
    for p in pieces:
        flat.extend(p if isinstance(p, list) else [p])
    bm = bmesh.new()
    for p in flat:
        t = bpy.data.meshes.new("_t"); p.to_mesh(t); bm.from_mesh(t); bpy.data.meshes.remove(t); p.free()
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * mnoise.noise(v.co * 0.16) * amp
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

# ── the frame: one fat ring, then what is fixed to it ─────────────────────────
FW, FD = 4.5, 4.0       # frame width and depth
FZ = -0.4               # the frame's centre depth
R_SEC = 0.95
section = []
for cx, cz, a in ((FW / 2 - R_SEC, FD / 2 - R_SEC, 0), (-FW / 2 + R_SEC, FD / 2 - R_SEC, math.pi / 2), (-FW / 2 + R_SEC, -FD / 2 + R_SEC, math.pi), (FW / 2 - R_SEC, -FD / 2 + R_SEC, 3 * math.pi / 2)):
    section += [(cx + R_SEC * math.cos(a + math.pi / 2 * i / 6), FZ + cz + R_SEC * math.sin(a + math.pi / 2 * i / 6)) for i in range(7)]
frame = [sweep(rounded_rect(-2.25, BOTTOM - 2.25, 32.25, TOP + 2.25, 3.2), section, SAND)]
KP = -2.25   # centre of the lock-side post

PLATE = 1.6   # the frame's front plane
BAR_Z = 3.1   # the barrel's centreline
frame += [
    # 1 · barrel keep
    rbox(3.7, 4.6, 0.5, KP, Y["L1"], PLATE - 0.08, BRONZE, 0.24, 0.06),
    collar(1.22, 1.72, KP - 1.5, KP + 1.2, Y["L1"], BAR_Z, BRONZE),
    # 2 · strike with its slot
    rbox(3.6, 5.2, 0.55, KP, Y["L2"], PLATE - 0.08, BRONZE, 0.27, 0.06),
    rbox(2.1, 2.7, 0.18, KP + 0.2, Y["L2"], PLATE + 0.38, DARK, 0.08),
    # 3 · chain anchor
    rbox(3.6, 3.6, 0.5, KP, Y["L3"], PLATE - 0.08, BRONZE, 0.24, 0.06),
    # 4 · staple plate
    rbox(3.6, 4.4, 0.5, KP, Y["L4"], PLATE - 0.08, BRONZE, 0.24, 0.06),
    # 5 · eye
    pill(1.4, 0.5, (KP, Y["L5"] - 0.2, PLATE + 0.1), "z", BRONZE),
    ring(KP, Y["L5"] - 0.2, PLATE + 0.65, 0.85, 0.26, BRONZE),
]
for hy in (15, 0, -15):   # butt hinges; the knuckles stay with the frame
    frame.append(pill(0.72, 4.6, (30.12, hy, PLATE + 0.1), "y", BRASS))
    frame.append(rbox(2.3, 3.8, 0.34, 31.3, hy, PLATE - 0.06, BRONZE, 0.14, 0.02))
part("jamb", frame, amp=0.04)

# ── the leaf: a slab with two quiet fielded panels, and what is fixed to it ───
leaf = [
    rbox(29.2, 43.4, 3.0, 15.2, 0, -1.6, CREAM, 0.72, 0.3, cuts=15),
    rbox(10.0, 15.6, 1.0, 21, 10.2, Z - 0.1, CREAM, 0.46, 0.42, cuts=10),
    rbox(10.0, 15.6, 1.0, 21, -10.2, Z - 0.1, CREAM, 0.46, 0.42, cuts=10),
    # 1 · barrel backplate and two guides
    rbox(12.6, 4.6, 0.5, 6.7, Y["L1"], Z - 0.05, BRONZE, 0.24, 0.06),
    collar(1.22, 1.72, 1.0, 2.2, Y["L1"], BAR_Z, BRONZE), collar(1.22, 1.72, 10.6, 11.8, Y["L1"], BAR_Z, BRONZE),
    # 2 · deadbolt case
    rbox(11.0, 5.2, 1.9, 7.4, Y["L2"], Z - 0.05, BRONZE, 0.82, 0.16),
    # 3 · chain track with its slot
    rbox(10.0, 3.0, 0.6, 6.6, Y["L3"], Z - 0.05, BRONZE, 0.27, 0.06),
    rbox(8.0, 0.95, 0.14, 6.6, Y["L3"], Z + 0.48, DARK, 0.06),
    # 4 · hasp base
    rbox(4.0, 4.0, 0.5, 12, Y["L4"], Z - 0.05, BRONZE, 0.24, 0.06),
]
for hy in (15, 0, -15):
    leaf.append(rbox(2.6, 3.8, 0.3, 28.0, hy, Z - 0.05, BRONZE, 0.12, 0.02))
part("leaf", leaf, amp=0.04)

# ── moving parts, each on its pivot ──────────────────────────────────────────
def ball(r):
    return [(max(0.001, r * math.sin(a * math.pi / 16)), -r * math.cos(a * math.pi / 16)) for a in range(17)]

BX, BY, BZ = 4, Y["L1"], BAR_Z
part("barrel", [
    pill(1.15, 15, (BX, BY, BZ), "x", BRASS, end=0.62, seg=44),
    pill(0.36, 2.4, (BX - 0.2, BY + 1.7, BZ), "y", BRASS),
    lathe(ball(0.78), (BX - 0.2, BY + 3.0, BZ), "y", BRASS, 32),
], (BX, BY, BZ), amp=0.0)

BOLT_Z = 1.7
part("bolt", [rbox(7.0, 2.1, 1.0, 0.9, Y["L2"], BOLT_Z, BRASS, 0.38)], (-2, Y["L2"], BOLT_Z), amp=0.0)

TX, TY, TZ = 9.6, Y["L2"], Z + 1.85
part("thumb", [
    lathe([(1.38, 0), (1.42, 0.1), (1.32, 0.24), (1.0, 0.36), (0.001, 0.42)], (TX, TY, TZ), "z", BRASS, 44),
    rbox(0.95, 3.2, 0.95, TX, TY, TZ + 0.2, BRASS, 0.34),
], (TX, TY, TZ), amp=0.0)

SX, SY, SZ = 3.4, Y["L3"], Z + 1.15
part("slider", [
    pill(0.4, 1.0, (SX, SY, SZ - 0.45), "z", BRONZE),
    lathe(ball(0.72), (SX, SY, SZ), "z", BRASS, 32),
], (SX, SY, SZ), amp=0.0)

AX, AY, AZ = KP, Y["L3"], PLATE + 0.75
part("anchorRing", [ring(AX, AY, AZ, 0.8, 0.22, BRASS)], (AX, AY, AZ), amp=0.0)

# one chain link, long axis on x; the page clones it
stadium = arc(0.3, 0, 0.3, -math.pi / 2, math.pi / 2, 8) + arc(-0.3, 0, 0.3, math.pi / 2, 3 * math.pi / 2, 8)
part("link", [tube(stadium[:-1], 0.145, BRASS, closed=True, seg=10)], (0, 0, 0), amp=0)

HX, HY, HZ = 12, Y["L4"], Z + 0.5
part("hasp", [
    rbox(15, 3.2, 0.55, HX - 7.2, HY, HZ, BRASS, 0.27, 0.08),
    pill(0.8, 0.9, (HX, HY, HZ + 0.4), "z", BRONZE),
], (HX, HY, HZ), amp=0.0)

PX, PY, PZ = KP, Y["L4"], 3.2
part("padlock", [
    rbox(4.6, 3.9, 1.7, PX, PY - 4.3, PZ - 0.85, BRASS, 0.76, 0.14),
    pill(0.46, 0.2, (PX, PY - 4.0, PZ + 0.92), "z", DARK, seg=24),
    rbox(0.34, 0.9, 0.14, PX, PY - 4.65, PZ + 0.84, DARK, 0.06),
], (PX, PY, PZ), amp=0.0)

SHY = PY - 0.7
shackle = [(PX + 1.25, SHY - 1.55, PZ)] + [(PX + a, SHY + b, PZ) for a, b, _ in arc(0, 0, 1.25, 0, math.pi, 26)] + [(PX - 1.25, SHY - 2.4, PZ)]
part("shackle", [tube(shackle, 0.33, BRONZE)], (PX, SHY, PZ), amp=0.0)

KX, KY, KZ = 8, Y["L5"], Z + 0.75
TIP = KX - KP - 0.75
hook = [(KX - i * TIP / 18, KY, KZ) for i in range(19)] + [(KX - TIP + a, KY + b, KZ) for a, b, _ in arc(0, -0.75, 0.75, math.pi / 2, math.pi, 8)][1:]
part("hook", [
    tube(hook, 0.38, BRASS, seg=18),
    lathe(ball(0.38), (KX - TIP - 0.75, KY - 0.75, KZ), "y", BRASS, 18),
    pill(1.15, 0.5, (KX, KY, KZ - 0.65), "z", BRONZE),
    pill(0.72, 1.3, (KX, KY, KZ), "z", BRASS),
], (KX, KY, KZ), amp=0.0)

# ── out ───────────────────────────────────────────────────────────────────────
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND, compress=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB, export_format="GLB", export_yup=True, export_apply=True,
    export_meshopt_compression_enable=True, export_cameras=False, export_lights=False,
    export_animations=False, export_morph=False, export_skins=False, export_tangents=False,
)
dg = bpy.context.evaluated_depsgraph_get()
tris = sum(sum(len(p.vertices) - 2 for p in o.evaluated_get(dg).data.polygons) for o in col.objects)
print("BUILD_OK objects", len(col.objects), "tris", tris)
