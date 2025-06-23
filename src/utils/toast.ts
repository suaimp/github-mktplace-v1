export function showToast(
  message: string,
  type: "success" | "error" = "success"
) {
  if (typeof window !== "undefined" && window.document) {
    // Remove qualquer toast anterior
    const oldToast = document.getElementById("global-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.id = "global-toast";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "32px";
    toast.style.right = "32px";
    toast.style.zIndex = "99999";
    toast.style.padding = "14px 28px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.fontSize = "1rem";
    toast.style.background = type === "success" ? "#22c55e" : "#ef4444";
    toast.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
    toast.style.opacity = "0.98";
    toast.style.transition = "opacity 0.3s";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}
