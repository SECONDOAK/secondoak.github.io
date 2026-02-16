(function () {
  'use strict';

  // =============================================
  // SECTION 1: CONFIGURATION & CONSTANTS
  // =============================================

  const CONFIG = {
    YEAR_RANGE_START: 1970,
    YEAR_RANGE_END: 2100,
    DEFAULT_WEEK_START: 1, // Monday
    DEFAULT_LANG: 'sv',
    DEFAULT_THEME: 'light',
    HOURS_START: 6,
    HOURS_END: 22,
    STORAGE_KEY_EVENTS: 'calendar-app-events',
    STORAGE_KEY_SETTINGS: 'calendar-app-settings',
  };

  const TRANSLATIONS = {
    sv: {
      months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
        'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
      weekdays: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
      weekdaysShort: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
      addEvent: 'Lägg till händelse',
      editEvent: 'Redigera händelse',
      save: 'Spara',
      cancel: 'Avbryt',
      delete: 'Ta bort',
      week: 'Vecka',
      print: 'Skriv ut',
      eventPlaceholder: 'Skriv händelse...',
      month: 'Månad',
      weekLabel: 'Vecka',
      weekStarts: 'Veckan börjar',
      monday: 'Måndag',
      sunday: 'Söndag',
      language: 'Språk',
      navigation: 'Navigation',
      settings: 'Inställningar',
      appearance: 'Utseende',
      theme: 'Tema',
      themeLight: 'Ljus',
      themeDark: 'Mörk',
      themePastel: 'Pastell',
      themeClassic: 'Klassisk',
      themeMono: 'Monokrom',
      paperSize: 'Pappersstorlek',
      orientation: 'Layout',
      portrait: 'Stående',
      landscape: 'Liggande',
      fontSize: 'Textstorlek',
      cornerRadius: 'Rundade hörn',
      gridStyle: 'Rutstil',
      gridSolid: 'Heldragna',
      gridDashed: 'Streckade',
      gridDotted: 'Prickade',
      gridNone: 'Inga linjer',
      previewTitle: 'Förhandsgranskning',
      previewAndPrint: 'Förhandsgranska & Skriv ut',
      preview: 'Förhandsgranska',
      printDirect: 'Skriv ut',
    },
    en: {
      months: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      addEvent: 'Add event',
      editEvent: 'Edit event',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      week: 'Week',
      print: 'Print',
      eventPlaceholder: 'Write event...',
      month: 'Month',
      weekLabel: 'Week',
      weekStarts: 'Week starts',
      monday: 'Monday',
      sunday: 'Sunday',
      language: 'Language',
      navigation: 'Navigation',
      settings: 'Settings',
      appearance: 'Appearance',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themePastel: 'Pastel',
      themeClassic: 'Classic',
      themeMono: 'Monochrome',
      paperSize: 'Paper size',
      orientation: 'Orientation',
      portrait: 'Portrait',
      landscape: 'Landscape',
      fontSize: 'Font size',
      cornerRadius: 'Corner radius',
      gridStyle: 'Grid style',
      gridSolid: 'Solid',
      gridDashed: 'Dashed',
      gridDotted: 'Dotted',
      gridNone: 'None',
      previewTitle: 'Print Preview',
      previewAndPrint: 'Preview & Print',
      preview: 'Preview',
      printDirect: 'Print',
    },
  };

  // =============================================
  // SECTION 2: APPLICATION STATE
  // =============================================

  const now = new Date();
  const state = {
    year: now.getFullYear(),
    month: now.getMonth(),
    weekNumber: null,
    view: 'month',
    lang: CONFIG.DEFAULT_LANG,
    weekStart: CONFIG.DEFAULT_WEEK_START,
    theme: CONFIG.DEFAULT_THEME,
    paperSize: 'a4',
    orientation: 'portrait',
    fontSize: 14,
    cornerRadius: 4,
    gridStyle: 'solid',
  };

  // =============================================
  // SECTION 3: LOCALIZATION
  // =============================================

  const i18n = {
    t(key) {
      return TRANSLATIONS[state.lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
    },

    monthName(monthIndex) {
      return TRANSLATIONS[state.lang].months[monthIndex];
    },

    weekdayName(dayIndex) {
      return TRANSLATIONS[state.lang].weekdays[dayIndex];
    },

    weekdaysOrdered() {
      const days = [...TRANSLATIONS[state.lang].weekdaysShort];
      if (state.weekStart === 1) {
        days.push(days.shift());
      }
      return days;
    },

    weekdayIndicesOrdered() {
      if (state.weekStart === 1) return [1, 2, 3, 4, 5, 6, 0];
      return [0, 1, 2, 3, 4, 5, 6];
    },
  };

  // =============================================
  // SECTION 4: CALENDAR ENGINE
  // =============================================

  const CalendarEngine = {
    firstDayOfMonth(year, month) {
      return new Date(year, month, 1).getDay();
    },

    daysInMonth(year, month) {
      return new Date(year, month + 1, 0).getDate();
    },

    generateMonthGrid(year, month, weekStart) {
      const result = [];
      const firstDay = this.firstDayOfMonth(year, month);
      const totalDays = this.daysInMonth(year, month);

      let offset = firstDay - weekStart;
      if (offset < 0) offset += 7;

      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevDays = this.daysInMonth(prevYear, prevMonth);

      for (let i = offset - 1; i >= 0; i--) {
        const date = new Date(prevYear, prevMonth, prevDays - i);
        result.push(this._makeDayData(date, false));
      }

      for (let d = 1; d <= totalDays; d++) {
        const date = new Date(year, month, d);
        result.push(this._makeDayData(date, true));
      }

      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      let nextDay = 1;
      while (result.length < 42) {
        const date = new Date(nextYear, nextMonth, nextDay++);
        result.push(this._makeDayData(date, false));
      }

      return result;
    },

    _makeDayData(date, isCurrentMonth) {
      const today = new Date();
      const dow = date.getDay();
      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday: date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate(),
        isWeekend: dow === 0 || dow === 6,
        dateKey: this.dateKey(date),
      };
    },

    dateKey(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    getISOWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    getWeekDates(year, weekNumber, weekStart) {
      const jan4 = new Date(year, 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      const monday = new Date(jan4);
      monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNumber - 1) * 7);

      const dates = [];
      const startOffset = weekStart === 0 ? -1 : 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + startOffset + i);
        dates.push(d);
      }
      return dates;
    },

    getWeeksInMonth(year, month) {
      const weeks = new Set();
      const totalDays = this.daysInMonth(year, month);
      for (let d = 1; d <= totalDays; d++) {
        weeks.add(this.getISOWeekNumber(new Date(year, month, d)));
      }
      return [...weeks];
    },
  };

  // =============================================
  // SECTION 5: EVENT STORAGE
  // =============================================

  const EventStore = {
    _events: {},

    load() {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY_EVENTS);
        this._events = data ? JSON.parse(data) : {};
      } catch {
        this._events = {};
      }
    },

    save() {
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY_EVENTS, JSON.stringify(this._events));
      } catch {
        // Silently fail
      }
    },

    getEvents(key) {
      return this._events[key] || [];
    },

    addEvent(key, text) {
      if (!this._events[key]) this._events[key] = [];
      this._events[key].push(text);
      this.save();
    },

    updateEvent(key, index, newText) {
      if (this._events[key] && this._events[key][index] !== undefined) {
        this._events[key][index] = newText;
        this.save();
      }
    },

    deleteEvent(key, index) {
      if (this._events[key]) {
        this._events[key].splice(index, 1);
        if (this._events[key].length === 0) delete this._events[key];
        this.save();
      }
    },
  };

  // =============================================
  // SECTION 6: RENDERERS
  // =============================================

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  const MonthRenderer = {
    render() {
      const headers = document.getElementById('weekday-headers');
      const grid = document.getElementById('month-grid');

      // Weekday headers
      const orderedDays = i18n.weekdaysOrdered();
      headers.innerHTML = orderedDays.map(
        name => `<div class="weekday-cell">${name}</div>`
      ).join('');

      // Day cells
      const days = CalendarEngine.generateMonthGrid(state.year, state.month, state.weekStart);
      grid.innerHTML = days.map(day => {
        const classes = ['day-cell'];
        if (!day.isCurrentMonth) classes.push('other-month');
        if (day.isToday) classes.push('today');
        if (day.isWeekend && day.isCurrentMonth) classes.push('weekend');

        const events = EventStore.getEvents(day.dateKey);
        const eventsHTML = events.map((e, i) =>
          `<div class="event-item" data-event-index="${i}">${escapeHtml(e)}</div>`
        ).join('');

        return `<div class="${classes.join(' ')}" data-date-key="${day.dateKey}">
          <span class="day-number">${day.dayNumber}</span>
          <div class="day-events">${eventsHTML}</div>
        </div>`;
      }).join('');

      // Click handlers
      grid.querySelectorAll('.day-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
          const dateKey = cell.dataset.dateKey;
          const eventEl = e.target.closest('.event-item');
          const eventIndex = eventEl ? parseInt(eventEl.dataset.eventIndex) : null;
          ModalController.open(dateKey, eventIndex);
        });
      });
    },
  };

  const WeekRenderer = {
    render() {
      const grid = document.getElementById('week-grid');
      const weekDates = CalendarEngine.getWeekDates(state.year, state.weekNumber, state.weekStart);

      let html = '';

      // Corner cell
      html += '<div class="week-corner-cell"></div>';

      // Day headers
      weekDates.forEach(date => {
        const dayName = i18n.weekdayName(date.getDay());
        const dayNum = date.getDate();
        const monthName = i18n.monthName(date.getMonth());
        html += `<div class="week-day-header">${dayName}<br>${dayNum} ${monthName}</div>`;
      });

      // Time rows
      for (let h = CONFIG.HOURS_START; h <= CONFIG.HOURS_END; h++) {
        const hourStr = `${String(h).padStart(2, '0')}:00`;

        html += `<div class="time-label">${hourStr}</div>`;

        weekDates.forEach(date => {
          const dateKey = CalendarEngine.dateKey(date);
          const timeKey = `${dateKey}T${hourStr}`;
          const events = EventStore.getEvents(timeKey);
          const eventsHTML = events.map((e, i) =>
            `<div class="event-item" data-event-index="${i}">${escapeHtml(e)}</div>`
          ).join('');

          html += `<div class="time-slot" data-time-key="${timeKey}">${eventsHTML}</div>`;
        });
      }

      grid.innerHTML = html;

      // Click handlers
      grid.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const timeKey = slot.dataset.timeKey;
          const eventEl = e.target.closest('.event-item');
          const eventIndex = eventEl ? parseInt(eventEl.dataset.eventIndex) : null;
          ModalController.open(timeKey, eventIndex);
        });
      });
    },
  };

  // =============================================
  // SECTION 7: CUSTOMIZATION CONTROLLER
  // =============================================

  const Customizer = {
    init() {
      document.getElementById('theme-select').addEventListener('change', (e) => this.setTheme(e.target.value));
      document.getElementById('font-size-slider').addEventListener('input', (e) => this.setFontSize(e.target.value));
      document.getElementById('corner-radius-slider').addEventListener('input', (e) => this.setCornerRadius(e.target.value));
      document.getElementById('grid-style-select').addEventListener('change', (e) => this.setGridStyle(e.target.value));
      document.getElementById('paper-select').addEventListener('change', (e) => this.setPaperSize(e.target.value));
      document.getElementById('orientation-select').addEventListener('change', (e) => this.setOrientation(e.target.value));
    },

    setTheme(theme) {
      document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
      if (theme !== 'light') document.body.classList.add(`theme-${theme}`);
      state.theme = theme;
      this._ensurePaperClasses();
      this.saveSettings();
    },

    setFontSize(px) {
      document.documentElement.style.setProperty('--font-size-base', `${px}px`);
      document.getElementById('font-size-value').textContent = `${px}px`;
      state.fontSize = parseInt(px);
      this.saveSettings();
    },

    setCornerRadius(px) {
      document.documentElement.style.setProperty('--cell-border-radius', `${px}px`);
      document.getElementById('corner-radius-value').textContent = `${px}px`;
      state.cornerRadius = parseInt(px);
      this.saveSettings();
    },

    setGridStyle(style) {
      document.documentElement.style.setProperty('--grid-border-style', style);
      if (style === 'none') {
        document.documentElement.style.setProperty('--grid-border-width', '0px');
      } else {
        document.documentElement.style.setProperty('--grid-border-width', '1px');
      }
      state.gridStyle = style;
      this.saveSettings();
    },

    setPaperSize(size) {
      document.body.classList.remove('paper-a4', 'paper-letter');
      document.body.classList.add(`paper-${size}`);
      state.paperSize = size;
      this.saveSettings();
    },

    setOrientation(orientation) {
      document.body.classList.remove('orientation-portrait', 'orientation-landscape');
      document.body.classList.add(`orientation-${orientation}`);
      state.orientation = orientation;
      this.saveSettings();
    },

    _ensurePaperClasses() {
      if (!document.body.classList.contains('paper-a4') && !document.body.classList.contains('paper-letter')) {
        document.body.classList.add(`paper-${state.paperSize}`);
      }
      if (!document.body.classList.contains('orientation-portrait') && !document.body.classList.contains('orientation-landscape')) {
        document.body.classList.add(`orientation-${state.orientation}`);
      }
    },

    saveSettings() {
      const settings = {
        theme: state.theme,
        fontSize: state.fontSize,
        cornerRadius: state.cornerRadius,
        gridStyle: state.gridStyle,
        paperSize: state.paperSize,
        orientation: state.orientation,
        lang: state.lang,
        weekStart: state.weekStart,
      };
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      } catch {
        // Silently fail
      }
    },

    loadSettings() {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
        if (!data) return;
        const settings = JSON.parse(data);

        if (settings.theme) {
          state.theme = settings.theme;
          document.getElementById('theme-select').value = settings.theme;
          this.setTheme(settings.theme);
        }
        if (settings.fontSize) {
          state.fontSize = settings.fontSize;
          document.getElementById('font-size-slider').value = settings.fontSize;
          this.setFontSize(settings.fontSize);
        }
        if (settings.cornerRadius !== undefined) {
          state.cornerRadius = settings.cornerRadius;
          document.getElementById('corner-radius-slider').value = settings.cornerRadius;
          this.setCornerRadius(settings.cornerRadius);
        }
        if (settings.gridStyle) {
          state.gridStyle = settings.gridStyle;
          document.getElementById('grid-style-select').value = settings.gridStyle;
          this.setGridStyle(settings.gridStyle);
        }
        if (settings.paperSize) {
          state.paperSize = settings.paperSize;
          document.getElementById('paper-select').value = settings.paperSize;
          this.setPaperSize(settings.paperSize);
        }
        if (settings.orientation) {
          state.orientation = settings.orientation;
          document.getElementById('orientation-select').value = settings.orientation;
          this.setOrientation(settings.orientation);
        }
        if (settings.lang) {
          state.lang = settings.lang;
          document.getElementById('lang-select').value = settings.lang;
          document.documentElement.lang = settings.lang;
        }
        if (settings.weekStart !== undefined) {
          state.weekStart = settings.weekStart;
          document.getElementById('week-start-select').value = settings.weekStart;
        }
      } catch {
        // Use defaults
      }
    },
  };

  // =============================================
  // SECTION 8: PRINT PREVIEW & PRINT CONTROLLER
  // =============================================

  const PrintController = {
    _overlay: null,
    _previewOrientation: null,

    openPreview() {
      this._previewOrientation = state.orientation;
      this._buildOverlay();
      document.body.appendChild(this._overlay);
      this._updatePreviewContent();
      this._updateScale();

      window.addEventListener('resize', this._onResize);
    },

    _onResize: null,

    _buildOverlay() {
      // Remove existing
      this._overlay?.remove();

      const overlay = document.createElement('div');
      overlay.className = 'print-preview-overlay no-print';

      const container = document.createElement('div');
      container.className = 'print-preview-container';

      // Toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'print-preview-toolbar';

      const title = document.createElement('h2');
      title.textContent = i18n.t('previewTitle');
      title.id = 'preview-title';

      const actions = document.createElement('div');
      actions.className = 'print-preview-actions';

      const portraitBtn = document.createElement('button');
      portraitBtn.className = 'preview-orientation-btn' + (this._previewOrientation === 'portrait' ? ' active' : '');
      portraitBtn.innerHTML = '&#9645; ' + i18n.t('portrait');
      portraitBtn.id = 'preview-portrait-btn';
      portraitBtn.addEventListener('click', () => this._setPreviewOrientation('portrait'));

      const landscapeBtn = document.createElement('button');
      landscapeBtn.className = 'preview-orientation-btn' + (this._previewOrientation === 'landscape' ? ' active' : '');
      landscapeBtn.innerHTML = '&#9644; ' + i18n.t('landscape');
      landscapeBtn.id = 'preview-landscape-btn';
      landscapeBtn.addEventListener('click', () => this._setPreviewOrientation('landscape'));

      const printBtn = document.createElement('button');
      printBtn.className = 'preview-print-btn';
      printBtn.textContent = i18n.t('print');
      printBtn.addEventListener('click', () => this._printFromPreview());

      const closeBtn = document.createElement('button');
      closeBtn.className = 'preview-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.closePreview());

      actions.append(portraitBtn, landscapeBtn, printBtn, closeBtn);
      toolbar.append(title, actions);

      // Body
      const body = document.createElement('div');
      body.className = 'print-preview-body';
      body.id = 'print-preview-body';

      const page = document.createElement('div');
      page.className = 'print-preview-page';
      page.id = 'print-preview-page';

      body.appendChild(page);
      container.append(toolbar, body);
      overlay.appendChild(container);

      // Close on overlay background click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closePreview();
      });

      // Close on Escape
      this._escHandler = (e) => {
        if (e.key === 'Escape') this.closePreview();
      };
      document.addEventListener('keydown', this._escHandler);

      // Resize handler
      this._onResize = () => this._updateScale();

      this._overlay = overlay;
    },

    _setPreviewOrientation(orientation) {
      this._previewOrientation = orientation;

      // Update active state of buttons
      const portraitBtn = document.getElementById('preview-portrait-btn');
      const landscapeBtn = document.getElementById('preview-landscape-btn');
      portraitBtn.classList.toggle('active', orientation === 'portrait');
      landscapeBtn.classList.toggle('active', orientation === 'landscape');

      // Also update the sidebar control to match
      state.orientation = orientation;
      document.getElementById('orientation-select').value = orientation;
      Customizer.setOrientation(orientation);

      this._updatePreviewContent();
      this._updateScale();
    },

    _updatePreviewContent() {
      const page = document.getElementById('print-preview-page');
      if (!page) return;

      // Set page size class
      page.className = 'print-preview-page';
      page.classList.add(`${state.paperSize}-${this._previewOrientation}`);

      // Clone the calendar content into the preview
      const calendarContent = document.getElementById('calendar-content');
      page.innerHTML = '';
      const clone = calendarContent.cloneNode(true);
      clone.style.marginLeft = '0';
      clone.style.padding = '0';
      clone.style.width = '100%';
      clone.style.flex = '1';
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';

      // Remove hidden views from clone
      const monthView = clone.querySelector('#month-view');
      const weekView = clone.querySelector('#week-view');
      if (state.view === 'month' && weekView) weekView.remove();
      if (state.view === 'week' && monthView) monthView.remove();

      // Remove max-width restrictions and stretch to fill
      clone.querySelectorAll('.month-view, .week-view').forEach(el => {
        el.style.maxWidth = 'none';
        el.style.flex = '1';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
      });

      // Stretch grid to fill available space
      clone.querySelectorAll('.month-grid, .week-grid').forEach(el => {
        el.style.flex = '1';
      });

      page.appendChild(clone);
    },

    _updateScale() {
      const body = document.getElementById('print-preview-body');
      const page = document.getElementById('print-preview-page');
      if (!body || !page) return;

      // Reset scale to measure real size
      page.style.transform = 'none';
      const pageRect = page.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();

      const scaleX = (bodyRect.width - 40) / pageRect.width;
      const scaleY = (bodyRect.height - 40) / pageRect.height;
      const scale = Math.min(scaleX, scaleY, 1);

      page.style.transform = `scale(${scale})`;
      page.style.setProperty('--preview-scale', scale);

      // Adjust container margin so it doesn't take up unscaled space
      const scaledW = pageRect.width * scale;
      const scaledH = pageRect.height * scale;
      page.style.margin = `${-(pageRect.height - scaledH) / 2}px ${-(pageRect.width - scaledW) / 2}px`;
    },

    _printFromPreview() {
      // Apply the preview orientation before printing
      const pageStyle = document.createElement('style');
      pageStyle.id = 'print-page-style';

      const size = state.paperSize === 'a4'
        ? (this._previewOrientation === 'landscape' ? '297mm 210mm' : '210mm 297mm')
        : (this._previewOrientation === 'landscape' ? '11in 8.5in' : '8.5in 11in');

      pageStyle.textContent = `@page { size: ${size}; margin: 10mm; }`;

      document.getElementById('print-page-style')?.remove();
      document.head.appendChild(pageStyle);

      this.closePreview();

      // Small delay to let overlay close before print dialog
      setTimeout(() => window.print(), 100);
    },

    closePreview() {
      this._overlay?.remove();
      this._overlay = null;
      document.removeEventListener('keydown', this._escHandler);
      window.removeEventListener('resize', this._onResize);
    },

    // Direct print (no preview) - kept for keyboard shortcut
    print() {
      const pageStyle = document.createElement('style');
      pageStyle.id = 'print-page-style';

      const size = state.paperSize === 'a4'
        ? (state.orientation === 'landscape' ? '297mm 210mm' : '210mm 297mm')
        : (state.orientation === 'landscape' ? '11in 8.5in' : '8.5in 11in');

      pageStyle.textContent = `@page { size: ${size}; margin: 10mm; }`;

      document.getElementById('print-page-style')?.remove();
      document.head.appendChild(pageStyle);

      window.print();
    },
  };

  // =============================================
  // SECTION 9: EVENT MODAL CONTROLLER
  // =============================================

  const ModalController = {
    _currentKey: null,
    _currentIndex: null,

    init() {
      document.getElementById('save-event-btn').addEventListener('click', () => this._save());
      document.getElementById('cancel-event-btn').addEventListener('click', () => this._close());
      document.getElementById('delete-event-btn').addEventListener('click', () => this._delete());

      // Keyboard shortcuts
      document.getElementById('event-modal').addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this._close();
        }
      });

      document.getElementById('event-text').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this._save();
        }
      });
    },

    open(key, eventIndex) {
      SidebarToggle.close();
      this._currentKey = key;
      this._currentIndex = eventIndex;

      const modal = document.getElementById('event-modal');
      const textarea = document.getElementById('event-text');
      const deleteBtn = document.getElementById('delete-event-btn');
      const titleEl = document.getElementById('modal-title');
      const dateDisplay = document.getElementById('modal-date-display');

      dateDisplay.textContent = this._formatKeyForDisplay(key);
      textarea.placeholder = i18n.t('eventPlaceholder');

      if (eventIndex !== null) {
        const events = EventStore.getEvents(key);
        textarea.value = events[eventIndex] || '';
        titleEl.textContent = i18n.t('editEvent');
        deleteBtn.classList.remove('hidden');
        deleteBtn.textContent = i18n.t('delete');
      } else {
        textarea.value = '';
        titleEl.textContent = i18n.t('addEvent');
        deleteBtn.classList.add('hidden');
      }

      // Update button texts
      document.getElementById('save-event-btn').textContent = i18n.t('save');
      document.getElementById('cancel-event-btn').textContent = i18n.t('cancel');

      modal.showModal();
      textarea.focus();
    },

    _save() {
      const text = document.getElementById('event-text').value.trim();
      if (!text) return;

      if (this._currentIndex !== null) {
        EventStore.updateEvent(this._currentKey, this._currentIndex, text);
      } else {
        EventStore.addEvent(this._currentKey, text);
      }
      this._close();
      Navigation.renderActiveView();
    },

    _delete() {
      if (this._currentIndex !== null) {
        EventStore.deleteEvent(this._currentKey, this._currentIndex);
      }
      this._close();
      Navigation.renderActiveView();
    },

    _close() {
      document.getElementById('event-modal').close();
    },

    _formatKeyForDisplay(key) {
      // Handle time keys like "2026-02-14T09:00"
      const hasTime = key.includes('T');
      const datePart = hasTime ? key.split('T')[0] : key;
      const timePart = hasTime ? key.split('T')[1] : null;

      const parts = datePart.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);

      const date = new Date(year, month, day);
      const weekdayName = i18n.weekdayName(date.getDay());
      const monthName = i18n.monthName(month);

      let display = `${weekdayName} ${day} ${monthName} ${year}`;
      if (timePart) {
        display += `, ${timePart}`;
      }
      return display;
    },
  };

  // =============================================
  // SECTION 10: NAVIGATION CONTROLLER
  // =============================================

  const Navigation = {
    init() {
      // Populate year select
      const yearSelect = document.getElementById('year-select');
      for (let y = CONFIG.YEAR_RANGE_START; y <= CONFIG.YEAR_RANGE_END; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      }
      yearSelect.value = state.year;

      // Populate month select
      this._populateMonthSelect();

      // Bind events
      document.getElementById('prev-btn').addEventListener('click', () => this.prev());
      document.getElementById('next-btn').addEventListener('click', () => this.next());
      document.getElementById('month-select').addEventListener('change', (e) => {
        state.month = parseInt(e.target.value);
        this._updateWeekSelector();
        this.renderActiveView();
      });
      document.getElementById('year-select').addEventListener('change', (e) => {
        state.year = parseInt(e.target.value);
        this._updateWeekSelector();
        this.renderActiveView();
      });
      document.getElementById('month-view-btn').addEventListener('click', () => this.setView('month'));
      document.getElementById('week-view-btn').addEventListener('click', () => this.setView('week'));
      document.getElementById('week-select').addEventListener('change', (e) => {
        state.weekNumber = parseInt(e.target.value);
        this.renderActiveView();
      });
      document.getElementById('lang-select').addEventListener('change', (e) => {
        state.lang = e.target.value;
        document.documentElement.lang = state.lang;
        this._populateMonthSelect();
        this._updateUILabels();
        this._updateWeekSelector();
        this.renderActiveView();
        Customizer.saveSettings();
      });
      document.getElementById('week-start-select').addEventListener('change', (e) => {
        state.weekStart = parseInt(e.target.value);
        this._updateWeekSelector();
        this.renderActiveView();
        Customizer.saveSettings();
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        // Don't navigate if modal is open or an input is focused
        if (document.getElementById('event-modal').open) return;
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          PrintController.print();
        }
      });
    },

    prev() {
      if (state.view === 'month') {
        state.month--;
        if (state.month < 0) {
          state.month = 11;
          state.year--;
        }
      } else {
        state.weekNumber--;
        if (state.weekNumber < 1) {
          state.year--;
          state.weekNumber = CalendarEngine.getISOWeekNumber(new Date(state.year, 11, 28));
        }
      }
      this._syncSelects();
      this._updateWeekSelector();
      this.renderActiveView();
    },

    next() {
      if (state.view === 'month') {
        state.month++;
        if (state.month > 11) {
          state.month = 0;
          state.year++;
        }
      } else {
        state.weekNumber++;
        const maxWeek = CalendarEngine.getISOWeekNumber(new Date(state.year, 11, 28));
        if (state.weekNumber > maxWeek) {
          state.year++;
          state.weekNumber = 1;
        }
      }
      this._syncSelects();
      this._updateWeekSelector();
      this.renderActiveView();
    },

    setView(view) {
      state.view = view;
      document.getElementById('month-view').classList.toggle('hidden', view !== 'month');
      document.getElementById('week-view').classList.toggle('hidden', view !== 'week');
      document.getElementById('week-selector').classList.toggle('hidden', view !== 'week');
      document.getElementById('month-view-btn').classList.toggle('active', view === 'month');
      document.getElementById('week-view-btn').classList.toggle('active', view === 'week');

      if (view === 'week' && !state.weekNumber) {
        state.weekNumber = CalendarEngine.getISOWeekNumber(new Date(state.year, state.month, 1));
        this._updateWeekSelector();
      }
      this.renderActiveView();
    },

    renderActiveView() {
      this.updateTitle();
      if (state.view === 'month') {
        MonthRenderer.render();
      } else {
        WeekRenderer.render();
      }
    },

    updateTitle() {
      const titleEl = document.getElementById('calendar-title');
      if (state.view === 'month') {
        titleEl.textContent = `${i18n.monthName(state.month)} ${state.year}`;
      } else {
        titleEl.textContent = `${i18n.t('week')} ${state.weekNumber}, ${state.year}`;
      }
    },

    _syncSelects() {
      document.getElementById('year-select').value = state.year;
      document.getElementById('month-select').value = state.month;
    },

    _populateMonthSelect() {
      const select = document.getElementById('month-select');
      const currentValue = select.value;
      select.innerHTML = '';
      TRANSLATIONS[state.lang].months.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = name;
        select.appendChild(opt);
      });
      select.value = currentValue !== '' ? currentValue : state.month;
    },

    _updateWeekSelector() {
      const select = document.getElementById('week-select');
      const weeks = CalendarEngine.getWeeksInMonth(state.year, state.month);
      select.innerHTML = '';
      weeks.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w;
        opt.textContent = `${i18n.t('week')} ${w}`;
        select.appendChild(opt);
      });
      if (state.weekNumber && weeks.includes(state.weekNumber)) {
        select.value = state.weekNumber;
      } else if (weeks.length > 0) {
        state.weekNumber = weeks[0];
        select.value = weeks[0];
      }
    },

    _updateUILabels() {
      // Update sidebar labels based on current language
      const sections = document.querySelectorAll('.sidebar-section h2');
      const sectionKeys = ['navigation', 'settings', 'appearance'];
      sections.forEach((el, i) => {
        if (sectionKeys[i]) {
          el.textContent = i18n.t(sectionKeys[i]);
        }
      });

      // Update view toggle buttons
      document.getElementById('month-view-btn').textContent = i18n.t('month');
      document.getElementById('week-view-btn').textContent = i18n.t('week');

      // Update preview button (navbar)
      const navPreviewLabel = document.getElementById('navbar-preview-label');
      if (navPreviewLabel) navPreviewLabel.textContent = i18n.t('previewAndPrint');

      // Update setting labels
      const langLabel = document.querySelector('label[for="lang-select"]');
      if (langLabel) langLabel.textContent = i18n.t('language');

      const weekStartLabel = document.querySelector('label[for="week-start-select"]');
      if (weekStartLabel) weekStartLabel.textContent = i18n.t('weekStarts');

      // Update week start options
      const weekStartSelect = document.getElementById('week-start-select');
      weekStartSelect.options[0].textContent = i18n.t('monday');
      weekStartSelect.options[1].textContent = i18n.t('sunday');

      // Update appearance labels
      const themeLabel = document.querySelector('label[for="theme-select"]');
      if (themeLabel) themeLabel.textContent = i18n.t('theme');

      const themeSelect = document.getElementById('theme-select');
      const themeKeys = ['themeLight', 'themeDark', 'themePastel', 'themeClassic', 'themeMono'];
      Array.from(themeSelect.options).forEach((opt, i) => {
        if (themeKeys[i]) opt.textContent = i18n.t(themeKeys[i]);
      });

      const paperLabel = document.querySelector('label[for="paper-select"]');
      if (paperLabel) paperLabel.textContent = i18n.t('paperSize');

      const orientLabel = document.querySelector('label[for="orientation-select"]');
      if (orientLabel) orientLabel.textContent = i18n.t('orientation');

      const orientSelect = document.getElementById('orientation-select');
      orientSelect.options[0].textContent = i18n.t('portrait');
      orientSelect.options[1].textContent = i18n.t('landscape');

      const fontLabel = document.querySelector('label[for="font-size-slider"]');
      if (fontLabel) fontLabel.textContent = i18n.t('fontSize');

      const cornerLabel = document.querySelector('label[for="corner-radius-slider"]');
      if (cornerLabel) cornerLabel.textContent = i18n.t('cornerRadius');

      const gridLabel = document.querySelector('label[for="grid-style-select"]');
      if (gridLabel) gridLabel.textContent = i18n.t('gridStyle');

      const gridSelect = document.getElementById('grid-style-select');
      const gridKeys = ['gridSolid', 'gridDashed', 'gridDotted', 'gridNone'];
      Array.from(gridSelect.options).forEach((opt, i) => {
        if (gridKeys[i]) opt.textContent = i18n.t(gridKeys[i]);
      });

      // Week selector label
      const weekLabel = document.querySelector('.week-selector label');
      if (weekLabel) weekLabel.textContent = i18n.t('weekLabel') + ':';

      // Navbar title (always CALPRINT)
      const navTitle = document.querySelector('.navbar-title');
      if (navTitle) navTitle.textContent = 'CALPRINT';
    },
  };

  // =============================================
  // SECTION 11: INITIALIZATION
  // =============================================

  // =============================================
  // SECTION 11B: SIDEBAR TOGGLE CONTROLLER
  // =============================================

  const SidebarToggle = {
    init() {
      const menuBtn = document.getElementById('menu-toggle-btn');
      const overlay = document.getElementById('sidebar-overlay');

      menuBtn.addEventListener('click', () => this.toggle());
      overlay.addEventListener('click', () => this.close());
    },

    toggle() {
      document.body.classList.toggle('sidebar-open');
    },

    open() {
      document.body.classList.add('sidebar-open');
    },

    close() {
      document.body.classList.remove('sidebar-open');
    },
  };

  // =============================================
  // SECTION 12: INTRO MODAL CONTROLLER
  // =============================================

  const IntroController = {
    STORAGE_KEY: 'calprint-intro-seen',

    init() {
      const modal = document.getElementById('intro-modal');
      const btn = document.getElementById('intro-start-btn');
      if (!modal || !btn) return;

      // Show every time the app opens
      modal.showModal();

      btn.addEventListener('click', () => {
        modal.close();
      });
    },
  };

  function init() {
    EventStore.load();
    Customizer.init();
    Customizer.loadSettings();
    Navigation.init();
    ModalController.init();
    SidebarToggle.init();
    IntroController.init();

    // Navbar preview & print button
    document.getElementById('navbar-preview-btn').addEventListener('click', () => {
      SidebarToggle.close();
      PrintController.openPreview();
    });

    // Ensure paper/orientation classes
    Customizer._ensurePaperClasses();

    // Initial render
    Navigation._syncSelects();
    Navigation._updateWeekSelector();
    Navigation.renderActiveView();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
