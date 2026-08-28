// Efeitos sonoros do app. Usa HTMLAudioElement simples — leve e sem dependências.

const cashRegisterAudio = new Audio("/sounds/cash-register.wav");
cashRegisterAudio.preload = "auto";

/**
 * Toca o som de "cha-ching" (caixa registradora). Silenciosamente ignora
 * falhas (ex: navegador bloqueando autoplay antes de qualquer interação do
 * usuário) — o som é um extra, nunca deve quebrar o fluxo de pagamento.
 */
export function playCashSound() {
  try {
    // Permite tocar de novo rapidamente mesmo se o som anterior ainda não
    // terminou (ex: várias transações seguidas).
    cashRegisterAudio.currentTime = 0;
    void cashRegisterAudio.play().catch(() => {
      // Autoplay bloqueado ou outro erro — sem problema, ignora.
    });
  } catch {
    // Ignora qualquer erro inesperado do Audio API.
  }
}