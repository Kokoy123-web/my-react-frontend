import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  getPayslipBodyHtml,
  getPayslipDocumentHtml,
  getPayslipDocumentStyles,
} from "./payslipDocument";

function sanitizeFilenamePart(value) {
  return String(value || "employee")
    .trim()
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 48);
}

function buildFilename(payslip, employee) {
  const name = sanitizeFilenamePart(employee?.name);
  const period = sanitizeFilenamePart(payslip?.pay_period);
  return `Payslip_${name}_${period}.pdf`;
}

function renderPayslipElement(payslip, employee) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;background:#e8ecef;padding:24px;z-index:-1;";
  const style = document.createElement("style");
  style.textContent = getPayslipDocumentStyles();
  host.appendChild(style);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getPayslipBodyHtml(payslip, employee);
  host.appendChild(wrapper);
  document.body.appendChild(host);
  return host;
}

async function renderPayslipCanvas(payslip, employee) {
  const host = renderPayslipElement(payslip, employee);
  const page = host.querySelector(".ps-page");

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    return canvas;
  } finally {
    document.body.removeChild(host);
  }
}

export const downloadPayslipPDF = async (payslip, employee) => {
  try {
    const canvas = await renderPayslipCanvas(payslip, employee);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(buildFilename(payslip, employee));
  } catch (err) {
    console.error("Payslip PDF download failed:", err);
    window.alert("Unable to generate payslip PDF. Please try again or use Print.");
  }
};

function removePrintFrame(iframe) {
  if (iframe?.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

export const printPayslipPDF = (payslip, employee) => {
  const html = getPayslipDocumentHtml(payslip, employee);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Payslip print");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;left:-9999px;top:0;";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    removePrintFrame(iframe);
    window.alert("Unable to open print. Please try again.");
    return;
  }

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    frameWindow.removeEventListener("afterprint", cleanup);
    removePrintFrame(iframe);
  };

  const runPrint = () => {
    try {
      frameWindow.focus();
      frameWindow.print();
      frameWindow.addEventListener("afterprint", cleanup);
      setTimeout(cleanup, 120000);
    } catch (err) {
      console.error("Payslip print failed:", err);
      cleanup();
      window.alert("Unable to print payslip. Please try again.");
    }
  };

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  if (frameDoc.readyState === "complete") {
    requestAnimationFrame(runPrint);
  } else {
    iframe.onload = runPrint;
  }
};

/** @deprecated Use downloadPayslipPDF — kept for any legacy imports */
export const generatePayslipPDF = async (payslip, employee) => {
  const canvas = await renderPayslipCanvas(payslip, employee);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, imgHeight);
  return pdf;
};
