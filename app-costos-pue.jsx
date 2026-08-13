/* ── Identidad HH Luxury Real Estate ───────────────────────────── */
const C = {
  negro: "#0A0A0A",
  tinta: "#1C1C1C",
  gris: "#8A8A88",
  hairline: "#E2E0DC",
  papel: "#FFFFFF",
  hueso: "#F6F5F2",
  alerta: "#9A3412",
};

const DISPLAY = "'Playfair Display', 'Didot', 'Bodoni MT', Georgia, serif";
const SANS = "'Jost', 'Futura', 'Avenir Next', 'Century Gothic', sans-serif";

const CDN_JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

const SITIO = "https://lomas.hhre.mx/";
const SITIO_TXT = "lomas.hhre.mx";
const TEL_TXT = "+52 222 290 2990";
const TEL_PLANO = "+522222902990";
const TEL_URL = "tel:+522222902990";
const WA_URL = "https://wa.me/522222902990";

/* Derechos de registro: cuotas fijas, Ley de Ingresos del Estado de Puebla 2026, Art. 34-A */
const DER_COMPRAVENTA = 4975;   // inscripción de adquisición/transmisión de propiedad
const DER_HIPOTECA = 3580;      // inscripción de crédito con garantía hipotecaria
const DER_AVISOS = 1330;        // aviso preventivo con certificado (855) + segundo aviso (475)
const DER_AVISO_HIP = 855;      // aviso preventivo del crédito

/* Puebla capital usa tarifa progresiva; el resto del estado, 2% fijo */
const MUNICIPIOS = [
  "Puebla", "San Andrés Cholula", "San Pedro Cholula", "Cuautlancingo", "Amozoc",
  "Coronango", "Ocoyucan", "Atlixco", "San Martín Texmelucan", "Tehuacán",
  "Teziutlán", "San Pedro Cholula", "Huauchinango", "Tepeaca", "Otro municipio de Puebla",
].filter((m, i, a) => a.indexOf(m) === i);

/* ISABI: Puebla capital progresiva plana; resto 2% */
const calcularISABI = (base, municipio) => {
  if (municipio === "Puebla") {
    if (base <= 500000) return 0;
    if (base <= 3000000) return base * 0.018;
    return base * 0.03;
  }
  return base * 0.02;
};

const tasaISABItxt = (base, municipio) => {
  if (municipio === "Puebla") {
    if (base <= 500000) return "0% (exento hasta $500,000)";
    if (base <= 3000000) return "1.8% sobre el valor";
    return "3% sobre el valor";
  }
  return "2% sobre el valor";
};

const mxn = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }).format(
    isFinite(n) ? n : 0
  );

const limpiar = (s) => {
  const t = String(s).replace(/[^\d.]/g, "");
  const [ent, ...dec] = t.split(".");
  return dec.length ? `${ent}.${dec.join("").slice(0, 2)}` : ent;
};

const conComas = (s) => {
  if (s === "" || s === undefined) return "";
  const [ent, dec] = String(s).split(".");
  const e = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${e}.${dec}` : e;
};

const num = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isFinite(n) ? n : 0;
};

const cargarJsPDF = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
    const s = document.createElement("script");
    s.src = CDN_JSPDF;
    s.onload = () => (window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error("sin-libreria")));
    s.onerror = () => reject(new Error("sin-red"));
    document.head.appendChild(s);
  });

/* ── Subcomponentes ────────────────────────────────────────────── */
const inputBase = {
  width: "100%", boxSizing: "border-box", padding: "12px 0 10px",
  border: "none", borderBottom: `1px solid ${C.hairline}`, borderRadius: 0,
  background: "transparent", fontFamily: SANS, fontSize: 16, color: C.negro, outline: "none",
};

function Campo({ label, hint, children }) {
  return (
    <label style={{ display: "block", marginBottom: 26 }}>
      <span style={{ display: "block", fontFamily: SANS, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.gris, marginBottom: 2 }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ display: "block", fontFamily: SANS, fontSize: 11, color: C.gris, marginTop: 7 }}>{hint}</span>}
    </label>
  );
}

function Dinero({ value, onChange, placeholder = "0", oscuro = false }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", borderBottom: `1px solid ${oscuro ? "#4A4A4A" : C.hairline}` }}>
      <span style={{ fontFamily: SANS, fontSize: 15, color: oscuro ? "#9B9B99" : C.gris, paddingRight: 6 }}>$</span>
      <input
        style={{ ...inputBase, borderBottom: "none", color: oscuro ? "#FFF" : C.negro, padding: oscuro ? "6px 0 4px" : inputBase.padding }}
        inputMode="decimal"
        value={conComas(value)}
        onChange={(e) => onChange(limpiar(e.target.value))}
        placeholder={placeholder}
      />
    </div>
  );
}

function Renglon({ concepto, detalle, monto, tenue = false }) {
  return (
    <div style={{ marginBottom: 13, opacity: tenue ? 0.62 : 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: SANS, fontSize: 14, color: C.tinta }}>{concepto}</span>
        <span style={{ flex: 1, borderBottom: `1px dotted ${C.hairline}`, transform: "translateY(-3px)", minWidth: 14 }} />
        <span style={{ fontFamily: SANS, fontSize: 14.5, color: C.negro, whiteSpace: "nowrap" }}>{mxn(monto)}</span>
      </div>
      {detalle && (
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: C.gris, marginTop: 2 }}>{detalle}</div>
      )}
    </div>
  );
}

function Bloque({ titulo, subtotal, children }) {
  return (
    <section style={{ marginBottom: 38 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, borderBottom: `1.5px solid ${C.negro}`, paddingBottom: 9, marginBottom: 20 }}>
        <h3 style={{ margin: 0, flex: 1, fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: ".24em", textTransform: "uppercase", color: C.negro }}>
          {titulo}
        </h3>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: C.negro }}>{mxn(subtotal)}</span>
      </div>
      {children}
    </section>
  );
}

function Marca({ escala = 1, centrado = false }) {
  return (
    <div style={{ textAlign: centrado ? "center" : "left" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 46 * escala, lineHeight: 0.8, letterSpacing: "-.02em", color: C.negro }}>hh</div>
      <div style={{ fontFamily: SANS, fontSize: 8 * escala, fontWeight: 300, letterSpacing: ".4em", textTransform: "uppercase", color: C.negro, marginTop: 14 * escala }}>
        Luxury Real Estate
      </div>
    </div>
  );
}

/* ── Componente principal ──────────────────────────────────────── */
function CalculadoraHH() {
  const [asesor, setAsesor] = useState("");
  const [cliente, setCliente] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");
  const [catastral, setCatastral] = useState("");
  const [avaluoVal, setAvaluoVal] = useState("");
  const [conCredito, setConCredito] = useState(false);
  const [credito, setCredito] = useState("");
  const [avanzado, setAvanzado] = useState(false);

  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [generando, setGenerando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfNombre, setPdfNombre] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState("");

  const [p, setP] = useState({
    pctConstruccion: "70",
    notarial: "1.0",
    avaluoCatastral: "3500",
    gestoria: "3000",
    inspeccion: "600",
    derCompraventa: String(DER_COMPRAVENTA),
    derHipoteca: String(DER_HIPOTECA),
    avisos: String(DER_AVISOS),
    apertura: "1",
    investigacion: "750",
    spei: "128",
    avaluoBanco: "7000",
  });

  const setNum = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }));

  const r = useMemo(() => {
    const V = num(precio);
    const CT = num(catastral);
    const AV = num(avaluoVal);
    const CR = conCredito ? num(credito) : 0;
    const base = Math.max(V, CT, AV);

    /* I. Impuestos */
    const isabi = calcularISABI(base, municipio);
    const gravaIVA = tipo === "comercial";
    const baseIVA = gravaIVA ? base * (num(p.pctConstruccion) / 100) : 0;
    const iva = baseIVA * 0.16;
    const excede = AV > 0 && AV > V * 1.1;
    const isr = excede ? (AV - V) * 0.2 : 0;

    /* II. Derechos (cuotas fijas) */
    const regCompra = num(p.derCompraventa);
    const regHip = CR > 0 ? num(p.derHipoteca) : 0;
    const avisos = num(p.avisos);
    const avisosHip = CR > 0 ? DER_AVISO_HIP : 0;

    /* III. Gastos */
    const tn = num(p.notarial);
    const hon = base * (tn / 100);
    const ivaHon = hon * 0.16;
    const avaluoCat = num(p.avaluoCatastral);
    const gestoria = num(p.gestoria);
    const inspeccion = num(p.inspeccion);
    const apertura = CR * (num(p.apertura) / 100);
    const investigacion = CR > 0 ? num(p.investigacion) : 0;
    const spei = CR > 0 ? num(p.spei) : 0;
    const avaluoBanco = CR > 0 ? num(p.avaluoBanco) : 0;

    const tImp = isabi + iva + isr;
    const tDer = regCompra + regHip + avisos + avisosHip;
    const tGas = hon + ivaHon + avaluoCat + gestoria + inspeccion + apertura + investigacion + spei + avaluoBanco;
    const total = tImp + tDer + tGas;

    return {
      V, CR, base, tn, gravaIVA, excede, baseIVA,
      isabi, iva, isr, regCompra, regHip, avisos, avisosHip,
      hon, ivaHon, avaluoCat, gestoria, inspeccion, apertura, investigacion, spei, avaluoBanco,
      tImp, tDer, tGas, total,
      enganche: Math.max(V - CR, 0),
      pct: V > 0 ? (total / V) * 100 : 0,
    };
  }, [precio, catastral, avaluoVal, credito, conCredito, tipo, municipio, p]);

  const listo = r.V > 0 && !!municipio && !!tipo;
  const hoy = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const nombreTipo = tipo === "casa" ? "Casa habitación" : tipo === "comercial" ? "Comercial o mixto" : tipo === "terreno" ? "Terreno" : "";

  const secciones = () => {
    const imp = [
      { c: "ISABI — Impuesto Sobre Adquisición de Bienes Inmuebles", d: `${tasaISABItxt(r.base, municipio)}`, m: r.isabi },
      r.gravaIVA
        ? { c: "IVA sobre la construcción", d: `16% sobre ${mxn(r.baseIVA)}`, m: r.iva }
        : { c: "IVA", d: "Exento", m: 0, tenue: true },
    ];
    if (r.excede) imp.push({ c: "ISR por adquisición", d: "20% sobre la diferencia entre avalúo y precio", m: r.isr });

    const der = [{ c: "Derechos de inscripción (traslado de dominio)", d: "Cuota fija, RPP de Puebla", m: r.regCompra }];
    if (r.CR > 0) der.push({ c: "Inscripción de la hipoteca", d: "Cuota fija por el crédito", m: r.regHip });
    der.push({ c: "Avisos preventivos y certificado de gravamen", d: "Primero y segundo aviso", m: r.avisos });
    if (r.CR > 0) der.push({ c: "Aviso preventivo del crédito", d: "", m: r.avisosHip });

    const gas = [
      { c: "Honorarios notariales", d: `${r.tn}% sobre la base gravable`, m: r.hon },
      { c: "IVA sobre honorarios", d: "16%", m: r.ivaHon },
      { c: "Avalúo catastral", d: "", m: r.avaluoCat },
      { c: "Gestoría y gastos de protocolo", d: "", m: r.gestoria },
      { c: "Inspección catastral", d: "", m: r.inspeccion },
    ];
    if (r.CR > 0) {
      gas.push({ c: "Comisión bancaria por apertura", d: `${p.apertura}% sobre el crédito`, m: r.apertura });
      gas.push({ c: "Investigación y consulta de buró", d: "", m: r.investigacion });
      gas.push({ c: "SPEI / transferencia", d: "", m: r.spei });
      gas.push({ c: "Avalúo bancario", d: "Requerido por la institución", m: r.avaluoBanco });
    }

    return [
      { titulo: "Impuestos", subtotal: r.tImp, filas: imp },
      { titulo: "Derechos", subtotal: r.tDer, filas: der },
      { titulo: "Gastos", subtotal: r.tGas, filas: gas },
    ];
  };

  const NOTAS = [
    "Estimación con base en la normativa vigente en 2026 (Ley de Ingresos del Estado y de los municipios de Puebla). No sustituye la cotización de la notaría, del banco ni de la autoridad fiscal.",
    "El ISABI se causa a la tasa del 2% en la mayoría de los municipios; en el municipio de Puebla capital aplica tarifa progresiva (0% hasta $500,000, 1.8% hasta $3,000,000 y 3% por encima).",
    "La base del ISABI es el valor catastral que determine Catastro. Si el valor catastral resulta mayor, el impuesto se recalcula y el comprador cubre la diferencia.",
    "No se aplican subsidios ni exenciones por vivienda de interés social, primera vivienda, centro histórico ni regularización de la tenencia de la tierra.",
    "Honorarios notariales y gastos bancarios varían por notaría e institución. El ISR de enajenación y la manifestación de construcción corresponden al vendedor.",
  ];

  /* ── PDF: solo Helvetica y Times, fuentes base del estándar PDF.
        Sin charSpace, para que la alineación a la derecha sea exacta. ── */
  const generar = async () => {
    if (!asesor.trim()) return setError("Captura el nombre del asesor.");
    if (!cliente.trim()) return setError("Captura el nombre del cliente.");
    if (!municipio) return setError("Selecciona el municipio.");
    if (!tipo) return setError("Selecciona el tipo de inmueble.");
    if (conCredito && r.CR > r.V)
      return setError("El crédito no puede exceder el monto de compraventa. Corrige el importe.");
    setError("");
    setGenerando(true);

    try {
      const JsPDF = await cargarJsPDF();
      const doc = new JsPDF({ unit: "mm", format: "a4" });

      const M = 20, R = 190;
      let y = 18;

      const salto = (alto = 8) => {
        if (y + alto > 274) { doc.addPage(); y = 22; }
      };
      const linea = (color, grosor) => {
        doc.setDrawColor(color);
        doc.setLineWidth(grosor);
        doc.line(M, y, R, y);
      };

      /* Encabezado */
      doc.setFont("times", "normal").setFontSize(30).setTextColor(10);
      doc.text("hh", M, y);
      doc.setFont("helvetica", "normal").setFontSize(6.5);
      doc.text("L U X U R Y   R E A L   E S T A T E", M, y + 6);

      doc.setFontSize(7.5).setTextColor(120);
      doc.text("ESTIMACIÓN DE COSTOS", R, y - 3, { align: "right" });
      doc.text(hoy.toUpperCase(), R, y + 2, { align: "right" });

      y += 11;
      linea(215, 0.1);
      y += 9;

      /* Carátula */
      doc.setFont("times", "normal").setFontSize(18).setTextColor(10);
      doc.text(cliente.trim(), M, y);
      y += 6.5;

      doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(125);
      const meta = [
        `${municipio}, Pue.`,
        nombreTipo,
        `Operación ${mxn(r.V)}`,
        ...(r.CR > 0 ? [`Crédito ${mxn(r.CR)}`] : []),
        `Base gravable ${mxn(r.base)}`,
      ].join("   ·   ");
      doc.splitTextToSize(meta, R - M).forEach((ln) => { doc.text(ln, M, y); y += 4.2; });
      doc.text(`Asesor: ${asesor.trim()}`, M, y);
      y += 5.5;
      linea(10, 0.4);
      y += 9;

      /* Secciones */
      secciones().forEach((sec) => {
        salto(20);
        doc.setFont("helvetica", "bold").setFontSize(8.8).setTextColor(10);
        doc.text(sec.titulo.toUpperCase(), M, y);
        doc.setFontSize(9.6);
        doc.text(mxn(sec.subtotal), R, y, { align: "right" });
        y += 2.6;
        linea(10, 0.4);
        y += 5.6;

        sec.filas.forEach((f) => {
          salto(9);
          doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(28);
          doc.text(f.c, M, y);
          doc.setTextColor(10);
          const importe = mxn(f.m);
          doc.text(importe, R, y, { align: "right" });

          const xIni = M + doc.getTextWidth(f.c) + 2;
          const xFin = R - doc.getTextWidth(importe) - 2;
          if (xFin > xIni) {
            doc.setLineDashPattern([0.4, 0.9], 0);
            doc.setDrawColor(205).setLineWidth(0.15);
            doc.line(xIni, y - 0.9, xFin, y - 0.9);
            doc.setLineDashPattern([], 0);
          }
          y += 3.4;

          if (f.d) {
            doc.setFontSize(7).setTextColor(150);
            doc.text(f.d, M, y);
            y += 3;
          }
          y += 1.6;
        });
        y += 3.4;
      });

      /* Total */
      salto(30);
      linea(10, 0.5);
      y += 7.5;
      doc.setFont("helvetica", "bold").setFontSize(8.8).setTextColor(10);
      doc.text("TOTAL DE ESCRITURACIÓN", M, y);
      doc.setFont("times", "bold").setFontSize(18);
      doc.text(mxn(r.total), R, y + 1.2, { align: "right" });
      y += 5.4;
      doc.setFont("helvetica", "normal").setFontSize(7.2).setTextColor(150);
      doc.text(`Equivale al ${r.pct.toFixed(2)}% del valor de la operación`, M, y);
      y += 8.5;

      if (r.CR > 0) {
        salto(20);
        doc.setFillColor(246, 245, 242);
        doc.rect(M, y - 4.5, R - M, 16.5, "F");
        doc.setFontSize(8.4).setTextColor(60);
        doc.text("Enganche o diferencia a cubrir", M + 4, y + 0.5);
        doc.text(mxn(r.enganche), R - 4, y + 0.5, { align: "right" });
        doc.setFont("helvetica", "bold").setTextColor(10);
        doc.text("Recursos propios al cierre", M + 4, y + 7.5);
        doc.text(mxn(r.enganche + r.total), R - 4, y + 7.5, { align: "right" });
        doc.setFont("helvetica", "normal");
        y += 20;
      }

      /* Nota aclaratoria */
      salto(24);
      linea(215, 0.1);
      y += 5.5;
      doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(110);
      doc.text("NOTA ACLARATORIA", M, y);
      y += 4.8;
      doc.setFont("helvetica", "normal").setFontSize(6.6).setTextColor(150);
      NOTAS.forEach((n, i) => {
        const lineas = doc.splitTextToSize(`${i + 1}.  ${n}`, R - M);
        salto(lineas.length * 2.9 + 2);
        lineas.forEach((l) => { doc.text(l, M, y); y += 2.9; });
        y += 1.2;
      });

      /* Pie: contacto en un solo renglón, con enlaces activos */
      const paginas = doc.internal.getNumberOfPages();
      const yPie = 286;
      const wa = `WhatsApp ${TEL_TXT}`;

      for (let i = 1; i <= paginas; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal").setFontSize(7.4);

        let x = M;
        doc.setTextColor(10);
        doc.textWithLink(SITIO_TXT, x, yPie, { url: SITIO });
        x += doc.getTextWidth(SITIO_TXT) + 3.5;
        doc.setTextColor(195);
        doc.text("·", x, yPie);
        x += 3.5;

        doc.setTextColor(10);
        doc.textWithLink(TEL_TXT, x, yPie, { url: TEL_URL });
        x += doc.getTextWidth(TEL_TXT) + 3.5;
        doc.setTextColor(195);
        doc.text("·", x, yPie);
        x += 3.5;

        doc.setTextColor(10);
        doc.textWithLink(wa, x, yPie, { url: WA_URL });

        doc.setTextColor(165);
        doc.text(`${i} / ${paginas}`, R, yPie, { align: "right" });
      }

      const slug = cliente.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
      const nombre = `HH-estimacion-${slug}.pdf`;

      const blob = doc.output("blob");
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfNombre(nombre);
      setPdfFile(new File([blob], nombre, { type: "application/pdf" }));

      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch { /* el iframe puede bloquearla; quedan los enlaces */ }

      setClave("");
    } catch (e) {
      setError(
        e?.message === "sin-red"
          ? "No se pudo cargar el generador de PDF. Revisa la conexión."
          : `No se pudo generar el PDF: ${e?.message || "error desconocido"}`
      );
    } finally {
      setGenerando(false);
    }
  };

  const resumen = () =>
    [
      `Estimación de costos de adquisición — HH Luxury Real Estate`,
      ``,
      `Cliente: ${cliente.trim() || "Comprador"}`,
      `${municipio}, Pue. · ${nombreTipo}`,
      `Operación: ${mxn(r.V)}`,
      ...(r.CR > 0 ? [`Crédito: ${mxn(r.CR)}`] : []),
      ``,
      `Impuestos: ${mxn(r.tImp)}`,
      `Derechos: ${mxn(r.tDer)}`,
      `Gastos: ${mxn(r.tGas)}`,
      `TOTAL DE ESCRITURACIÓN: ${mxn(r.total)} (${r.pct.toFixed(2)}% del valor)`,
      ...(r.CR > 0 ? [``, `Recursos propios al cierre: ${mxn(r.enganche + r.total)}`] : []),
      ``,
      `El desglose completo va en el PDF adjunto.`,
      `${SITIO_TXT} · ${TEL_TXT}`,
    ].join("\n");

  /* Compartir nativo: adjunta el PDF y deja elegir WhatsApp, correo, etc. */
  const compartir = async () => {
    if (!pdfFile) return;
    setAviso("");
    try {
      if (navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Estimación — ${cliente.trim()}`,
          text: resumen(),
        });
      } else {
        setAviso(
          "Este navegador no permite compartir archivos. Usa WhatsApp o correo con el resumen, y adjunta el PDF descargado."
        );
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setAviso("No se pudo abrir el menú de compartir. Descarga el PDF y adjúntalo manualmente.");
      }
    }
  };

  const porWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(resumen())}`, "_blank", "noopener");
  };

  const porCorreo = () => {
    const asunto = `Estimación de costos de adquisición — ${cliente.trim()}`;
    const url = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(resumen())}`;
    /* No usar window.location: navegaría el iframe y lo dejaría en blanco. */
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setAviso("Si no se abrió tu correo, copia el resumen o adjunta el PDF descargado.");
  };

  const enlace = {
    fontFamily: SANS, fontSize: 13, color: C.negro, textDecoration: "none",
    borderBottom: `1px solid ${C.negro}`, paddingBottom: 3,
  };

  const reiniciar = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setAsesor("");
    setCliente("");
    setMunicipio("");
    setTipo("");
    setPrecio("");
    setCatastral("");
    setAvaluoVal("");
    setConCredito(false);
    setCredito("");
    setAvanzado(false);
    setClave("");
    setError("");
    setPdfUrl("");
    setPdfNombre("");
    setPdfFile(null);
    setCopiado(false);
    setAviso("");
    setP({
      pctConstruccion: "70",
      notarial: "1.0",
      avaluoCatastral: "3500",
      gestoria: "3000",
      inspeccion: "600",
      derCompraventa: String(DER_COMPRAVENTA),
      derHipoteca: String(DER_HIPOTECA),
      avisos: String(DER_AVISOS),
      apertura: "1",
      investigacion: "750",
      spei: "128",
      avaluoBanco: "7000",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.papel, paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Jost:wght@300;400;500;600&display=swap');
        input:focus, select:focus { border-bottom-color: ${C.negro} !important; }
        input::placeholder { color: #C9C7C3; }
        .hh-btn:hover:not(:disabled) { background: ${C.papel} !important; color: ${C.negro} !important; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <header style={{ borderBottom: `1px solid ${C.hairline}`, padding: "44px 24px 38px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Marca centrado />
          <div style={{ width: 30, height: 1, background: C.negro, margin: "30px auto" }} />
          <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 32, fontWeight: 400, color: C.negro, textAlign: "center" }}>
            Costos de adquisición
          </h1>
          <p style={{ margin: "12px auto 0", maxWidth: 460, fontFamily: SANS, fontSize: 13.5, fontWeight: 300, lineHeight: 1.65, color: C.gris, textAlign: "center" }}>
            Lo que un comprador desembolsa al escriturar un inmueble en Puebla: impuestos, derechos y gastos.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ padding: "44px 0 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 40px" }}>
            <Campo label="Asesor">
              <input style={inputBase} value={asesor} onChange={(e) => setAsesor(e.target.value)} placeholder="Nombre del asesor" />
            </Campo>
            <Campo label="Cliente">
              <input style={inputBase} value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del comprador" />
            </Campo>
            <Campo label="Municipio">
              <select
                style={{ ...inputBase, color: municipio ? C.negro : "#C9C7C3" }}
                value={municipio}
                onChange={(e) => { setMunicipio(e.target.value); setError(""); }}
              >
                <option value="">Selecciona el municipio</option>
                {MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Campo>
            <Campo
              label="Tipo de inmueble"
              hint={tipo === "comercial" ? "Causa IVA sobre la construcción" : tipo ? "Exento de IVA" : ""}
            >
              <select
                style={{ ...inputBase, color: tipo ? C.negro : "#C9C7C3" }}
                value={tipo}
                onChange={(e) => { setTipo(e.target.value); setError(""); }}
              >
                <option value="">Selecciona el tipo</option>
                <option value="casa">Casa habitación</option>
                <option value="comercial">Comercial o mixto</option>
                <option value="terreno">Terreno</option>
              </select>
            </Campo>
            <Campo label="Monto de compraventa">
              <Dinero value={precio} onChange={setPrecio} />
            </Campo>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", marginBottom: 26, background: conCredito ? C.negro : C.hueso }}>
            <button
              onClick={() => setConCredito(!conCredito)}
              aria-pressed={conCredito}
              style={{
                width: 42, height: 22, flexShrink: 0, borderRadius: 11, cursor: "pointer", padding: 0,
                border: `1px solid ${conCredito ? "#FFF" : C.gris}`, background: "transparent", position: "relative",
              }}
            >
              <span style={{ position: "absolute", top: 3, left: conCredito ? 22 : 3, width: 14, height: 14, borderRadius: "50%", background: conCredito ? "#FFF" : C.gris, transition: "left .2s" }} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: conCredito ? "#FFF" : C.negro }}>
                Crédito hipotecario
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: conCredito ? "#9B9B99" : C.gris, marginTop: 4 }}>
                Activa el registro de hipoteca y los gastos bancarios
              </div>
            </div>
            {conCredito && (
              <div style={{ width: 200 }}>
                <Dinero value={credito} onChange={setCredito} placeholder="Monto del crédito" oscuro />
              </div>
            )}
          </div>

          {conCredito && r.CR > r.V && r.V > 0 && (
            <div
              style={{
                marginTop: -14, marginBottom: 26, padding: "14px 18px",
                borderLeft: `3px solid ${C.alerta}`, background: "#FDF4F1",
                fontFamily: SANS, fontSize: 12.5, fontWeight: 300, color: C.alerta, lineHeight: 1.5,
              }}
            >
              El crédito ({mxn(r.CR)}) excede el monto de compraventa ({mxn(r.V)}). Ningún banco financia por encima del valor de la operación: corrige el importe.
            </div>
          )}

          <button
            onClick={() => setAvanzado(!avanzado)}
            style={{
              background: "none", border: "none", padding: "0 0 20px", cursor: "pointer", marginBottom: 30,
              fontFamily: SANS, fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase",
              color: C.negro, borderBottom: `1px solid ${C.negro}`,
            }}
          >
            {avanzado ? "Ocultar parámetros" : "Ajustar parámetros"}
          </button>

          {avanzado && (
            <div style={{ background: C.hueso, padding: "30px 26px 6px", marginBottom: 30 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0 32px" }}>
                <Campo label="Valor catastral" hint="Opcional. Base del ISABI si es mayor">
                  <Dinero value={catastral} onChange={setCatastral} />
                </Campo>
                <Campo label="Valor de avalúo" hint="Opcional. Detona ISR si excede 10% del precio">
                  <Dinero value={avaluoVal} onChange={setAvaluoVal} />
                </Campo>
                <Campo label="Honorarios notariales %" hint="Criterio conservador ~1%">
                  <Dinero value={p.notarial} onChange={setNum("notarial")} />
                </Campo>
                <Campo label="% de construcción" hint="Base de IVA en inmueble comercial">
                  <Dinero value={p.pctConstruccion} onChange={setNum("pctConstruccion")} />
                </Campo>
                <Campo label="Derechos de inscripción" hint="Cuota fija, Ley de Ingresos Edo. 2026">
                  <Dinero value={p.derCompraventa} onChange={setNum("derCompraventa")} />
                </Campo>
                <Campo label="Inscripción de hipoteca" hint="Cuota fija por el crédito">
                  <Dinero value={p.derHipoteca} onChange={setNum("derHipoteca")} />
                </Campo>
                <Campo label="Avisos y certificado"><Dinero value={p.avisos} onChange={setNum("avisos")} /></Campo>
                <Campo label="Avalúo catastral"><Dinero value={p.avaluoCatastral} onChange={setNum("avaluoCatastral")} /></Campo>
                <Campo label="Gestoría y protocolo"><Dinero value={p.gestoria} onChange={setNum("gestoria")} /></Campo>
                <Campo label="Inspección catastral"><Dinero value={p.inspeccion} onChange={setNum("inspeccion")} /></Campo>
                <Campo label="Comisión de apertura %"><Dinero value={p.apertura} onChange={setNum("apertura")} /></Campo>
                <Campo label="Investigación y buró"><Dinero value={p.investigacion} onChange={setNum("investigacion")} /></Campo>
                <Campo label="SPEI / transferencia"><Dinero value={p.spei} onChange={setNum("spei")} /></Campo>
                <Campo label="Avalúo bancario"><Dinero value={p.avaluoBanco} onChange={setNum("avaluoBanco")} /></Campo>
              </div>
            </div>
          )}
        </div>

        {!listo ? (
          <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 13.5, color: C.gris, textAlign: "center", padding: "40px 0 60px" }}>
            Captura el monto de compraventa, el municipio y el tipo de inmueble para ver el desglose.
          </p>
        ) : (
          <>
            <div style={{ border: `1px solid ${C.hairline}`, padding: "44px 46px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 30, marginBottom: 22, borderBottom: `1px solid ${C.hairline}` }}>
                <Marca escala={0.72} />
                <div style={{ textAlign: "right", fontFamily: SANS, fontSize: 10, fontWeight: 300, letterSpacing: ".16em", textTransform: "uppercase", color: C.gris, lineHeight: 2 }}>
                  <div>Estimación de costos</div>
                  <div>{hoy}</div>
                </div>
              </div>

              <div style={{ borderBottom: `1.5px solid ${C.negro}`, paddingBottom: 22, marginBottom: 36 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 27, color: C.negro }}>{cliente || "Comprador"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 30px", marginTop: 16, fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.gris }}>
                  <span>{municipio}, Pue.</span>
                  <span>{nombreTipo}</span>
                  <span>Operación <b style={{ fontWeight: 500, color: C.negro }}>{mxn(r.V)}</b></span>
                  {r.CR > 0 && <span>Crédito <b style={{ fontWeight: 500, color: C.negro }}>{mxn(r.CR)}</b></span>}
                  <span>Base gravable <b style={{ fontWeight: 500, color: C.negro }}>{mxn(r.base)}</b></span>
                </div>
                {asesor.trim() && (
                  <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.gris }}>
                    Asesor <b style={{ fontWeight: 500, color: C.negro }}>{asesor}</b>
                  </div>
                )}
              </div>

              {secciones().map((sec) => (
                <Bloque key={sec.titulo} titulo={sec.titulo} subtotal={sec.subtotal}>
                  {sec.filas.map((f) => (
                    <Renglon key={f.c} concepto={f.c} detalle={f.d} monto={f.m} tenue={f.tenue} />
                  ))}
                </Bloque>
              ))}

              <div style={{ borderTop: `1.5px solid ${C.negro}`, paddingTop: 26 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: ".24em", textTransform: "uppercase", color: C.negro }}>
                      Total de escrituración
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: C.gris, marginTop: 6 }}>
                      Equivale al {r.pct.toFixed(2)}% del valor de la operación
                    </div>
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 500, color: C.negro, lineHeight: 1 }}>{mxn(r.total)}</div>
                </div>

                {r.CR > 0 && (
                  <div style={{ marginTop: 26, background: C.hueso, padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 13, fontWeight: 300, color: C.tinta }}>
                      <span>Enganche o diferencia a cubrir</span>
                      <span>{mxn(r.enganche)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.hairline}`, color: C.negro }}>
                      <span style={{ fontFamily: SANS, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 10.5 }}>
                        Recursos propios al cierre
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500 }}>{mxn(r.enganche + r.total)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 42, paddingTop: 24, borderTop: `1px solid ${C.hairline}` }}>
                <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 500, letterSpacing: ".32em", textTransform: "uppercase", color: C.gris, marginBottom: 16 }}>
                  Nota aclaratoria
                </div>
                <ol style={{ margin: 0, paddingLeft: 16, fontFamily: SANS, fontSize: 11.5, fontWeight: 300, lineHeight: 1.8, color: C.gris }}>
                  {NOTAS.map((n, i) => <li key={i} style={{ marginBottom: 4 }}>{n}</li>)}
                </ol>
              </div>

              {/* Contacto */}
              <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${C.hairline}` }}>
                <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 500, letterSpacing: ".32em", textTransform: "uppercase", color: C.gris, marginBottom: 16 }}>
                  Contáctanos
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "center" }}>
                  <a href={SITIO} target="_blank" rel="noopener noreferrer" style={enlace}>{SITIO_TXT}</a>
                  <a
                    href={TEL_URL}
                    target="_top"
                    onClick={() => navigator.clipboard?.writeText(TEL_PLANO).then(() => setCopiado(true), () => {})}
                    style={enlace}
                  >
                    Llamar {TEL_TXT}
                  </a>
                  <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={enlace}>
                    WhatsApp {TEL_TXT}
                  </a>
                </div>
                {copiado && (
                  <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: C.gris, marginTop: 12 }}>
                    Número copiado al portapapeles.
                  </div>
                )}
              </div>
            </div>

            {/* Descarga */}
            <div style={{ marginTop: 34, border: `1px solid ${C.negro}`, padding: "32px 30px" }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, letterSpacing: ".28em", textTransform: "uppercase", color: C.negro, marginBottom: 6 }}>
                Descargar la estimación
              </div>
              <p style={{ margin: "0 0 24px", fontFamily: SANS, fontSize: 12, fontWeight: 300, lineHeight: 1.6, color: C.gris, maxWidth: 480 }}>
                Requiere el nombre del asesor, el del cliente y la contraseña.
              </p>

              <div style={{ maxWidth: 260 }}>
                <Campo label="Contraseña del asesor">
                  <input
                    style={inputBase}
                    type="password"
                    value={clave}
                    onChange={(e) => { setClave(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && generar()}
                    placeholder="••••"
                  />
                </Campo>
              </div>

              {error && <div style={{ fontFamily: SANS, fontSize: 12, color: C.alerta, marginBottom: 18, maxWidth: 480, lineHeight: 1.5 }}>{error}</div>}

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  className="hh-btn"
                  onClick={generar}
                  disabled={generando}
                  style={{
                    background: C.negro, color: "#FFF", border: `1px solid ${C.negro}`, padding: "15px 34px",
                    cursor: generando ? "wait" : "pointer", opacity: generando ? 0.6 : 1,
                    fontFamily: SANS, fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase",
                  }}
                >
                  {generando ? "Generando" : pdfUrl ? "Generar de nuevo" : "Generar PDF"}
                </button>

                <button
                  onClick={reiniciar}
                  style={{
                    background: "transparent", color: C.gris, border: `1px solid ${C.hairline}`, padding: "15px 30px",
                    cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase",
                  }}
                >
                  Iniciar nuevo cálculo
                </button>
              </div>

              {pdfUrl && (
                <div style={{ marginTop: 26, paddingTop: 22, borderTop: `1px solid ${C.hairline}` }}>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.gris, marginBottom: 16, lineHeight: 1.6 }}>
                    PDF listo: <b style={{ fontWeight: 500, color: C.negro }}>{pdfNombre}</b>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                    <button
                      onClick={compartir}
                      style={{
                        background: C.negro, color: "#FFF", border: `1px solid ${C.negro}`, padding: "13px 26px",
                        cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase",
                      }}
                    >
                      Compartir el PDF
                    </button>
                    <button
                      onClick={porWhatsApp}
                      style={{
                        background: "transparent", color: C.negro, border: `1px solid ${C.negro}`, padding: "13px 26px",
                        cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase",
                      }}
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={porCorreo}
                      style={{
                        background: "transparent", color: C.negro, border: `1px solid ${C.negro}`, padding: "13px 26px",
                        cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase",
                      }}
                    >
                      Correo
                    </button>
                  </div>

                  <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: C.gris, lineHeight: 1.6, marginBottom: 16, maxWidth: 520 }}>
                    <b style={{ fontWeight: 500, color: C.negro }}>Compartir el PDF</b> abre el menú del celular con el archivo adjunto: elige ahí WhatsApp, correo o cualquier app.
                    Los botones de WhatsApp y Correo envían solo el resumen en texto, porque esas apps no aceptan adjuntos desde un enlace.
                  </div>

                  {aviso && (
                    <div style={{ fontFamily: SANS, fontSize: 12, color: C.alerta, marginBottom: 16, maxWidth: 520, lineHeight: 1.5 }}>
                      {aviso}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
                    <a href={pdfUrl} download={pdfNombre} style={{ ...enlace, fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", paddingBottom: 4 }}>
                      Descargar
                    </a>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ ...enlace, fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: C.gris, borderBottomColor: C.hairline, paddingBottom: 4 }}>
                      Abrir en pestaña nueva
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
