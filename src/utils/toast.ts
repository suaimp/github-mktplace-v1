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
    toast.innerHTML = `
      <div class="flex items-center justify-between gap-3 w-full sm:max-w-[340px] rounded-md border-b-4 p-3 shadow-theme-sm dark:bg-[#1E2634] ${type === "success" ? 'border-success-500' : 'border-error-500'}" style="background:#fff;">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg ${type === "success" ? 'bg-success-50 text-success-500' : 'bg-error-50 text-error-500'}">
            ${type === "success" ? `
              <svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.70186 11.0001C2.70186 6.41711 6.41711 2.70186 11.0001 2.70186C15.5831 2.70186 19.2984 6.41711 19.2984 11.0001C19.2984 15.5831 15.5831 19.2984 11.0001 19.2984C6.41711 19.2984 2.70186 15.5831 2.70186 11.0001ZM11.0001 0.901855C5.423 0.901855 0.901855 5.423 0.901855 11.0001C0.901855 16.5772 5.423 21.0984 11.0001 21.0984C16.5772 21.0984 21.0984 16.5772 21.0984 11.0001C21.0984 5.423 16.5772 0.901855 11.0001 0.901855ZM14.6197 9.73951C14.9712 9.38804 14.9712 8.81819 14.6197 8.46672C14.2683 8.11525 13.6984 8.11525 13.347 8.46672L10.1894 11.6243L8.6533 10.0883C8.30183 9.7368 7.73198 9.7368 7.38051 10.0883C7.02904 10.4397 7.02904 11.0096 7.38051 11.3611L9.55295 13.5335C9.72174 13.7023 9.95065 13.7971 10.1894 13.7971C10.428 13.7971 10.657 13.7023 10.8257 13.5335L14.6197 9.73951Z" fill="#12B76A"></path>
              </svg>
            ` : `
              <svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" fill="#FEF3F2" stroke="#F04438" stroke-width="1.5"/>
                <path d="M7.75 7.75L14.25 14.25M14.25 7.75L7.75 14.25" stroke="#F04438" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            `}
          </div>
          <div>
            <h4 class="text-sm text-gray-800 sm:text-base dark:text-white/90">${type === "success" ? "Sucesso!" : "Erro!"}</h4>
            <div class="text-xs text-gray-700 dark:text-gray-200 mt-1">${message}</div>
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-800 dark:hover:text-white/90" id="global-toast-close-btn">
          <svg class="size-6" width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    `;
    toast.style.position = "fixed";
    toast.style.bottom = "32px"; // Alterado de top para bottom
    toast.style.left = "32px";   // Alterado de right para left
    toast.style.zIndex = "99999";
    toast.style.maxWidth = "340px";
    toast.style.width = "100%";
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.3s";
    toast.style.pointerEvents = "auto";
    toast.style.backgroundColor = "transparent"; // Corrigido para não interferir na tooltip
    document.body.appendChild(toast);
    // Adiciona box-shadow na div de conteúdo do toast
    const toastContent = toast.querySelector('div');
    if (toastContent) {
      toastContent.style.boxShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 6px 0 rgba(60,60,60,0.10)";
      toastContent.style.borderRadius = "12px";
    }
    // Fechar ao clicar no botão
    const closeBtn = toast.querySelector("#global-toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
      });
    }
    // Fechar automaticamente após 2.5s
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}
