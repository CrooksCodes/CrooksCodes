"""Steel prototype: a long riveted bulkhead door, one clamp lever and the big wheel.
Run: blender --background --python build_steel.py -- <helpers build_door.py> <out.glb>
x right, y up, z toward the viewer. Front plane z=0, seam x=0. Wheel parts are authored at y=0;
the page places them at the right height down the door.
"""
import math, random, sys
import bpy, bmesh
import numpy as np
from mathutils import Matrix, Vector, noise as mnoise

argv = sys.argv[sys.argv.index("--") + 1:]
HELPERS, OUT_GLB = argv[0], argv[1]
rng = random.Random(5)
bpy.ops.wm.read_factory_settings(use_empty=True)

# ── painted steel: mottled paint, vertical grime, a few scratches. Tileable ───
def field(n, su, sv, seed):
    g = np.random.default_rng(seed).normal(size=(n, n))
    fu, fv = np.fft.fftfreq(n)[None, :], np.fft.fftfreq(n)[:, None]
    f = np.fft.ifft2(np.fft.fft2(g) * np.exp(-((fu * su) ** 2 + (fv * sv) ** 2))).real
    return (f - f.min()) / (f.max() - f.min())

N = 1024
mottle = field(N, 70, 70, 1)
grime = field(N, 24, 260, 2)
grain = field(N, 2.0, 2.0, 3)
tone = 0.5 * mottle + 0.38 * grime + 0.12 * grain
tone = np.clip((tone - tone.mean()) * 1.5 + 0.5, 0, 1)
dark, light = np.array([0.012, 0.015, 0.017]), np.array([0.040, 0.046, 0.050])   # linear
rgb = dark[None, None, :] + (light - dark)[None, None, :] * tone[:, :, None]
r = np.random.default_rng(9)
for _ in range(34):                                      # scratches through the paint
    x, y = r.uniform(0, N, 2)
    a = r.normal(1.2, 0.5)
    L = int(r.uniform(14, 120))
    v = r.uniform(0.006, 0.018)
    for t in range(L):
        i, j = int(y + math.sin(a) * t) % N, int(x + math.cos(a) * t) % N
        rgb[i, j] = np.minimum(rgb[i, j] + v, 0.09)
px = np.concatenate([rgb, np.ones((N, N, 1))], axis=2).astype(np.float32)
img = bpy.data.images.new("paint", N, N, alpha=False)
img.colorspace_settings.name = "Linear Rec.709"
img.pixels.foreach_set(px.ravel()); img.pack()

def material(name, color, rough, metal):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    return m

paint = material("paint", (1, 1, 1), 0.7, 0.0)
nt = paint.node_tree
tc = nt.nodes.new("ShaderNodeTexImage"); tc.image = img
nt.links.new(tc.outputs["Color"], next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED").inputs["Base Color"])

MATS = [
    paint,
    material("brass", (0.78, 0.54, 0.22), 0.3, 1.0),
    material("iron", (0.055, 0.06, 0.065), 0.62, 1.0),     # dark fixed hardware
    material("machined", (0.36, 0.355, 0.34), 0.46, 1.0), # worn, moving steel
    material("void", (0.006, 0.006, 0.006), 0.9, 0.0),
]
PAINT, BRASS, IRON, MACHINED, VOID = range(5)

src = open(HELPERS, encoding="utf-8").read()
exec(src[src.index("# ── soft forms"):src.index("# ── the frame")])

def slab(x0, x1, y0, y1, z0, z1, uv_scale=38.0, mat=PAINT, bevel=0.1):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=(x1 - x0, y1 - y0, z1 - z0), verts=bm.verts)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, offset_type="OFFSET", segments=2, profile=0.5, affect="EDGES")
    bmesh.ops.translate(bm, vec=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), verts=bm.verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        f.material_index = mat
        f.smooth = f.calc_area() < 8
        for l in f.loops:
            l[uv].uv = (l.vert.co.x / uv_scale, l.vert.co.y / uv_scale)
    return bm

def bolt(x, y, z, s=1.0):
    """A hex bolt on a washer."""
    return [
        lathe([(0.82 * s, 0), (0.82 * s, 0.1 * s), (0.001, 0.1 * s)], (x, y, z), "z", IRON, seg=14),
        lathe([(0.56 * s, 0.1 * s), (0.56 * s, 0.42 * s), (0.44 * s, 0.52 * s), (0.001, 0.54 * s)], (x, y, z), "z", MACHINED, seg=6),
    ]

# ── the door: thick leaf, frame, a raised coaming either side of the seam ─────
GAP = 0.1
TOP, BOTTOM, HINGE = 70, -320, -50
LEN = TOP - BOTTOM
MID = (TOP + BOTTOM) / 2
leaf = [slab(HINGE, -GAP, BOTTOM, TOP, -6, 0, 38.0)]
frame = [slab(GAP, 95, BOTTOM, TOP, -6, 0, 33.0)]
# coaming: a heavy raised strip along the seam, with a dark gasket line
leaf.append(slab(-3.4, -GAP, BOTTOM, TOP, 0, 0.7, 38.0, PAINT, 0.2))
frame.append(slab(GAP, 3.4, BOTTOM, TOP, 0, 0.7, 33.0, PAINT, 0.2))
# plate joints: a low weld bead across the door at intervals
y = 22
while y > BOTTOM:
    leaf.append(slab(HINGE, -3.4, y - 1.9, y + 1.9, 0, 0.34, 38.0, PAINT, 0.12))
    frame.append(slab(3.4, 95, y - 1.9, y + 1.9, 0, 0.34, 33.0, PAINT, 0.12))
    y -= 44
part("leafDoor", leaf, amp=0)
part("frameDoor", frame, amp=0)
part("jamb", [slab(-120, HINGE - 0.1, BOTTOM, TOP, -6, 0, 36.0)], amp=0)

# ── lock 1: the clamp lever ───────────────────────────────────────────────────
PV = (-7.0, 0, 1.15)
base = [rbox(11.6, 8.4, 0.62, -7.2, 0, 0.46, IRON, 0.16, 0.03, cuts=3)]
base.append(lathe([(2.3, 0), (2.34, 0.08), (2.2, 0.26), (0.001, 0.3)], (PV[0], 0, 1.04), "z", IRON, 28))
for bx, by in ((-11.8, 3.3), (-11.8, -3.3), (-2.6, 3.3), (-2.6, -3.3)):
    base += bolt(bx, by, 1.08)
part("leverBase", base, amp=0)

part("leverArm", [
    rbox(13.6, 2.5, 1.05, -0.2, 0, 1.3, MACHINED, 0.34, 0.06, cuts=4),     # the arm over the seam to the wedge
    rbox(6.0, 1.5, 0.82, -9.8, 0, 1.42, MACHINED, 0.3, 0.04, cuts=3),      # the tail
    pill(1.55, 0.9, (-7.0, 0, 2.5), "z", BRASS, seg=28),                   # pivot cap
    lathe([(0.001, -1.3), (0.72, -1.15), (1.12, -0.72), (1.28, 0), (1.12, 0.72), (0.72, 1.15), (0.001, 1.3)], (-13.3, 0, 1.85), "x", BRASS, 24),   # grip
], (PV[0], 0, 1.3), amp=0)

wedge = [rbox(8.0, 8.4, 0.62, 5.6, 0, 0.46, IRON, 0.16, 0.03, cuts=3)]
wedge.append(rbox(5.6, 2.0, 1.5, 4.8, -2.32, 0.95, MACHINED, 0.24, cuts=3))   # the wedge the arm clamps down on
wedge.append(rbox(1.1, 4.8, 1.8, 8.0, 0, 0.95, IRON, 0.24, cuts=3))           # end stop
for bx, by in ((3.1, 3.3), (8.2, 3.3), (3.1, -3.5), (8.3, -3.5)):
    wedge += bolt(bx, by, 1.08)
part("wedge", wedge, amp=0)

# ── lock 5: the wheel, what it holds on the leaf and frame ───────────────────
W = -8.0   # wheel centre on the leaf
plate = [lathe([(7.5, 0), (7.56, 0.08), (7.4, 0.34), (0.001, 0.38)], (W, 0, 0.46), "z", IRON, 56)]
for i in range(8):
    a = math.pi / 8 + i * math.pi / 4
    plate += bolt(W + 6.5 * math.cos(a), 6.5 * math.sin(a), 0.84, 0.9)
plate.append(pill(1.9, 1.5, (W, 0, 1.45), "z", IRON, seg=28))                  # the spindle housing
part("wheelPlate", plate, amp=0)

SP = (W, 0, 3.0)
spokes = []
for i in range(3):
    a = math.pi / 2 + i * 2 * math.pi / 3
    spokes.append(tube([(W + t * math.cos(a), t * math.sin(a), SP[2] - 0.02) for t in (0.9, 3.0, 5.6)], 0.46, BRASS, seg=12))
part("wheelRim", [
    ring(W, 0, SP[2], 5.95, 0.62, BRASS),
    *spokes,
    pill(1.42, 1.5, (W, 0, SP[2]), "z", BRASS, seg=28),
    lathe([(0.001, 0), (0.62, 0.05), (0.9, 0.2)], (W, 0, SP[2] + 0.72), "z", MACHINED, 20),
], SP, amp=0)

# two sliding bars the wheel draws back across the seam
part("bars", [
    rbox(13.0, 1.7, 0.9, -1.8, 4.9, 0.86, MACHINED, 0.2, cuts=3),
    rbox(13.0, 1.7, 0.9, -1.8, -4.9, 0.86, MACHINED, 0.2, cuts=3),
], (0, 0, 0), amp=0)

keeps = []
for ky in (4.9, -4.9):
    keeps += [
        rbox(6.4, 4.0, 0.5, 4.6, ky, 0.46, IRON, 0.14, cuts=3),
        rbox(3.8, 0.7, 1.5, 3.9, ky + 1.25, 0.9, IRON, 0.14, cuts=2),
        rbox(3.8, 0.7, 1.5, 3.9, ky - 1.25, 0.9, IRON, 0.14, cuts=2),
        *bolt(7.0, ky + 1.3, 0.96, 0.8), *bolt(7.0, ky - 1.3, 0.96, 0.8),
    ]
part("keeps", keeps, amp=0)

bpy.ops.export_scene.gltf(
    filepath=OUT_GLB, export_format="GLB", export_yup=True, export_apply=True,
    export_image_format="JPEG", export_image_quality=84, export_meshopt_compression_enable=True,
    export_cameras=False, export_lights=False, export_animations=False, export_morph=False, export_skins=False,
)
dg = bpy.context.evaluated_depsgraph_get()
print("BUILD_OK tris", sum(sum(len(p.vertices) - 2 for p in o.evaluated_get(dg).data.polygons) for o in col.objects))
