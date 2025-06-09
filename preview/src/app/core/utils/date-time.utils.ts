import { parseISO, format, differenceInMilliseconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  } catch (e) {
    console.error('Error formatting date:', isoString, e);
    return 'N/A';
  }
}

export function formatDuration(durationString: string): string {
  // Converte a string de duração (ex: "6.640987ms") para milissegundos
  let totalMs: number = 0;
  if (durationString.endsWith('ms')) {
    totalMs = parseFloat(durationString.replace('ms', ''));
  } else if (durationString.endsWith('µs')) {
    totalMs = parseFloat(durationString.replace('µs', '')) / 1000;
  } else if (durationString.endsWith('s')) {
    totalMs = parseFloat(durationString.replace('s', '')) * 1000;
  } else {
    return durationString; // Retorna original se formato não for reconhecido
  }

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
  const milliseconds = Math.floor(totalMs % 1000);

  const pad = (num: number) => num.toString().padStart(2, '0');

  // Retorna no formato HH:mm:ss, ignorando milissegundos na duração total da execução para simplificar
  if (totalMs >= 1000) { // Se for pelo menos 1 segundo, mostra HH:mm:ss
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else { // Caso contrário, mostra milissegundos
    return `${totalMs.toFixed(2)}ms`;
  }
}