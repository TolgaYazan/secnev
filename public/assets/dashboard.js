const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = { assets: [], alerts: [], incidents: [], stats: null, methodology: null };

async function api(path) {
  const res = await fetch(path, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

const fmt = (n, digits = 0) =>
  n == null || Number.isNaN(Number(n))
    ? "—"
    : Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });

const usd = (n) =>
  n == null || Number.isNaN(Number(n))
    ? "—"
    : Number(n).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const pct = (n, digits = 1) => (n == null ? "—" : `${(Number(n) * 100).toFixed(digits)}%`);

const short = (s, head = 10, tail = 6) =>
  !s || s.length <= head + tail + 2 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

const ago = (ts) => {
  if (!ts) return "never";
  const s = Math.floor((Date.now() - Number(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const tierClass = (t) => `tier ${t ?? "unknown"}`;
const gradeClass = (g) => `grade ${String(g ?? "").replace("+", "plus").replace("-", "minus")}`;
const riskColor = (s) =>
  s == null ? "#2dd4a7" : s >= 70 ? "#ff5a5f" : s >= 50 ? "#ff9f43" : s >= 25 ? "#ffd166" : "#2dd4a7";

function scoreDial(score, grade) {
  const s = score == null ? 0 : Number(score);
  const color = s >= 70 ? "#ff5a5f" : s >= 50 ? "#ff9f43" : s >= 25 ? "#ffd166" : "#2dd4a7";
  return `<div class="dial" style="--score:${s};--dial-color:${color}">
    <div class="dial-inner"><div class="dial-score">${score ?? "—"}</div><div class="dial-grade">${grade ?? "—"}</div></div>
  </div>`;
}

function assetRow(a, full = false) {
  const supply =
    a.supply != null && a.decimals != null
      ? fmt(Number(a.supply) / 10 ** Number(a.decimals), 2)
      : "—";
  return `<tr data-id="${a.id}" class="row">
    <td>
      <div class="sym">${a.symbol}</div>
      <div class="muted small">${a.name}</div>
    </td>
    <td><span class="chip">${a.kind}</span></td>
    <td><strong>${a.score ?? "—"}</strong></td>
    <td><span class="${gradeClass(a.grade)}">${a.grade ?? "—"}</span></td>
    <td><span class="${tierClass(a.tier)}">${a.tier ?? "unscored"}</span></td>
    ${
      full
        ? `<td>${a.confidence ?? "—"}</td>`
        : ""
    }
    ${
      full
        ? `<td>${
            a.peg_status
              ? `${a.peg_status}${a.peg_deviation_pct != null ? ` ${Number(a.peg_deviation_pct).toFixed(2)}%` : ""}`
              : "—"
          }</td>`
        : ""
    }
    <td>${a.coverage_live ?? 0}/${a.coverage_total ?? 0}</td>
    <td>${full ? (a.price_usd ? `$${Number(a.price_usd).toFixed(4)}` : "—") : supply}</td>
    <td>${fmt(a.holders)}</td>
  </tr>`;
}

function renderAssets() {
  const rows = state.assets;
  $("#asset-count").textContent = `${rows.length} tracked`;
  const body = $("#assets-table tbody");
  const fullBody = $("#assets-table-full tbody");
  if (body) body.innerHTML = rows.map((a) => assetRow(a, false)).join("");
  if (fullBody) fullBody.innerHTML = rows.map((a) => assetRow(a, true)).join("");
  $("#assets-empty").hidden = rows.length > 0;
  $$("tr.row").forEach((tr) =>
    tr.addEventListener("click", () => openAsset(tr.dataset.id)),
  );
}

function renderStats() {
  const s = state.stats ?? {};
  const last = s.lastIngest;
  const live = state.assets.reduce((acc, a) => acc + (Number(a.coverage_live) || 0), 0);
  const total = state.assets.reduce((acc, a) => acc + (Number(a.coverage_total) || 0), 0);
  const cards = [
    ["Assets tracked", s.assets ?? 0, "stablecoins, vaults, tokens"],
    ["Signal coverage", `${live}/${total}`, `${Math.max(0, total - live)} unknown`],
    ["Alerts (7d)", s.alerts7d ?? 0, `${s.alertsDelivered7d ?? 0} delivered`],
    ["Last ingest", last ? ago(last.finished_at ?? last.started_at) : "never", last ? last.status : "run npm run ingest"],
  ];
  $("#stats").innerHTML = cards
    .map(
      ([label, value, note]) => `<div class="card">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
        <div class="muted small">${note}</div>
      </div>`,
    )
    .join("");
}

function alertItem(a) {
  const deliveries = (a.deliveries ?? [])
    .map((d) => `${d.channel}:${d.status}`)
    .join(", ");
  return `<div class="alert-item" data-id="${a.asset_id}">
    <div class="alert-top">
      <span class="${tierClass(a.new_tier)}">${a.new_tier ?? a.severity}</span>
      <strong>${a.asset_symbol}</strong>
      <span class="muted small">${a.detector.replaceAll("_", " ")} · ${ago(a.created_at)} · delivery: ${deliveries || a.delivery_status || "not configured"}</span>
    </div>
    <div class="alert-why">${a.why_now}</div>
  </div>`;
}

function renderAlerts() {
  const list = state.alerts;
  const html = list.length
    ? list.map(alertItem).join("")
    : `<div class="empty">No alerts yet. Alerts appear when a tier changes or a score jumps 20+ points.</div>`;
  $("#alerts-feed").innerHTML = html;
  $("#overview-alerts").innerHTML =
    list.slice(0, 5).map(alertItem).join("") || `<div class="empty">No alerts yet.</div>`;
  $$(".alert-item").forEach((el) =>
    el.addEventListener("click", () => el.dataset.id && openAsset(el.dataset.id)),
  );
}

function renderIncidents() {
  $("#incidents-list").innerHTML = state.incidents
    .map(
      (i) => `<article class="incident">
        <div class="incident-top">
          <span class="chip">${i.category}</span>
          <strong>${i.asset_symbol ?? "ecosystem"}</strong>
          <span class="muted small">${i.date}</span>
        </div>
        <h3>${i.mechanism}</h3>
        <p>${i.summary}</p>
        <div class="muted small">Loss: ${i.loss} · Status: ${i.status}</div>
        <div class="links">${(i.links ?? [])
          .map((l) => `<a href="${l}" target="_blank" rel="noreferrer">source ↗</a>`)
          .join("")}</div>
      </article>`,
    )
    .join("");
}

function sparkline(history) {
  if (!history || history.length < 2) return `<div class="muted small">Not enough history yet.</div>`;
  const w = 520;
  const h = 90;
  const pad = 8;
  const scores = history.map((p) => Number(p.score));
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const x = (i) => pad + (i / (history.length - 1)) * (w - pad * 2);
  const y = (v) => h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
  const pts = history.map((p, i) => `${x(i).toFixed(1)},${y(Number(p.score)).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Score history">
    <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.5" />
  </svg>`;
}

function signalRow(s) {
  const status = s.status ?? "unknown";
  return `<tr>
    <td><span class="status ${status}">${status}</span></td>
    <td>${s.name}</td>
    <td>${s.score ?? "—"}</td>
    <td>${s.confidence}</td>
    <td class="reason">${s.reason}
      <details><summary>evidence</summary><pre>${JSON.stringify(s.evidence, null, 2)}</pre></details>
    </td>
  </tr>`;
}

function lockRows(snapshot) {
  const locks = snapshot?.lock_distribution ?? [];
  if (!locks.length) return `<div class="muted small">No lock distribution yet.</div>`;
  return `<div class="locks">${locks
    .slice(0, 10)
    .map(
      (l) => `<div class="lock-row">
        <span>${l.name ?? short(l.codeHash)}</span>
        <span class="muted">${l.holders} holders</span>
        <span class="bar"><i style="width:${Math.min(100, l.share * 100).toFixed(1)}%"></i></span>
      </div>`,
    )
    .join("")}</div>`;
}

async function openAsset(id) {
  const a = await api(`/api/v1/assets/${encodeURIComponent(id)}`);
  const score = a.score;
  const snap = a.snapshot;
  const liquidity = score?.signals?.find((s) => s.id === "liquidity_depth");
  const tvl = liquidity?.evidence?.tvlUsd;
  $("#drawer-type").textContent = `${a.kind} · ${a.source}`;
  $("#drawer-title").textContent = `${a.symbol} — ${a.name}`;
  $("#drawer-sub").textContent = `${a.tags?.join(" · ") || "no tags"} · updated ${ago(score?.ts)}`;
  $("#drawer-body").innerHTML = `
    <div class="drawer-score">
      ${scoreDial(score?.score, score?.grade)}
      <div class="drawer-meta">
        <div><span class="${tierClass(score?.tier)}">${score?.tier ?? "unscored"}</span></div>
        <div class="muted">Confidence: ${score?.confidence ?? "—"}</div>
        <div class="muted">Coverage: ${score?.coverage_live ?? 0}/${score?.coverage_total ?? 0} signals</div>
        <div class="muted">Supply: ${snap?.supply ? fmt(Number(snap.supply) / 10 ** a.decimals, 2) : "—"} ${a.symbol}</div>
        ${snap?.exchange_rate != null ? `<div class="muted">Exchange rate: ${Number(snap.exchange_rate).toFixed(6)} CKB/${a.symbol}${snap?.vault_backing_ratio != null ? ` · backing ${Number(snap.vault_backing_ratio).toFixed(4)}` : ""}</div>` : ""}
        <div class="muted">Price: ${snap?.price_usd ? `$${Number(snap.price_usd).toFixed(4)} (${snap.price_source})` : "unknown"}</div>
        <div class="muted">Peg: ${score?.peg_status ?? "—"}${score?.peg_deviation_pct != null ? ` · ${Number(score.peg_deviation_pct).toFixed(2)}% off` : ""}</div>
        <div class="muted">Liquidity: ${tvl != null ? usd(tvl) : "unknown"}${liquidity?.evidence?.lastPoolTxAgeHours != null ? ` · last pool tx ${Number(liquidity.evidence.lastPoolTxAgeHours).toFixed(0)}h ago` : ""}</div>
        <div class="muted">Holders: ${fmt(snap?.holders)} · Top 10 organic: ${pct(snap?.organic_top10_share ?? snap?.top10_share)}${snap?.raw_top10_share != null ? ` · raw ${pct(snap.raw_top10_share)}` : ""}</div>
      </div>
    </div>

    <h3>Score drivers</h3>
    <div class="drivers">
      ${
        score?.drivers?.length
          ? score.drivers
              .slice(0, 8)
              .map(
                (d) => `<div class="driver">
                  <div class="driver-top"><strong>${d.name}</strong><span style="color:${riskColor(d.score)}">${d.score}</span></div>
                  <div class="bar"><i style="width:${Math.min(100, d.score)}%;background:${riskColor(d.score)}"></i></div>
                  <div class="muted small">weight ${(d.weight * 100).toFixed(0)}% · contribution ${d.contribution.toFixed(1)}</div>
                  <div class="small">${d.reason}</div>
                </div>`,
              )
              .join("")
          : `<div class="empty">No weighted drivers yet.</div>`
      }
    </div>

    <h3>Signals</h3>
    <div class="table-wrap">
      <table class="signals">
        <thead><tr><th>Status</th><th>Signal</th><th>Score</th><th>Conf.</th><th>Reason / evidence</th></tr></thead>
        <tbody>${(score?.signals ?? []).map(signalRow).join("")}</tbody>
      </table>
    </div>

    <h3>Score history</h3>
    ${sparkline(a.history)}

    <h3>Holder lock distribution</h3>
    ${lockRows(snap)}

    <h3>Type script</h3>
    <pre class="code">${JSON.stringify(
      {
        typeHash: a.type_hash,
        codeHash: a.code_hash,
        hashType: a.hash_type,
        args: a.args,
        issuer: a.issuer,
        notes: a.notes,
      },
      null,
      2,
    )}</pre>
  `;
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#scrim").hidden = false;
}

function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#scrim").hidden = true;
}

function renderWallet(w) {
  const holdings = (w.udtAccounts ?? []).length
    ? w.udtAccounts
        .map(
          (u) => `<tr>
            <td>${esc(u.symbol ?? "unknown")}</td>
            <td>${fmt(Number(u.amount) / 10 ** Number(u.decimals || 0), 2)}</td>
            <td class="muted small">${short(esc(u.typeHash))}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="muted">No token holdings resolved.</td></tr>`;

  const counterparties = (w.counterparties ?? []).length
    ? w.counterparties
        .map(
          (c) => `<tr>
            <td>${short(esc(c.address))}</td>
            <td>${esc(c.label ?? "unlabelled")}</td>
            <td><span class="chip">${esc(c.kind)}</span></td>
            <td>${c.interactions}</td>
            <td>${c.risk}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="5" class="muted">No recent counterparties resolved.</td></tr>`;

  const signals = (w.signals ?? [])
    .map(
      (s) => `<tr>
        <td><span class="status ${s.status}">${s.status}</span></td>
        <td>${esc(s.id.replaceAll("_", " "))}</td>
        <td class="reason">${esc(s.reason)}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="method-grid">
      <div class="method-card">
        <h3>Address</h3>
        <div class="muted small">${esc(w.address)}</div>
        <div class="muted small">${fmt(w.balanceCkb, 4)} CKB · ${fmt(w.liveCells)} live cells${w.partial ? " · partial scan" : ""}</div>
        <div class="muted small">${fmt(w.transactions)} txs</div>
      </div>
      <div class="method-card">
        <h3>Lock</h3>
        <div>${esc(w.lockLabel ?? "unlabelled")}</div>
        <div class="muted small">${esc(w.lockKind)} · ${short(esc(w.lock.codeHash))}</div>
      </div>
      <div class="method-card">
        <h3>Exposure</h3>
        <div><span class="${tierClass(w.tier)}">${w.tier}</span> · score ${w.riskScore}</div>
        <div class="muted small">Taint: ${esc(w.taint)}</div>
      </div>
    </div>
    <h3>Signals</h3>
    <div class="table-wrap">
      <table class="signals">
        <thead><tr><th>Status</th><th>Signal</th><th>Reason</th></tr></thead>
        <tbody>${signals}</tbody>
      </table>
    </div>
    <h3>Token holdings</h3>
    <div class="table-wrap">
      <table class="mini">
        <thead><tr><th>Token</th><th>Amount</th><th>Type hash</th></tr></thead>
        <tbody>${holdings}</tbody>
      </table>
    </div>
    <h3>Recent counterparties</h3>
    <div class="table-wrap">
      <table class="mini">
        <thead><tr><th>Address</th><th>Label</th><th>Kind</th><th>Hits</th><th>Risk</th></tr></thead>
        <tbody>${counterparties}</tbody>
      </table>
    </div>
  `;
}

async function checkWallet(address) {
  const out = $("#wallet-result");
  out.innerHTML = `<div class="muted">Loading ${esc(address)}…</div>`;
  try {
    const w = await api(`/api/v1/wallet/${encodeURIComponent(address)}`);
    out.innerHTML = renderWallet(w);
  } catch (e) {
    out.innerHTML = `<div class="empty">Could not screen this address: ${esc(e.message)}</div>`;
  }
}

function renderMethodology() {
  const m = state.methodology;
  if (!m) return;
  $("#method-version").textContent = m.version;
  $("#method-version-2").textContent = m.version;
  $("#methodology-body").innerHTML = `
    <div class="method-grid">
      <div class="method-card">
        <h3>Polarity</h3>
        <p>${m.polarity}. Letter grades run the conventional way: A+ is best, F is worst.</p>
      </div>
      <div class="method-card">
        <h3>Grades</h3>
        <div class="chips">${m.grades.map((g) => `<span class="chip">${g.grade} ≤ ${g.max}</span>`).join("")}</div>
      </div>
      <div class="method-card">
        <h3>Tiers</h3>
        <div class="chips">${m.tiers.map((t) => `<span class="${tierClass(t.tier)}">${t.tier} ≤ ${t.max}</span>`).join("")}</div>
      </div>
    </div>
    <h3>Rules</h3>
    <ul>${m.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
    <h3>Weights by entity</h3>
    <div class="weights">${Object.entries(m.weights)
      .map(
        ([kind, weights]) => `<div class="method-card">
          <h4>${kind}</h4>
          <table class="mini">${Object.entries(weights)
            .map(([k, v]) => `<tr><td>${k.replaceAll("_", " ")}</td><td>${(Number(v) * 100).toFixed(0)}%</td></tr>`)
            .join("")}</table>
        </div>`,
      )
      .join("")}</div>
    <h3>Thresholds</h3>
    <pre class="code">${JSON.stringify(m.thresholds, null, 2)}</pre>
  `;
}

function switchTab(name) {
  $$("nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.id === `tab-${name}`));
}

async function init() {
  try {
    const [assets, stats, alerts, incidents, methodology] = await Promise.all([
      api("/api/v1/assets"),
      api("/api/v1/stats"),
      api("/api/v1/alerts"),
      api("/api/v1/incidents"),
      api("/api/v1/methodology"),
    ]);
    state.assets = assets.data ?? [];
    state.stats = stats;
    state.alerts = alerts.data ?? [];
    state.incidents = incidents.data ?? [];
    state.methodology = methodology;
    renderStats();
    renderAssets();
    renderAlerts();
    renderIncidents();
    renderMethodology();
    $("#status-text").textContent = `${state.assets.length} assets · live`;
  } catch (e) {
    console.error(e);
    $("#status-text").textContent = "api unavailable";
    $("#status-text").style.color = "#ff5a5f";
  }

  $$("nav button").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $("#drawer-close").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  $("#wallet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const address = $("#wallet-address").value.trim();
    if (address) checkWallet(address);
  });
  $("#search")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    $$("#assets-table-full tbody tr").forEach((tr) => {
      tr.hidden = q && !tr.textContent.toLowerCase().includes(q);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

init();
