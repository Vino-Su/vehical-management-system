/* Fixed first/last table columns, including dynamic table updates. */
(function (window, document) {
  'use strict';

  const instances = new WeakMap();

  function getCount(wrapper, name) {
    const value = Number.parseInt(wrapper.dataset[name], 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function getRows(table) {
    return Array.from(table.rows).filter((row) => row.closest('table') === table);
  }

  function getReferenceCells(table) {
    const headerRow = Array.from(table.tHead?.rows || []).find((row) => row.cells.length);
    if (headerRow) return Array.from(headerRow.cells);
    const firstRow = getRows(table)[0];
    return firstRow ? Array.from(firstRow.cells) : [];
  }

  function getFirstFixedIndex(wrapper, referenceCells) {
    const configured = Number.parseInt(wrapper.dataset.fixedStart, 10);
    if (Number.isFinite(configured) && configured >= 0) return configured;
    return referenceCells[0]?.querySelector('input[type="checkbox"]') ? 1 : 0;
  }

  function updateScrollState(wrapper) {
    const maxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    wrapper.classList.toggle('fixed-table--has-left-overflow', wrapper.scrollLeft > 1);
    wrapper.classList.toggle('fixed-table--has-right-overflow', wrapper.scrollLeft < maxScroll - 1);
  }

  function applyOffsets(wrapper) {
    const table = wrapper.querySelector(':scope > table');
    if (!table) return;

    const firstCount = getCount(wrapper, 'fixedFirst');
    const lastCount = getCount(wrapper, 'fixedLast');
    const referenceCells = getReferenceCells(table);
    const widths = referenceCells.map((cell) => cell.getBoundingClientRect().width);
    const leftStart = getFirstFixedIndex(wrapper, referenceCells);

    getRows(table).forEach((row) => {
      const cells = Array.from(row.cells);
      cells.forEach((cell) => {
        cell.classList.remove('fixed-table__fixed-left', 'fixed-table__fixed-right');
        cell.style.left = '';
        cell.style.right = '';
      });

      const leftLimit = Math.min(leftStart + firstCount, cells.length);
      for (let index = leftStart; index < leftLimit; index += 1) {
        const offset = widths.slice(leftStart, index).reduce((sum, width) => sum + width, 0);
        cells[index].classList.add('fixed-table__fixed-left');
        cells[index].style.left = offset + 'px';
      }

      const rightStart = Math.max(leftLimit, cells.length - lastCount);
      for (let index = rightStart; index < cells.length; index += 1) {
        const offset = widths.slice(index + 1).reduce((sum, width) => sum + width, 0);
        cells[index].classList.add('fixed-table__fixed-right');
        cells[index].style.right = offset + 'px';
      }
    });

    updateScrollState(wrapper);
  }

  function init(target) {
    const wrapper = typeof target === 'string' ? document.querySelector(target) : target;
    if (!wrapper || !wrapper.classList.contains('fixed-table')) return null;

    const minWidth = wrapper.dataset.fixedMinWidth;
    if (minWidth) wrapper.style.setProperty('--fixed-table-min-width', minWidth);
    applyOffsets(wrapper);
    if (instances.has(wrapper)) return wrapper;

    const observer = new MutationObserver(() => requestAnimationFrame(() => applyOffsets(wrapper)));
    const table = wrapper.querySelector(':scope > table');
    if (table) observer.observe(table, { childList: true, subtree: true });

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => requestAnimationFrame(() => applyOffsets(wrapper)));
    if (resizeObserver) resizeObserver.observe(wrapper);

    wrapper.addEventListener('scroll', () => updateScrollState(wrapper), { passive: true });
    instances.set(wrapper, { observer, resizeObserver });
    return wrapper;
  }

  function refresh(target) {
    const wrapper = typeof target === 'string' ? document.querySelector(target) : target;
    return wrapper ? init(wrapper) : null;
  }

  function initAll(root) {
    (root || document).querySelectorAll('.fixed-table').forEach(init);
  }

  window.FixedTable = { init, refresh, initAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll());
  else initAll();
}(window, document));
