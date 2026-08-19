from pathlib import Path
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak, KeepTogether, HRFlowable

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "digital-products" / "paid"
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)

PRODUCTS = {
    "7-day-body-ritual-guide.md": ("7-day-body-ritual-guide.pdf", "7-Day Body Ritual Guide", "A calmer week. Fewer unresolved product decisions."),
    "bathroom-reset-checklist-cards.md": ("bathroom-reset-cards.pdf", "Bathroom Reset Checklist Cards", "Ten practical prompts for a space that is easier to reset."),
    "ritual-journal.md": ("ritual-journal.pdf", "Kunta Naturals Ritual Journal", "Notice what earns a place in your real routine."),
    "self-care-planner.md": ("self-care-planner.pdf", "Kunta Naturals Self-Care Planner", "Decide before the week gets busy."),
    "natural-glow-scent-ritual-bundle.md": ("glow-scent-bundle.pdf", "Natural Glow + Scent Ritual Bundle", "Coordinate what you own before adding more."),
    "kunta-naturals-ritual-vault.md": ("ritual-vault.pdf", "Kunta Naturals Ritual Vault", "The complete system for building, deciding, and maintaining."),
}

BROWN = colors.HexColor("#2E2119")
CREAM = colors.HexColor("#F7EFE3")
SAND = colors.HexColor("#E8D6BD")
GREEN = colors.HexColor("#536B45")
GOLD = colors.HexColor("#C9974A")
WHITE = colors.HexColor("#FFFAF2")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverEyebrow", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=GREEN, alignment=TA_CENTER, spaceAfter=18, tracking=2))
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Times-Bold", fontSize=31, leading=33, textColor=BROWN, alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name="CoverSub", parent=styles["Normal"], fontName="Helvetica", fontSize=13, leading=19, textColor=BROWN, alignment=TA_CENTER, spaceAfter=24))
styles.add(ParagraphStyle(name="H1K", parent=styles["Heading1"], fontName="Times-Bold", fontSize=24, leading=27, textColor=BROWN, spaceBefore=8, spaceAfter=12))
styles.add(ParagraphStyle(name="H2K", parent=styles["Heading2"], fontName="Times-Bold", fontSize=17, leading=20, textColor=BROWN, spaceBefore=14, spaceAfter=8))
styles.add(ParagraphStyle(name="H3K", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=GREEN, spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyK", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.2, leading=15.5, textColor=BROWN, spaceAfter=8))
styles.add(ParagraphStyle(name="BulletK", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.2, leading=15.5, textColor=BROWN, leftIndent=17, firstLineIndent=-10, bulletIndent=4, spaceAfter=5))
styles.add(ParagraphStyle(name="CalloutK", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10.2, leading=15, textColor=GREEN, leftIndent=12, rightIndent=12, borderColor=SAND, borderWidth=1, borderPadding=10, backColor=WHITE, spaceBefore=7, spaceAfter=10))

def clean_inline(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
    return text.replace("&", "&amp;").replace("&amp;lt;", "&lt;").replace("&amp;gt;", "&gt;")

def page_chrome(canvas, doc):
    canvas.saveState()
    w, h = letter
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setStrokeColor(SAND)
    canvas.line(0.7*inch, 0.58*inch, w-0.7*inch, 0.58*inch)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(GREEN)
    canvas.drawString(0.72*inch, 0.38*inch, "KUNTA NATURALS  |  PURE. ROOTED. REAL.")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(BROWN)
    canvas.drawRightString(w-0.72*inch, 0.38*inch, str(doc.page))
    canvas.restoreState()

def build(source_name, target_name, title, subtitle):
    target = OUTPUT / target_name
    doc = BaseDocTemplate(str(target), pagesize=letter, rightMargin=0.72*inch, leftMargin=0.72*inch, topMargin=0.72*inch, bottomMargin=0.82*inch, title=title, author="Kunta Naturals", subject=subtitle)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body", showBoundary=0)
    doc.addPageTemplates(PageTemplate(id="Kunta", frames=frame, onPage=page_chrome))
    story = [Spacer(1, 0.68*inch), Paragraph("KUNTA NATURALS", styles["CoverEyebrow"]), Paragraph(clean_inline(title), styles["CoverTitle"]), HRFlowable(width="30%", thickness=2, color=GOLD, spaceBefore=6, spaceAfter=22, hAlign="CENTER"), Paragraph(clean_inline(subtitle), styles["CoverSub"]), Spacer(1, 0.3*inch), Paragraph("A practical self-care organization tool. General education only; no diagnosis, treatment, or guaranteed outcomes.", styles["CalloutK"]), Spacer(1, 0.75*inch), Paragraph("© Kunta Naturals", styles["CoverEyebrow"]), PageBreak()]
    lines = (SOURCE / source_name).read_text(encoding="utf-8").splitlines()
    for raw in lines:
        line = raw.strip()
        if not line or line == "---":
            story.append(Spacer(1, 5))
            continue
        if line.startswith("# "):
            if clean_inline(line[2:]).lower().replace("&amp;", "&") == title.lower():
                continue
            story.append(Paragraph(clean_inline(line[2:]), styles["H1K"]))
        elif line.startswith("## "):
            story.append(KeepTogether([Spacer(1, 4), Paragraph(clean_inline(line[3:]), styles["H2K"])]))
        elif line.startswith("### "):
            story.append(Paragraph(clean_inline(line[4:]), styles["H3K"]))
        elif re.match(r"^[-*] ", line):
            story.append(Paragraph("• " + clean_inline(line[2:]), styles["BulletK"]))
        elif re.match(r"^\d+\. ", line):
            num, body = line.split(". ", 1)
            story.append(Paragraph(f"<b>{num}.</b> {clean_inline(body)}", styles["BulletK"]))
        elif line.startswith("> "):
            story.append(Paragraph(clean_inline(line[2:]), styles["CalloutK"]))
        else:
            story.append(Paragraph(clean_inline(line), styles["BodyK"]))
    story.extend([Spacer(1, 16), HRFlowable(width="100%", thickness=1, color=SAND), Spacer(1, 9), Paragraph("Use what fits. Skip what does not. Return to the simplest repeatable version.", styles["CalloutK"])])
    doc.build(story)
    return target

if __name__ == "__main__":
    for source_name, (target_name, title, subtitle) in PRODUCTS.items():
        print(build(source_name, target_name, title, subtitle))
