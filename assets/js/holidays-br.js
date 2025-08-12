/*
  Feriados nacionais básicos do Brasil (fixos) por ano
  - Simplificado: não inclui feriados móveis (Carnaval, Corpus Christi, etc.)
  - Útil para cálculo de dias úteis
*/
(function () {
  function pad2(n) { return String(n).padStart(2, '0'); }

  function toISODateString(date) {
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return y + '-' + m + '-' + d;
  }

  function buildFixedHolidaySet(year) {
    // Lista de feriados nacionais fixos
    const fixed = [
      [1, 1],   // Confraternização Universal
      [4, 21],  // Tiradentes
      [5, 1],   // Dia do Trabalhador
      [9, 7],   // Independência do Brasil
      [10, 12], // Nossa Senhora Aparecida
      [11, 2],  // Finados
      [11, 15], // Proclamação da República
      [12, 25], // Natal
    ];
    const set = new Set();
    for (const [m, d] of fixed) {
      set.add(year + '-' + pad2(m) + '-' + pad2(d));
    }
    return set;
  }

  function getBrazilHolidays(year) {
    return buildFixedHolidaySet(year);
  }

  function isBrazilHoliday(date) {
    const year = date.getFullYear();
    const iso = toISODateString(date);
    const set = getBrazilHolidays(year);
    return set.has(iso);
  }

  // Expondo no escopo global
  window.getBrazilHolidays = getBrazilHolidays;
  window.isBrazilHoliday = isBrazilHoliday;
})();


