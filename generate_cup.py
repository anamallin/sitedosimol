"""
Gerador 3D de copo de café - TAMPA MELHORADA
Tampa com: cupula arredondada, borda snap-on, area de beber elevada, slot recuado
"""
import math
import struct
import json
from io import BytesIO

# ───────────────────────── Utilidades ─────────────────────────

def pack_floats(data):
    out = bytearray()
    for item in data:
        if isinstance(item, (list, tuple)):
            for v in item:
                out.extend(struct.pack('<f', float(v)))
        else:
            out.extend(struct.pack('<f', float(item)))
    return bytes(out)

def pack_uints(data):
    out = bytearray()
    for v in data:
        out.extend(struct.pack('<I', int(v)))
    return bytes(out)

def bounds3(verts):
    xs = [v[0] for v in verts]; ys = [v[1] for v in verts]; zs = [v[2] for v in verts]
    return [min(xs), min(ys), min(zs)], [max(xs), max(ys), max(zs)]

def norm3(v):
    l = math.sqrt(sum(x*x for x in v))
    return [x/l for x in v] if l > 1e-10 else [0.0, 1.0, 0.0]

# ───────────────────────── Geometrias ─────────────────────────

def make_cup_body(r_bot, r_top, h, segs=48):
    """Corpo do copo: cone truncado branco"""
    verts, norms, idxs, uvs = [], [], [], []
    slope = (r_bot - r_top) / h
    nl = math.sqrt(1 + slope * slope)

    for i in range(segs + 1):
        a = (i / segs) * 2 * math.pi
        c, s = math.cos(a), math.sin(a)
        verts += [[r_bot*c, 0, r_bot*s], [r_top*c, h, r_top*s]]
        norms += [[c/nl, slope/nl, s/nl]] * 2
        uvs   += [[1.0 - (i/segs), 1.0], [1.0 - (i/segs), 0.0]]

    for i in range(segs):
        b = i * 2
        idxs += [b, b+2, b+1, b+1, b+2, b+3]

    # Fundo
    ci = len(verts)
    verts.append([0, 0, 0]); norms.append([0, -1, 0]); uvs.append([0.5, 0.5])
    ri = len(verts)
    for i in range(segs):
        a = (i / segs) * 2 * math.pi
        verts.append([r_bot*math.cos(a), 0, r_bot*math.sin(a)])
        norms.append([0, -1, 0]); uvs.append([0.5+0.5*math.cos(a), 0.5+0.5*math.sin(a)])
    for i in range(segs):
        idxs += [ci, ri + (i+1) % segs, ri + i]

    return verts, norms, idxs, uvs


def make_dome(radius, dome_h, y0=0.0, segs=48, rings=14):
    """Superficie superior cupolada da tampa"""
    verts, norms, idxs, uvs = [], [], [], []

    # Ponto central no topo da cupula
    verts.append([0.0, y0 + dome_h, 0.0])
    norms.append([0.0, 1.0, 0.0])
    uvs.append([0.5, 0.5])

    R = radius
    for ri in range(1, rings + 1):
        t = ri / rings
        r = R * t
        # Perfil: h = dome_h * (1 - t^2) -> cupula parabolica suave
        h_surf = y0 + dome_h * (1.0 - t * t)

        # Normal analitica da superficie h(r) = dome_h*(1 - (r/R)^2)
        # dh/dr = -2*dome_h*r/R^2  =>  normal radial = 2*dome_h*t/R
        nr = 2.0 * dome_h * t / R

        ring_base = len(verts)
        for si in range(segs):
            angle = (si / segs) * 2 * math.pi
            ca, sa = math.cos(angle), math.sin(angle)
            verts.append([r * ca, h_surf, r * sa])
            norms.append(norm3([nr * ca, 1.0, nr * sa]))
            uvs.append([0.5 + 0.5*t*ca, 0.5 + 0.5*t*sa])

        if ri == 1:
            for si in range(segs):
                nxt = (si + 1) % segs
                idxs += [0, ring_base + si, ring_base + nxt]
        else:
            prev = ring_base - segs
            for si in range(segs):
                nxt = (si + 1) % segs
                a, b = prev + si, prev + nxt
                cd, dd = ring_base + si, ring_base + nxt
                idxs += [a, cd, dd,  a, dd, b]

    return verts, norms, idxs, uvs


def make_snap_rim(r_dome, r_flange, rim_h, y0=0.0, segs=48):
    """
    Borda snap-on da tampa:
      - anel plano superior (r_dome -> r_flange, face para cima)
      - parede externa descendo
      - anel plano inferior (face para baixo) - labio de encaixe
      - parede interna subindo (snap interno)
    """
    verts, norms, idxs, uvs = [], [], [], []
    r_snap = r_dome - 0.003   # raio interno do snap (levemente menor que a cupula)

    def strip(pts_a, pts_b, norm_fn, flip=False):
        """Cria uma faixa de quads entre duas listas de pontos"""
        nonlocal verts, norms, idxs, uvs
        s = len(verts)
        n_pts = len(pts_a)
        for i in range(n_pts):
            verts.append(pts_a[i]); verts.append(pts_b[i])
            n = norm_fn(i)
            norms.append(n); norms.append(n)
            uvs.append([i / (n_pts-1), 0.0]); uvs.append([i / (n_pts-1), 1.0])
        for i in range(n_pts - 1):
            b2 = s + i * 2
            if flip:
                idxs += [b2, b2+1, b2+2,  b2+1, b2+3, b2+2]
            else:
                idxs += [b2, b2+2, b2+1,  b2+1, b2+2, b2+3]

    # --- Anel superior (plano, normal up) ---
    pts_in_top  = [[r_dome   * math.cos((i/segs)*2*math.pi), y0, r_dome   * math.sin((i/segs)*2*math.pi)] for i in range(segs+1)]
    pts_out_top = [[r_flange * math.cos((i/segs)*2*math.pi), y0, r_flange * math.sin((i/segs)*2*math.pi)] for i in range(segs+1)]
    strip(pts_in_top, pts_out_top, lambda i: [0, 1, 0])

    # --- Parede externa (normal outward) ---
    pts_top_ext = pts_out_top
    pts_bot_ext = [[r_flange * math.cos((i/segs)*2*math.pi), y0 - rim_h, r_flange * math.sin((i/segs)*2*math.pi)] for i in range(segs+1)]
    strip(pts_top_ext, pts_bot_ext, lambda i: [math.cos((i/segs)*2*math.pi), 0, math.sin((i/segs)*2*math.pi)], flip=False)

    # --- Anel inferior (normal down) ---
    pts_bot_in  = [[r_snap   * math.cos((i/segs)*2*math.pi), y0 - rim_h, r_snap   * math.sin((i/segs)*2*math.pi)] for i in range(segs+1)]
    pts_bot_out = pts_bot_ext
    strip(pts_bot_in, pts_bot_out, lambda i: [0, -1, 0], flip=True)

    # --- Parede interna (normal inward) ---
    pts_snap_top = [[r_snap * math.cos((i/segs)*2*math.pi), y0,       r_snap * math.sin((i/segs)*2*math.pi)] for i in range(segs+1)]
    pts_snap_bot = [[r_snap * math.cos((i/segs)*2*math.pi), y0-rim_h, r_snap * math.sin((i/segs)*2*math.pi)] for i in range(segs+1)]
    strip(pts_snap_top, pts_snap_bot, lambda i: [-math.cos((i/segs)*2*math.pi), 0, -math.sin((i/segs)*2*math.pi)], flip=True)

    return verts, norms, idxs, uvs


def make_spout_platform(r_dome, dome_h, y0, ov_segs=28):
    """
    Plataforma oval elevada para a area de beber (lado +X do copo).
    Retorna: (verts_platform, norms, idxs, uvs) - cor da tampa
    """
    verts, norms, idxs, uvs = [], [], [], []

    cx = r_dome * 0.50    # centro X do oval
    cz = 0.0
    oa = r_dome * 0.38    # semi-eixo X
    ob = r_dome * 0.27    # semi-eixo Z
    raise_h = 0.0045      # altura da plataforma acima da cupula

    # Calcular pontos das bordas moldados a curvatura da cupula
    pts_base = []
    pts_top = []
    for i in range(ov_segs):
        angle = (i / ov_segs) * 2 * math.pi
        px = cx + oa * math.cos(angle)
        pz = cz + ob * math.sin(angle)
        
        # Calcular Y da cupula nessa coordenada (px, pz)
        r = math.sqrt(px*px + pz*pz)
        r_clamped = min(r, r_dome)
        py = y0 + dome_h * (1.0 - (r_clamped / r_dome)**2)
        
        pts_base.append([px, py, pz])
        pts_top.append([px, py + raise_h, pz])

    # Paredes laterais do oval
    for i in range(ov_segs):
        nxt = (i + 1) % ov_segs
        s = len(verts)
        verts += [pts_base[i], pts_top[i], pts_base[nxt], pts_top[nxt]]
        # Normal para o oval (gradiente da elipse)
        mx = (pts_base[i][0] + pts_base[nxt][0]) / 2.0 - cx
        mz = (pts_base[i][2] + pts_base[nxt][2]) / 2.0 - cz
        n = norm3([mx / (oa*oa), 0.0, mz / (ob*ob)])
        norms += [n, n, n, n]
        uvs += [[0,0],[0,1],[1,0],[1,1]]
        idxs += [s, s+2, s+1,  s+1, s+2, s+3]

    # Face superior (anel entre borda externa e slot interno)
    ia = oa * 0.60
    ib = ob * 0.52
    
    pts_slot_edge = []
    for i in range(ov_segs):
        angle = (i / ov_segs) * 2 * math.pi
        px = cx + ia * math.cos(angle)
        pz = cz + ib * math.sin(angle)
        
        # Calcular Y da cupula nessa coordenada
        r = math.sqrt(px*px + pz*pz)
        r_clamped = min(r, r_dome)
        py = y0 + dome_h * (1.0 - (r_clamped / r_dome)**2)
        
        pts_slot_edge.append([px, py + raise_h - 0.0003, pz])

    for i in range(ov_segs):
        nxt = (i + 1) % ov_segs
        s = len(verts)
        verts += [pts_top[i], pts_top[nxt], pts_slot_edge[i], pts_slot_edge[nxt]]
        norms += [[0,1,0]]*4
        uvs += [[0,0],[1,0],[0,1],[1,1]]
        idxs += [s, s+2, s+1,  s+1, s+2, s+3]

    return verts, norms, idxs, uvs


def make_spout_slot(r_dome, dome_h, y0, ov_segs=28):
    """
    Interior recuado do slot de bebida - cor bem escura para simular abertura.
    """
    verts, norms, idxs, uvs = [], [], [], []

    cx = r_dome * 0.50
    cz = 0.0
    oa = r_dome * 0.38
    ob = r_dome * 0.27
    raise_h = 0.003
    slot_depth = 0.002

    ia = oa * 0.60
    ib = ob * 0.52

    pts_top = []
    pts_bot = []
    for i in range(ov_segs):
        angle = (i / ov_segs) * 2 * math.pi
        px = cx + ia * math.cos(angle)
        pz = cz + ib * math.sin(angle)
        
        # Calcular Y da cupula nessa coordenada
        r = math.sqrt(px*px + pz*pz)
        r_clamped = min(r, r_dome)
        dome_y = y0 + dome_h * (1.0 - (r_clamped / r_dome)**2)
        
        slot_top_y = dome_y + raise_h - 0.0003
        slot_bot_y = slot_top_y - slot_depth
        
        pts_top.append([px, slot_top_y, pz])
        pts_bot.append([px, slot_bot_y, pz])

    # Fundo do slot
    # Altura do centro do fundo
    r_center = cx
    dome_y_center = y0 + dome_h * (1.0 - (r_center / r_dome)**2)
    slot_bot_h_center = dome_y_center + raise_h - 0.0003 - slot_depth

    ci = len(verts)
    verts.append([cx, slot_bot_h_center, cz]); norms.append([0,1,0]); uvs.append([0.5,0.5])
    ri_s = len(verts)
    for i in range(ov_segs):
        verts.append(pts_bot[i]); norms.append([0,1,0])
        uvs.append([0.5+0.5*math.cos((i/ov_segs)*2*math.pi), 0.5+0.5*math.sin((i/ov_segs)*2*math.pi)])
    for i in range(ov_segs):
        idxs += [ci, ri_s + i, ri_s + (i+1)%ov_segs]

    # Paredes internas do slot (inward normals)
    for i in range(ov_segs):
        nxt = (i+1) % ov_segs
        s = len(verts)
        verts += [pts_top[i], pts_bot[i], pts_top[nxt], pts_bot[nxt]]
        mx = (pts_top[i][0]+pts_top[nxt][0])/2 - cx
        mz = (pts_top[i][2]+pts_top[nxt][2])/2 - cz
        n = norm3([-mx/(ia*ia), 0, -mz/(ib*ib)])
        norms += [n,n,n,n]
        uvs += [[0,0],[0,1],[1,0],[1,1]]
        idxs += [s, s+1, s+2,  s+1, s+3, s+2]

    return verts, norms, idxs, uvs


def make_vent_bump(r_dome, dome_h, y0, segs=18):
    """Pequeno bumpo de ventilacao no lado oposto ao slot"""
    verts, norms, idxs, uvs = [], [], [], []

    bx = -r_dome * 0.60
    bz = 0.0
    br = r_dome * 0.07
    bh = 0.0028

    t_b = 0.60
    base_h = y0 + dome_h * (1.0 - t_b * t_b)

    # Parede lateral do bump
    for i in range(segs + 1):
        a = (i / segs) * 2 * math.pi
        ca, sa = math.cos(a), math.sin(a)
        verts += [[bx + br*ca, base_h, bz + br*sa], [bx + br*ca, base_h+bh, bz + br*sa]]
        norms += [[ca, 0, sa], [ca, 0, sa]]
        uvs += [[i/segs, 0], [i/segs, 1]]
    for i in range(segs):
        b = i * 2
        idxs += [b, b+2, b+1,  b+1, b+2, b+3]

    # Topo do bump
    ci = len(verts)
    verts.append([bx, base_h+bh, bz]); norms.append([0,1,0]); uvs.append([0.5,0.5])
    ri_b = len(verts)
    for i in range(segs):
        a = (i/segs)*2*math.pi
        verts.append([bx+br*math.cos(a), base_h+bh, bz+br*math.sin(a)])
        norms.append([0,1,0]); uvs.append([0.5+0.5*math.cos(a), 0.5+0.5*math.sin(a)])
    for i in range(segs):
        nxt = (i+1)%segs
        idxs += [ci, ri_b+i, ri_b+nxt]

    return verts, norms, idxs, uvs


# ───────────────────────── GLB Builder ─────────────────────────

def build_glb(meshes_data, texture_image_bytes=None):
    buffer_data = bytearray()
    accessors, buffer_views, meshes, materials = [], [], [], []

    def pad4():
        while len(buffer_data) % 4:
            buffer_data.extend(b'\x00')

    def add_buf(data, target):
        pad4()
        offset = len(buffer_data)
        buffer_data.extend(data)
        bv = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": offset,
                              "byteLength": len(data), "target": target})
        return bv

    # Add image to buffer if present
    image_bv_idx = None
    if texture_image_bytes:
        pad4()
        offset = len(buffer_data)
        buffer_data.extend(texture_image_bytes)
        image_bv_idx = len(buffer_views)
        # Note: image buffer view doesn't have a target
        buffer_views.append({
            "buffer": 0,
            "byteOffset": offset,
            "byteLength": len(texture_image_bytes)
        })

    for md in meshes_data:
        verts  = md['vertices']
        norms  = md['normals']
        idxs   = md['indices']
        uvs    = md['uvs']
        color  = md['color']
        name   = md['name']

        mat_i = len(materials)
        mat_def = {
            "name": name + "_mat",
            "pbrMetallicRoughness": {
                "baseColorFactor": color,
                "metallicFactor": md.get('metallic', 0.02),
                "roughnessFactor": md.get('roughness', 0.65)
            },
            "doubleSided": True,
            "alphaMode": "OPAQUE"
        }
        
        # Link texture if specified and available
        if md.get('has_texture') and image_bv_idx is not None:
            mat_def["pbrMetallicRoughness"]["baseColorTexture"] = {
                "index": 0,
                "texCoord": 0
            }
            # Set baseColorFactor to white so it doesn't tint or alter the texture's original colors
            mat_def["pbrMetallicRoughness"]["baseColorFactor"] = [1.0, 1.0, 1.0, 1.0]

        materials.append(mat_def)

        vb   = add_buf(pack_floats(verts), 34962)
        vmin, vmax = bounds3(verts)
        va   = len(accessors)
        accessors.append({"bufferView": vb, "byteOffset": 0,
                          "componentType": 5126, "count": len(verts),
                          "type": "VEC3", "min": vmin, "max": vmax})

        nb   = add_buf(pack_floats(norms), 34962)
        na   = len(accessors)
        accessors.append({"bufferView": nb, "byteOffset": 0,
                          "componentType": 5126, "count": len(norms), "type": "VEC3"})

        ub   = add_buf(pack_floats(uvs), 34962)
        ua   = len(accessors)
        accessors.append({"bufferView": ub, "byteOffset": 0,
                          "componentType": 5126, "count": len(uvs), "type": "VEC2"})

        ib   = add_buf(pack_uints(idxs), 34963)
        ia   = len(accessors)
        accessors.append({"bufferView": ib, "byteOffset": 0,
                          "componentType": 5125, "count": len(idxs), "type": "SCALAR"})

        meshes.append({"name": name, "primitives": [{
            "attributes": {"POSITION": va, "NORMAL": na, "TEXCOORD_0": ua},
            "indices": ia, "material": mat_i
        }]})

    nodes  = [{"mesh": i, "name": meshes[i]["name"]} for i in range(len(meshes))]
    gltf   = {
        "asset": {"version": "2.0", "generator": "CoffeeCupGen-v2"},
        "scene": 0, "scenes": [{"nodes": list(range(len(nodes)))}],
        "nodes": nodes, "meshes": meshes, "accessors": accessors,
        "bufferViews": buffer_views, "materials": materials,
        "buffers": [{"byteLength": len(buffer_data)}]
    }

    if image_bv_idx is not None:
        gltf["images"] = [{
            "bufferView": image_bv_idx,
            "mimeType": "image/png"
        }]
        gltf["textures"] = [{
            "sampler": 0,
            "source": 0
        }]
        gltf["samplers"] = [{
            "magFilter": 9729,
            "minFilter": 9987,
            "wrapS": 10497,
            "wrapT": 10497
        }]

    json_b = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(json_b) % 4: json_b += b' '
    bin_b  = bytes(buffer_data)
    while len(bin_b)  % 4: bin_b  += b'\x00'

    total = 12 + 8 + len(json_b) + 8 + len(bin_b)
    glb = bytearray()
    glb += struct.pack('<III', 0x46546C67, 2, total)
    glb += struct.pack('<II',  len(json_b), 0x4E4F534A); glb += json_b
    glb += struct.pack('<II',  len(bin_b),  0x004E4942); glb += bin_b
    return bytes(glb)


# ───────────────────────── Main ─────────────────────────

def main():
    import os
    from PIL import Image, ImageEnhance

    CUP_H    = 0.10
    R_BOT    = 0.035
    R_TOP    = 0.045
    DOME_R   = R_TOP          # raio base da cupula = topo do copo
    DOME_H   = 0.005          # altura da abobada (5mm) - tampa mais fina
    FLANGE_R = R_TOP + 0.003  # raio externo da borda snap-on (3mm maior) - mais elegante
    RIM_H    = 0.007          # altura da borda snap-on descendo (7mm) - tampa mais fina

    SEGS = 56  # segmentos de revolucao (mais = mais suave)

    # Cor da tampa: marrom escuro / quase preto plastico
    LID_COLOR  = [0.055, 0.035, 0.028, 1.0]
    # Cor do slot: quase preto (simula profundidade/abertura)
    SLOT_COLOR = [0.04, 0.02, 0.01, 1.0]

    # Carregar imagem de textura para o copo
    img_path = r"c:\Users\carol\Documents\SITE SIMOL\artecopo.png"
    texture_bytes = None
    if os.path.exists(img_path):
        print(f"Lendo imagem de textura de: {img_path}")
        img = Image.open(img_path).convert("RGBA")
        img = ImageEnhance.Color(img).enhance(1.35)
        img = ImageEnhance.Contrast(img).enhance(1.28)
        pixels = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = pixels[x, y]
                if min(255 - r, 255 - g, 255 - b) > 18 or max(r, g, b) < 242:
                    pixels[x, y] = (
                        max(0, int(r * 0.68)),
                        max(0, int(g * 0.68)),
                        max(0, int(b * 0.68)),
                        255
                    )
                else:
                    pixels[x, y] = (255, 255, 255, 255)
        out = BytesIO()
        img.save(out, format="PNG", optimize=True)
        texture_bytes = out.getvalue()
        print(f"Textura reforcada carregada: {len(texture_bytes):,} bytes")
    else:
        print(f"Aviso: Arquivo de textura nao encontrado em: {img_path}")

    # ── Corpo do copo ──
    cv, cn, ci, cu = make_cup_body(R_BOT, R_TOP, CUP_H, SEGS)

    # ── Cupula da tampa ──
    dv, dn, di, du = make_dome(DOME_R, DOME_H, y0=CUP_H, segs=SEGS, rings=14)

    # ── Borda snap-on ──
    rv, rn, ri, ru = make_snap_rim(DOME_R, FLANGE_R, RIM_H, y0=CUP_H, segs=SEGS)

    # ── Plataforma do slot de beber ──
    pv, pn, pi2, pu = make_spout_platform(DOME_R, DOME_H, CUP_H)

    # ── Interior recuado do slot ──
    sv, sn, si2, su = make_spout_slot(DOME_R, DOME_H, CUP_H)

    # ── Bumpo de ventilacao ──
    bv, bn, bi2, bu = make_vent_bump(DOME_R, DOME_H, CUP_H)

    meshes_data = [
        {
            "name": "cup_body",
            "vertices": cv, "normals": cn, "indices": ci, "uvs": cu,
            "color": [1.0, 1.0, 1.0, 1.0],
            "metallic": 0.0, "roughness": 0.55,
            "has_texture": True
        },
        {
            "name": "lid_dome",
            "vertices": dv, "normals": dn, "indices": di, "uvs": du,
            "color": LID_COLOR, "metallic": 0.04, "roughness": 0.50
        },
        {
            "name": "lid_snap_rim",
            "vertices": rv, "normals": rn, "indices": ri, "uvs": ru,
            "color": LID_COLOR, "metallic": 0.04, "roughness": 0.50
        },
        {
            "name": "lid_spout_platform",
            "vertices": pv, "normals": pn, "indices": pi2, "uvs": pu,
            "color": [0.075, 0.047, 0.037, 1.0],
            "metallic": 0.03, "roughness": 0.45
        },
        {
            "name": "lid_spout_slot",
            "vertices": sv, "normals": sn, "indices": si2, "uvs": su,
            "color": SLOT_COLOR, "metallic": 0.0, "roughness": 0.90
        },
        {
            "name": "lid_vent_bump",
            "vertices": bv, "normals": bn, "indices": bi2, "uvs": bu,
            "color": LID_COLOR, "metallic": 0.04, "roughness": 0.50
        },
    ]

    glb_data = build_glb(meshes_data, texture_bytes)

    out_path = r"c:\Users\carol\Documents\SITE SIMOL\copo_cafe.glb"
    with open(out_path, 'wb') as f:
        f.write(glb_data)

    total_verts = sum(len(m['vertices']) for m in meshes_data)
    total_tris  = sum(len(m['indices']) // 3 for m in meshes_data)

    print("Modelo GLB gerado com sucesso!")
    print(f"Arquivo : {out_path}")
    print(f"Tamanho : {len(glb_data):,} bytes")
    print(f"Vertices: {total_verts:,}  |  Triangulos: {total_tris:,}")
    print("")
    print("Partes da tampa:")
    print("  [1] Cupula arredondada (abobada parabolica)")
    print("  [2] Borda snap-on com labio de encaixe")
    print("  [3] Plataforma oval elevada (area de beber)")
    print("  [4] Slot recuado escuro (simula abertura)")
    print("  [5] Bumpo de ventilacao (lado oposto)")


if __name__ == "__main__":
    main()
