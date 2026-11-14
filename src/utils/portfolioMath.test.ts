import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  lerp,
  computeMagneticOffset,
  computeMarqueeVelocity,
  formatStudioClock,
  filterProjects,
} from './portfolioMath';

test('clamp restricts numbers to inclusive bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-4, 0, 10), 0);
  assert.equal(clamp(42, 0, 10), 10);
});

test('lerp interpolates linearly', () => {
  assert.equal(lerp(0, 100, 0.25), 25);
  assert.equal(lerp(10, 20, 0.5), 15);
});

test('computeMagneticOffset pulls toward cursor within radius and resets outside', () => {
  const rect = { left: 100, top: 100, width: 100, height: 40 }; // center (150, 120)
  const near = computeMagneticOffset(180, 120, rect, 0.5, 100);
  assert.equal(near.active, true);
  assert.ok(near.x > 0);
  assert.equal(near.y, 0);

  const far = computeMagneticOffset(400, 400, rect, 0.5, 100);
  assert.deepEqual(far, { x: 0, y: 0, active: false });
});

test('computeMarqueeVelocity accelerates and reverses with scroll velocity', () => {
  const idle = computeMarqueeVelocity(1, 0);
  assert.equal(idle.direction, 1);
  assert.equal(idle.speed, 1);

  const scrollingDown = computeMarqueeVelocity(1, 50, 4);
  assert.equal(scrollingDown.direction, 1);
  assert.ok(scrollingDown.speed > 1 && scrollingDown.speed <= 5);

  const scrollingUp = computeMarqueeVelocity(1, -200, 4);
  assert.equal(scrollingUp.direction, -1);
  assert.equal(scrollingUp.speed, 5);
});

test('formatStudioClock formats deterministic UTC/Colombo time', () => {
  const fixedDate = new Date('2026-11-14T12:00:00Z');
  const formatted = formatStudioClock(fixedDate, 'UTC');
  assert.equal(formatted.time, '12:00:00');
  assert.match(formatted.dateLabel, /Nov 14, 2026/);
});

test('filterProjects filters by category cleanly', () => {
  const items = [
    { id: '1', category: 'WebGL & 3D' },
    { id: '2', category: 'Product Systems' },
    { id: '3', category: 'WebGL & 3D' },
  ];
  assert.equal(filterProjects(items, 'All').length, 3);
  assert.equal(filterProjects(items, 'WebGL & 3D').length, 2);
  assert.equal(filterProjects(items, 'Product Systems').length, 1);
});
