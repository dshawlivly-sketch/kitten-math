/* Sketchpad: a scratch-paper canvas tuned for Apple Pencil on iPad.
 *
 * - Pointer Events with pressure → line width for the Pencil
 * - Palm rejection: once a pen has been seen, finger touches are ignored
 * - Strokes are kept as vectors so undo and resize redraw crisply
 */
(function () {
  'use strict';

  class Sketchpad {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.strokes = [];
      this.current = null;
      this.color = '#4a3b2c';
      this.erasing = false;
      this.penSeen = false;
      this.activeId = null;
      this.onChange = null;

      const opts = { passive: false };
      canvas.addEventListener('pointerdown', (e) => this.down(e), opts);
      canvas.addEventListener('pointermove', (e) => this.move(e), opts);
      canvas.addEventListener('pointerup', (e) => this.up(e), opts);
      canvas.addEventListener('pointercancel', (e) => this.up(e), opts);
      // stop iOS from scrolling / selecting / showing the callout while writing
      ['touchstart', 'touchmove', 'gesturestart', 'contextmenu'].forEach((t) =>
        canvas.addEventListener(t, (e) => e.preventDefault(), opts));

      new ResizeObserver(() => this.resize()).observe(canvas);
      this.resize();
    }

    resize() {
      const r = this.canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      this.dpr = dpr;
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
      this.redraw();
    }

    point(e) {
      const r = this.canvas.getBoundingClientRect();
      const pen = e.pointerType === 'pen';
      return { x: e.clientX - r.left, y: e.clientY - r.top, p: pen && e.pressure > 0 ? e.pressure : 0.5 };
    }

    down(e) {
      e.preventDefault();
      if (e.pointerType === 'pen') this.penSeen = true;
      if (this.penSeen && e.pointerType === 'touch') return;   // palm / resting hand
      if (this.activeId !== null) return;
      this.activeId = e.pointerId;
      try { this.canvas.setPointerCapture(e.pointerId); } catch (err) { /* older Safari */ }
      const pen = e.pointerType === 'pen';
      this.current = {
        color: this.color,
        erase: this.erasing,
        size: this.erasing ? 26 : pen ? 3.2 : 3.6,
        pen,
        pts: [this.point(e)],
      };
      this.drawDot(this.current);
    }

    move(e) {
      if (e.pointerId !== this.activeId || !this.current) return;
      e.preventDefault();
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      (events.length ? events : [e]).forEach((ev) => {
        const pts = this.current.pts;
        const pt = this.point(ev);
        const last = pts[pts.length - 1];
        if (Math.abs(pt.x - last.x) + Math.abs(pt.y - last.y) < 0.6) return;
        pts.push(pt);
        this.drawSegment(this.current, pts.length - 1);
      });
    }

    up(e) {
      if (e.pointerId !== this.activeId) return;
      this.activeId = null;
      if (this.current) {
        this.strokes.push(this.current);
        this.current = null;
        if (this.onChange) this.onChange();
      }
    }

    width(s, p) {
      return s.erase || !s.pen ? s.size : s.size * (0.45 + p * 1.5);
    }

    style(s) {
      const c = this.ctx;
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      c.strokeStyle = c.fillStyle = s.color;
    }

    drawDot(s) {
      const c = this.ctx, p = s.pts[0];
      this.style(s);
      c.beginPath();
      c.arc(p.x, p.y, this.width(s, p.p) / 2, 0, Math.PI * 2);
      c.fill();
    }

    drawSegment(s, i) {
      const c = this.ctx, a = s.pts[i - 1], b = s.pts[i];
      this.style(s);
      c.lineWidth = this.width(s, (a.p + b.p) / 2);
      c.beginPath();
      if (i >= 2) {
        // smooth with a quadratic curve through midpoints
        const z = s.pts[i - 2];
        c.moveTo((z.x + a.x) / 2, (z.y + a.y) / 2);
        c.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      } else {
        c.moveTo(a.x, a.y);
        c.lineTo((a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      c.stroke();
    }

    redraw() {
      const c = this.ctx;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.strokes.forEach((s) => {
        this.drawDot(s);
        for (let i = 1; i < s.pts.length; i++) this.drawSegment(s, i);
      });
    }

    undo() {
      this.strokes.pop();
      this.redraw();
      if (this.onChange) this.onChange();
    }

    clear() {
      this.strokes = [];
      this.current = null;
      this.activeId = null;
      this.redraw();
      if (this.onChange) this.onChange();
    }

    setColor(color) { this.color = color; this.erasing = false; }
    setEraser(on) { this.erasing = on; }
    get isEmpty() { return this.strokes.length === 0; }
  }

  window.KM = window.KM || {};
  window.KM.Sketchpad = Sketchpad;
})();
