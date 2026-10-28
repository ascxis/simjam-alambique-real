// Integradores explícitos para modelos continuos en JavaScript puro.
export function euler(f, x, u, t, h, p) {
  const dx = f(x, u, t, p);
  return x.map((xi, i) => xi + h * dx[i]);
}

export function rk4(f, x, u, t, h, p) {
  const add = (a, b, scale) => a.map((v, i) => v + scale * b[i]);
  const k1 = f(x, u, t, p);
  const k2 = f(add(x, k1, h / 2), u, t + h / 2, p);
  const k3 = f(add(x, k2, h / 2), u, t + h / 2, p);
  const k4 = f(add(x, k3, h), u, t + h, p);
  return x.map((xi, i) => xi + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
