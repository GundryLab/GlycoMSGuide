#!/usr/bin/env python3
"""Generate the GlycoMSGuide 'Monoisotopic peak selection' example figure.

Every number shown in the figure is computed here from elemental formulas:
monoisotopic masses from exact atomic masses, isotope envelopes from IUPAC
isotope abundances (cluster centroids, i.e. isotopic fine structure not resolved).

Example: HexNAc(4)Hex(5)Neu5Ac(1) vs HexNAc(4)Hex(5)Fuc(2), neutral,
underivatized, free reducing end.

Usage: python3 make_offbyone_figure.py [output_basename]
Writes <basename>.png (3548 x 1774 px) and <basename>.svg.
"""
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import FancyBboxPatch, Polygon, Rectangle, Circle  # noqa: E402

# ---------------------------------------------------------------- chemistry
ISOTOPES = {  # (exact mass, abundance), IUPAC
    "C": [(12.0, 0.9893), (13.00335483507, 0.0107)],
    "H": [(1.00782503207, 0.999885), (2.0141017778, 0.000115)],
    "N": [(14.0030740048, 0.99636), (15.0001088982, 0.00364)],
    "O": [(15.99491461956, 0.99757), (16.99913170, 0.00038), (17.9991610, 0.00205)],
}
RESIDUE = {  # residue (in-chain) formulas
    "Hex": {"C": 6, "H": 10, "O": 5},
    "HexNAc": {"C": 8, "H": 13, "N": 1, "O": 5},
    "Fuc": {"C": 6, "H": 10, "O": 4},
    "Neu5Ac": {"C": 11, "H": 17, "N": 1, "O": 8},
}
WATER = {"H": 2, "O": 1}
C13_SHIFT = ISOTOPES["C"][1][0] - ISOTOPES["C"][0][0]  # 1.0033548


def add(*forms, counts=None):
    out = {}
    counts = counts or [1] * len(forms)
    for f, n in zip(forms, counts):
        for el, k in f.items():
            out[el] = out.get(el, 0) + k * n
    return out


def mono(f):
    return sum(ISOTOPES[el][0][0] * k for el, k in f.items())


def envelope(f, n=5):
    """Relative abundance (max=100) and centroid mass of M, M+1, ... M+n-1."""
    p = np.zeros(n)
    pm = np.zeros(n)  # sum of probability * mass
    p[0] = 1.0
    for el, k in f.items():
        for _ in range(k):
            q = np.zeros(n)
            qm = np.zeros(n)
            for shift, (m, a) in enumerate(ISOTOPES[el]):
                if shift >= n:
                    continue
                q[shift:] += p[: n - shift] * a
                qm[shift:] += (pm[: n - shift] + p[: n - shift] * m) * a
            p, pm = q, qm
    return p / p.max() * 100, pm / p


def formula_str(f):
    sub = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")
    return "".join(f"{el}{str(f[el]).translate(sub)}" for el in "CHNO" if f.get(el))


SIA = add(RESIDUE["Hex"], RESIDUE["HexNAc"], RESIDUE["Neu5Ac"], WATER, counts=[5, 4, 1, 1])
FUC2 = add(RESIDUE["Hex"], RESIDUE["HexNAc"], RESIDUE["Fuc"], WATER, counts=[5, 4, 2, 1])
m_sia, m_fuc2 = mono(SIA), mono(FUC2)
ab_sia, cm_sia = envelope(SIA)
ab_fuc, cm_fuc = envelope(FUC2)
res_neu5ac = mono(RESIDUE["Neu5Ac"])
res_fuc = mono(RESIDUE["Fuc"])
delta_comp = 2 * res_fuc - res_neu5ac           # 1.0204
inferred = cm_sia[1]                            # M+1 centroid taken as monoisotopic
resid = m_fuc2 - inferred                       # ~0.0171 Da
resid_ppm = resid / m_fuc2 * 1e6

# M+1 / M crossover for underivatized glycans (HexNAc(n)Hex(n) series, interpolated)
def crossover_mass():
    xs, ys = [], []
    for k in range(2, 12):
        f = add(RESIDUE["Hex"], RESIDUE["HexNAc"], WATER, counts=[k, k, 1])
        ab, _ = envelope(f, 2)
        xs.append(mono(f)); ys.append(ab[1] / ab[0])
    return float(np.interp(1.0, ys, xs))

CROSS = crossover_mass()


def crossover_range():
    """M+1 = M crossover for several underivatized N-glycan series."""
    series = [
        lambda k: add(RESIDUE["HexNAc"], RESIDUE["Hex"], WATER, counts=[2, k, 1]),
        lambda k: add(RESIDUE["HexNAc"], RESIDUE["Hex"], WATER, counts=[k, k, 1]),
        lambda k: add(RESIDUE["HexNAc"], RESIDUE["Hex"], RESIDUE["Neu5Ac"], WATER,
                      counts=[k, k, k // 2, 1]),
        lambda k: add(RESIDUE["HexNAc"], RESIDUE["Hex"], RESIDUE["Fuc"], WATER,
                      counts=[k, k, k // 2, 1]),
    ]
    out = []
    for build in series:
        xs, ys = [], []
        for k in range(1, 30):
            f = build(k)
            ab, _ = envelope(f, 2)
            xs.append(mono(f)); ys.append(ab[1] / ab[0])
        out.append(float(np.interp(1.0, ys, xs)))
    return min(out), max(out)


CROSS_RANGE = crossover_range()
resid13 = m_fuc2 - (m_sia + C13_SHIFT)
resid13_ppm = resid13 / m_fuc2 * 1e6

# ---------------------------------------------------------------- styling
NAVY = "#14325c"
BLUE = "#1f5fbf"
RED = "#c0392b"
GREEN = "#1e7a46"
GREY = "#5b6573"
INK = "#1b1f24"
SNFG = {"GlcNAc": "#0072BC", "Man": "#00A651", "Gal": "#FFD400",
        "Neu5Ac": "#A54399", "Fuc": "#ED1C24"}
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10,
                     "svg.fonttype": "none", "axes.linewidth": 0.8})


def draw_symbol(ax, kind, x, y, s=0.32):
    kw = dict(edgecolor="black", linewidth=0.9, zorder=3)
    if kind == "GlcNAc":
        ax.add_patch(Rectangle((x - s / 2, y - s / 2), s, s, facecolor=SNFG[kind], **kw))
    elif kind in ("Man", "Gal"):
        ax.add_patch(Circle((x, y), s / 2 * 1.08, facecolor=SNFG[kind], **kw))
    elif kind == "Neu5Ac":
        d = s / 2 * 1.25
        ax.add_patch(Polygon([(x, y + d), (x + d, y), (x, y - d), (x - d, y)],
                             facecolor=SNFG[kind], **kw))
    elif kind == "Fuc":
        d = s / 2 * 1.1
        ax.add_patch(Polygon([(x, y + d), (x + d, y - d * 0.85), (x - d, y - d * 0.85)],
                             facecolor=SNFG[kind], **kw))


def draw_glycan(ax, nodes, edges):
    """nodes: {id: (kind, x, y)}; edges: (child, parent, label, label_xy_offset)."""
    for child, parent, lab, (dx, dy) in edges:
        _, x1, y1 = nodes[child]
        _, x2, y2 = nodes[parent]
        ax.plot([x1, x2], [y1, y2], color="black", lw=0.9, zorder=1)
        ax.text((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy, lab, fontsize=6.6,
                ha="center", va="center", color=INK, zorder=4)
    for kind, x, y in nodes.values():
        draw_symbol(ax, kind, x, y)


def core_nodes():
    return {
        "R": ("GlcNAc", 5.0, 0.0), "G2": ("GlcNAc", 4.0, 0.0), "BM": ("Man", 3.0, 0.0),
        "M6": ("Man", 2.15, 0.75), "M3": ("Man", 2.15, -0.75),
        "N6": ("GlcNAc", 1.2, 0.75), "N3": ("GlcNAc", 1.2, -0.75),
        "L6": ("Gal", 0.25, 0.75), "L3": ("Gal", 0.25, -0.75),
    }


def core_edges():
    return [
        ("G2", "R", "β4", (0, 0.17)), ("BM", "G2", "β4", (0, 0.17)),
        ("M6", "BM", "α6", (0.12, 0.2)), ("M3", "BM", "α3", (0.12, -0.2)),
        ("N6", "M6", "β2", (0, 0.17)), ("N3", "M3", "β2", (0, 0.17)),
        ("L6", "N6", "β4", (0, 0.17)), ("L3", "N3", "β4", (0, 0.17)),
    ]


def glycan_sia(ax):
    n = core_nodes(); n["S"] = ("Neu5Ac", -0.7, -0.75)
    e = core_edges() + [("S", "L3", "α6", (0, 0.17))]
    draw_glycan(ax, n, e)


def glycan_fuc2(ax):
    n = core_nodes(); n["F1"] = ("Fuc", 5.0, 0.85); n["F2"] = ("Fuc", 1.2, -1.6)
    e = core_edges() + [("F1", "R", "α6", (0.17, 0)), ("F2", "N3", "α3", (0.17, 0))]
    draw_glycan(ax, n, e)


def spectrum(ax, centroids, abund, colors, xlim, fwhm=0.035):
    x = np.linspace(*xlim, 4000)
    sig = fwhm / 2.3548
    for c, a, col in zip(centroids, abund, colors):
        ax.fill_between(x, a * np.exp(-0.5 * ((x - c) / sig) ** 2), color=col, lw=0,
                        alpha=0.95, zorder=2)
        ax.plot(x, a * np.exp(-0.5 * ((x - c) / sig) ** 2), color=col, lw=0.9, zorder=2)
    ax.set_xlim(*xlim); ax.set_ylim(0, 128)
    ax.set_yticks([0, 25, 50, 75, 100])
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_facecolor("none")
    ax.tick_params(labelsize=8, length=3, color=GREY, labelcolor=GREY)
    ax.set_xlabel("Neutral mass (Da)", fontsize=8.5, color=GREY, labelpad=2)
    ax.set_ylabel("Relative abundance (%)", fontsize=8.5, color=GREY, labelpad=2)


def peak_label(ax, x, a, top, bottom, color=INK, bold=False, dy=4):
    ax.text(x, a + dy, f"{top}\n{bottom}", ha="center", va="bottom", fontsize=7.4,
            color=color, fontweight="bold" if bold else "normal", linespacing=1.15)


def card(fig, rect, face, edge):
    fig.patches.append(FancyBboxPatch((rect[0], rect[1]), rect[2], rect[3],
                                      boxstyle="round,pad=0.004,rounding_size=0.008",
                                      transform=fig.transFigure, facecolor=face,
                                      edgecolor=edge, linewidth=1.0, zorder=-5))


# ---------------------------------------------------------------- figure
def build(out):
    fig = plt.figure(figsize=(17.74, 8.87), dpi=200)
    fig.patch.set_facecolor("white")

    fig.text(0.5, 0.955, "Monoisotopic Peak Selection and a Near-Isobaric Composition",
             ha="center", va="center", fontsize=19, fontweight="bold", color=NAVY)
    fig.text(0.5, 0.913,
             "Calculated example (neutral, underivatized, free reducing end). Taking the M+1 peak of a "
             "Neu5Ac-containing glycan as monoisotopic gives a mass within "
             f"{resid_ppm:.1f} ppm of a composition with two Fuc instead of one Neu5Ac.",
             ha="center", va="center", fontsize=10.5, color=INK)

    panels = [
        (0.015, "#eef4fc", "#b9cdea", BLUE, "1. True composition",
         "HexNAc(4)Hex(5)Neu5Ac(1)", formula_str(SIA)),
        (0.345, "#fdf0ef", "#ecc0bb", RED, "2. Isotope selection error",
         "M+1 taken as the monoisotopic peak", "same isotope envelope as panel 1"),
        (0.675, "#eef7f1", "#b7dcc4", GREEN, "3. Alternative composition",
         "HexNAc(4)Hex(5)Fuc(2)", formula_str(FUC2)),
    ]
    pw, py, ph = 0.31, 0.385, 0.495
    for x0, face, edge, col, t1, t2, t3 in panels:
        card(fig, (x0, py, pw, ph), face, edge)
        fig.text(x0 + pw / 2, py + ph - 0.03, t1, ha="center", fontsize=14.5,
                 fontweight="bold", color=col)
        fig.text(x0 + pw / 2, py + ph - 0.062, t2, ha="center", fontsize=11.5,
                 fontweight="bold", color=INK if col != RED else RED)
        fig.text(x0 + pw / 2, py + ph - 0.088, t3, ha="center", fontsize=9, color=GREY)

    xl_sia = (m_sia - 0.6, m_sia + 4.6)
    labels = ["M", "M+1", "M+2", "M+3", "M+4"]

    # panel 1
    gax = fig.add_axes([0.018, 0.49, 0.14, 0.27]); gax.set_aspect("equal"); gax.axis("off"); gax.set_zorder(2)
    glycan_sia(gax); gax.set_xlim(-1.1, 5.4); gax.set_ylim(-2.0, 1.3)
    fig.text(0.088, 0.505, "Illustrative structure\n(linkages not established by mass)", ha="center",
             va="center", fontsize=7.6, color=GREY, style="italic", linespacing=1.2)
    ax1 = fig.add_axes([0.18, 0.5, 0.145, 0.255])
    spectrum(ax1, cm_sia, ab_sia, [BLUE] + ["#3a3f47"] * 4, xl_sia)
    for i in range(4):
        peak_label(ax1, cm_sia[i], ab_sia[i], labels[i], f"{cm_sia[i]:.4f}",
                   color=BLUE if i == 0 else INK, bold=i == 0)
    fig.text(0.17, 0.418, f"Correct monoisotopic peak: M = {m_sia:.4f} Da", ha="center",
             fontsize=10, fontweight="bold", color=BLUE)
    fig.text(0.17, 0.397, f"At this mass M is the most intense peak (M+1 ≈ {ab_sia[1]:.0f}%).",
             ha="center", fontsize=8.8, color=INK)

    # panel 2
    ax2 = fig.add_axes([0.39, 0.5, 0.265, 0.255])
    spectrum(ax2, cm_sia, ab_sia, ["#3a3f47", RED, "#3a3f47", "#3a3f47", "#3a3f47"], xl_sia)
    for i in range(4):
        peak_label(ax2, cm_sia[i], ab_sia[i], labels[i], f"{cm_sia[i]:.4f}",
                   color=RED if i == 1 else INK, bold=i == 1)
    ax2.annotate("taken as\nmonoisotopic", xy=(cm_sia[1] + 0.06, ab_sia[1] * 0.55),
                 xytext=(cm_sia[1] + 0.85, 95), fontsize=8, color=RED, ha="left",
                 arrowprops=dict(arrowstyle="->", color=RED, lw=0.9))
    fig.text(0.5, 0.418, f"Inferred neutral mass: {inferred:.4f} Da (+{inferred - m_sia:.4f} Da)",
             ha="center", fontsize=10, fontweight="bold", color=RED)
    fig.text(0.5, 0.397, "The true M peak is still present below the selected peak.",
             ha="center", fontsize=8.8, color=INK)

    # panel 3
    gax3 = fig.add_axes([0.672, 0.49, 0.14, 0.27]); gax3.set_aspect("equal"); gax3.axis("off"); gax3.set_zorder(2)
    glycan_fuc2(gax3); gax3.set_xlim(-1.1, 5.4); gax3.set_ylim(-2.0, 1.3)
    fig.text(0.742, 0.505, "Illustrative structure\n(linkages not established by mass)", ha="center",
             va="center", fontsize=7.6, color=GREY, style="italic", linespacing=1.2)
    xl_fuc = (m_fuc2 - 0.6, m_fuc2 + 4.6)
    ax3 = fig.add_axes([0.84, 0.5, 0.14, 0.255])
    spectrum(ax3, cm_fuc, ab_fuc, [GREEN] + ["#3a3f47"] * 4, xl_fuc)
    for i in range(4):
        peak_label(ax3, cm_fuc[i], ab_fuc[i], labels[i], f"{cm_fuc[i]:.4f}",
                   color=GREEN if i == 0 else INK, bold=i == 0)
    ins = ax3.inset_axes([0.44, 0.56, 0.55, 0.42])
    win = m_fuc2 * 10e-6
    ins.axvspan(m_fuc2 - win, m_fuc2 + win, color=GREEN, alpha=0.13, lw=0)
    ins.vlines(m_fuc2, 0.22, 1, color=GREEN, lw=2)
    ins.vlines(inferred, 0.22, 1, color=RED, lw=1.6, linestyles=(0, (3, 2)))
    ins.annotate("", xy=(inferred, 1.1), xytext=(m_fuc2, 1.1),
                 arrowprops=dict(arrowstyle="<->", color=INK, lw=0.8, shrinkA=0, shrinkB=0))
    ins.text((inferred + m_fuc2) / 2, 1.17, f"{resid * 1000:.1f} mDa ({resid_ppm:.1f} ppm)",
             ha="center", va="bottom", fontsize=6.4, color=INK)
    ins.text(inferred - 0.0015, 0.6, f"inferred\n{inferred:.4f}", ha="right", va="center",
             fontsize=5.8, color=RED, linespacing=1.1)
    ins.text(m_fuc2 + 0.0015, 0.6, f"Fuc(2) M\n{m_fuc2:.4f}", ha="left", va="center",
             fontsize=5.8, color=GREEN, linespacing=1.1)
    ins.text(0.5, 0.03, "±10 ppm window (shaded)", transform=ins.transAxes, ha="center",
             va="bottom", fontsize=5.6, color=GREEN)
    ins.set_xlim(m_fuc2 - 0.042, m_fuc2 + 0.042); ins.set_ylim(0, 1.6)
    ins.set_xticks([]); ins.set_yticks([])
    ins.set_facecolor("white")
    for sp in ins.spines.values():
        sp.set_color("#9aa3ad"); sp.set_linewidth(0.6)
    fig.text(0.83, 0.418, f"Expected monoisotopic peak: M = {m_fuc2:.4f} Da", ha="center",
             fontsize=10, fontweight="bold", color=GREEN)
    fig.text(0.83, 0.397, f"Differs from the inferred mass by {resid * 1000:.1f} mDa ({resid_ppm:.1f} ppm).",
             ha="center", fontsize=8.8, color=INK)

    # legend for symbols
    lax = fig.add_axes([0.085, 0.095, 0.3, 0.05]); lax.axis("off"); lax.set_zorder(2)
    lax.set_xlim(0, 11); lax.set_ylim(-0.6, 0.6); lax.set_aspect("equal", anchor="W")
    fig.text(0.03, 0.12, "SNFG symbols:", fontsize=8.5, color=GREY, va="center")
    items = [("GlcNAc", "GlcNAc"), ("Man", "Man"), ("Gal", "Gal"), ("Neu5Ac", "Neu5Ac"), ("Fuc", "Fuc")]
    for i, (k, lab) in enumerate(items):
        draw_symbol(lax, k, 0.3 + i * 2.2, 0.0, s=0.4)
        lax.text(0.62 + i * 2.2, 0.0, lab, fontsize=8.5, va="center", color=GREY)

    # mass comparison card
    card(fig, (0.015, 0.085, 0.47, 0.275), "#fbf6e6", "#e6d39a")
    fig.text(0.03, 0.33, "Mass comparison (monoisotopic)", fontsize=13, fontweight="bold", color=NAVY)
    rows = [
        ("Neu5Ac residue (C₁₁H₁₇NO₈)", f"{res_neu5ac:.4f} Da"),
        ("2 × Fuc residue (C₁₂H₂₀O₈)", f"{2 * res_fuc:.4f} Da"),
        ("Composition difference (2 Fuc − Neu5Ac)", f"+{delta_comp:.4f} Da"),
        ("M+1 − M (isotope cluster centroid)", f"+{inferred - m_sia:.4f} Da"),
        ("¹³C − ¹²C", f"+{C13_SHIFT:.5f} Da"),
    ]
    for i, (k, v) in enumerate(rows):
        y = 0.297 - i * 0.026
        fig.text(0.03, y, k, fontsize=9.6, color=INK)
        fig.text(0.255, y, v, fontsize=9.6, color=INK, fontweight="bold", ha="right")
    fig.text(0.285, 0.297, f"HexNAc(4)Hex(5)Neu5Ac(1)", fontsize=9.6, color=INK)
    fig.text(0.475, 0.297, f"{m_sia:.4f} Da", fontsize=9.6, color=INK, fontweight="bold", ha="right")
    fig.text(0.285, 0.271, f"HexNAc(4)Hex(5)Fuc(2)", fontsize=9.6, color=INK)
    fig.text(0.475, 0.271, f"{m_fuc2:.4f} Da", fontsize=9.6, color=INK, fontweight="bold", ha="right")
    fig.text(0.285, 0.237, "Residual after the isotope error:", fontsize=9.6, color=INK)
    fig.text(0.285, 0.209, f"{m_fuc2:.4f} − {inferred:.4f}", fontsize=9.6, color=INK)
    fig.text(0.475, 0.209, f"{resid:.4f} Da", fontsize=9.6, color=RED, fontweight="bold", ha="right")
    fig.text(0.475, 0.183, f"= {resid_ppm:.1f} ppm", fontsize=9.6, color=RED, fontweight="bold", ha="right")

    # key points card
    card(fig, (0.5, 0.085, 0.485, 0.275), "#eef4fc", "#b9cdea")
    fig.text(0.515, 0.33, "Key points", fontsize=13, fontweight="bold", color=NAVY)
    lo, hi = CROSS_RANGE
    pts = [
        f"The {resid_ppm:.1f} ppm residual lies inside a ±10 ppm precursor search window (an example "
        "setting), so the wrong composition can look like an excellent match.",
        f"M+1/M is set by elemental composition, chiefly carbon count ({ab_sia[1]:.0f}% here, "
        f"C{str(SIA['C']).translate(str.maketrans('0123456789', '₀₁₂₃₄₅₆₇₈₉'))}). M+1 exceeds M at "
        f"≈87–88 C, i.e. ~{lo / 1000:.1f}–{hi / 1000:.1f} kDa for underivatized glycans and lower mass "
        "for permethylated glycans and glycopeptides. Mis-selection also occurs when M is weak, noisy, "
        "or overlapped.",
        "Assign the monoisotopic peak (isotope-envelope fit) before composition matching. Fuc(2) "
        f"predicts no signal at {m_sia:.4f} Da; a peak there with the expected M : M+1 ratio "
        "indicates the Neu5Ac composition.",
        "Seek supporting MS/MS evidence, e.g. Y-ion losses of 291.095 (Neu5Ac) vs 146.058 (Fuc), and "
        "Neu5Ac oxonium ions (m/z 274.092, 292.103), which depend on fragmentation method and can "
        "arise from co-isolated precursors. Such ions support the composition, not the linkage; "
        "their absence does not exclude Neu5Ac.",
    ]
    import textwrap
    y = 0.305
    for p in pts:
        lines = textwrap.wrap(p, 116)
        fig.text(0.517, y, "•", fontsize=9.6, color=NAVY, fontweight="bold", va="top")
        fig.text(0.527, y, "\n".join(lines), fontsize=9.0, color=INK, va="top",
                 linespacing=1.25, transform=fig.transFigure)
        y -= 0.0215 * len(lines) + 0.006
    # (bullets are top-aligned; nudge bullet glyphs to match)

    fig.text(0.5, 0.042,
             f"Simulated spectra. Masses from elemental formulas ({formula_str(SIA)}, {formula_str(FUC2)}) "
             "and exact atomic masses; isotope distributions from IUPAC abundances of C, H, N and O, plotted at "
             "isotope-cluster centroids (fine structure unresolved).\n"
             f"Centroid M+1 − M = +{inferred - m_sia:.5f} Da for this formula; the single-¹³C spacing (+{C13_SHIFT:.5f} Da) would give "
             f"{resid13 * 1000:.1f} mDa ({resid13_ppm:.1f} ppm). Structures are illustrative isomers; "
             "the compositions alone do not establish linkage, branching or residue placement.",
             ha="center", va="center", fontsize=8.1, color=GREY, linespacing=1.4)

    fig.savefig(out + ".png", dpi=200, facecolor="white")
    fig.savefig(out + ".svg", facecolor="white")
    print(f"M(Neu5Ac) {m_sia:.4f}  M+1 {inferred:.4f}  M(Fuc2) {m_fuc2:.4f}  "
          f"resid {resid:.4f} Da {resid_ppm:.2f} ppm  crossover {CROSS:.0f} Da")
    print("Neu5Ac env", np.round(ab_sia, 1), np.round(cm_sia, 4))
    print("Fuc2 env", np.round(ab_fuc, 1), np.round(cm_fuc, 4))


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "off-by-one-composition-example")
