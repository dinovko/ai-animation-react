const NAV = [
  {
    label: "Workspace",
    items: [
      ["Overview", "M4 5h16v14H4z M4 9h16"],
      ["Queue", "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"],
      ["Calendar", "M5 5h14v14H5z M5 9h14M9 3v4M15 3v4"],
      ["Reports", "M5 19V9M12 19V5M19 19v-7"],
    ],
  },
  {
    label: "Records",
    items: [
      ["Sites", "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"],
      ["Devices", "M4 7h16v10H4z M8 21h8"],
      ["People", "M16 19v-1.2a3.2 3.2 0 0 0-3.2-3.2H8.2A3.2 3.2 0 0 0 5 17.8V19 M10.5 11.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4z M19 19v-1.1a2.6 2.6 0 0 0-2-2.5 M15.2 5.9a2.5 2.5 0 0 1 0 4.6"],
      ["Footage", "M4 7h11v10H4z M15 10l5-2.5v9L15 14"],
    ],
  },
  {
    label: "Account",
    items: [
      ["Alerts", "M6 16h12l-1.2-2.2a6 6 0 1 0-9.6 0z M10 18a2 2 0 0 0 4 0"],
      ["Billing", "M3 8h18v10H3z M3 12h18 M7 8V6a5 5 0 0 1 10 0v2"],
      ["Archive", "M4 7h16v4H4z M6 11v8h12v-8"],
      ["Settings", "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z M12 3.5v2M12 18.5v2M4.8 6.2l1.5 1.4M17.7 16.4l1.5 1.4M3.5 12h2M18.5 12h2M4.8 17.8l1.5-1.4M17.7 7.6l1.5-1.4"],
    ],
  },
] as const;

const ROWS: [string, string, string, string, string, Status][] = [
  ["Lane drift", "Today, 09:14", "North yard", "VAN-1842", "Mira Adler", "Flagged"],
  ["Hard brake", "Today, 09:02", "Pier 4", "VAN-2201", "Leo Marsh", "Open"],
  ["Seat check", "Today, 08:41", "West gate", "CAR-088", "Noah Pell", "Cleared"],
  ["Idle over 20m", "Today, 08:16", "Depot B", "VAN-1760", "Ada Quinn", "Hold"],
  ["Following gap", "Yesterday", "Route 9", "VAN-1842", "Mira Adler", "Flagged"],
  ["Speeding", "Yesterday", "Hill road", "CAR-214", "Jon Ibarra", "Open"],
  ["Camera off", "Yesterday", "Depot B", "VAN-0904", "Ada Quinn", "Flagged"],
  ["Late arrival", "Nov 5", "South dock", "VAN-3310", "Leo Marsh", "Cleared"],
  ["Harsh corner", "Nov 5", "Old mill", "CAR-088", "Noah Pell", "Open"],
  ["Fuel drop", "Nov 4", "Pier 4", "VAN-2201", "Jon Ibarra", "Hold"],
  ["Unassigned stop", "Nov 4", "North yard", "VAN-1760", "Mira Adler", "Open"],
  ["Night exit", "Nov 3", "West gate", "VAN-0904", "Ada Quinn", "Cleared"],
  ["Door ajar", "Nov 3", "Route 9", "CAR-214", "Leo Marsh", "Flagged"],
  ["Geofence", "Nov 2", "South dock", "VAN-3310", "Noah Pell", "Open"],
];

type Status = "Flagged" | "Open" | "Cleared" | "Hold";

const TONE: Record<Status, string> = {
  Flagged: "bad",
  Open: "info",
  Cleared: "ok",
  Hold: "warn",
};

const AVATAR: Record<string, string> = {
  "Mira Adler": "#7c5cbf",
  "Leo Marsh": "#0f766e",
  "Noah Pell": "#b45309",
  "Ada Quinn": "#be185d",
  "Jon Ibarra": "#1d4ed8",
};

const ACTIVITY = [
  ["09:14", "Mira Adler flagged lane drift on VAN-1842."],
  ["09:02", "Leo Marsh opened a hard-brake clip from Pier 4."],
  ["08:41", "Seat check at West gate was cleared."],
  ["08:20", "Ada Quinn moved two clips to Hold."],
  ["08:02", "Night batch from Depot B finished indexing."],
  ["07:40", "Jon Ibarra exported yesterday’s route report."],
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Month({ title, year, month, range }: { title: string; year: number; month: number; range?: [number, number] }) {
  const lead = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <section className="month">
      <h3>{title}</h3>
      <div className="cal">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="dow">{d}</span>)}
        {cells.map((day, i) => {
          if (day == null) return <span key={`e${i}`} className="pad" />;
          const inside = range != null && day >= range[0] && day <= range[1];
          const edge = range != null && (day === range[0] || day === range[1]);
          return (
            <button key={day} type="button" className={`day${inside ? " in" : ""}${edge ? " edge" : ""}`}>
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function Dashboard() {
  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <span className="mark">H</span>
          <span>
            <strong>Harbor</strong>
            <small>Field desk</small>
          </span>
        </div>
        <input type="search" placeholder="Search" aria-label="Search the desk" />
        {NAV.map((group) => (
          <nav key={group.label} aria-label={group.label}>
            <p className="group">{group.label}</p>
            <ul>
              {group.items.map(([name, icon]) => (
                <li key={name}>
                  <a href={`#${name.toLowerCase()}`} aria-current={name === "Queue" ? "page" : undefined}>
                    <Icon d={icon} />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </aside>

      <div className="main">
        <header className="top">
          <nav aria-label="Sections">
            <ul>
              <li><a href="#queue" aria-current="page">Queue</a></li>
              <li><a href="#timeline">Timeline</a></li>
              <li><a href="#reports">Reports</a></li>
            </ul>
          </nav>
          <div className="top-actions">
            <button type="button" className="outline secondary">Export</button>
            <button type="button" className="outline secondary">Manage tags</button>
            <span className="user">
              <i className="av" style={{ background: AVATAR["Mira Adler"] }}>MA</i>
              <span>Mira Adler</span>
            </span>
          </div>
        </header>

        <div className="workspace">
          <section className="board">
            <div className="title">
              <div>
                <h1>Review queue</h1>
                <p>Open clips, flagged stops, and the day’s cleared work across every site.</p>
              </div>
              <kbd>G</kbd>
              <kbd>Q</kbd>
            </div>

            <div className="toolbar" role="search">
              <input type="search" placeholder="Search site, device, or person" aria-label="Filter the queue" />
              <select aria-label="Site" defaultValue="all">
                <option value="all">All sites</option>
                <option>North yard</option>
                <option>Pier 4</option>
                <option>West gate</option>
                <option>Depot B</option>
                <option>South dock</option>
              </select>
              <button type="button" className="outline secondary">Nov 2 – Nov 7</button>
              <button type="button">Today</button>
            </div>

            <div className="stats">
              {[
                ["Open", "128", 68],
                ["Flagged", "17", 22],
                ["Due today", "9", 40],
                ["Cleared", "64", 86],
              ].map(([label, value, pct]) => (
                <article key={String(label)} className="stat">
                  <header><span>{label}</span></header>
                  <strong>{value}</strong>
                  <progress value={Number(pct)} max={100}>{pct}%</progress>
                </article>
              ))}
            </div>

            <div className="table-wrap">
              <table className="striped">
                <thead>
                  <tr>
                    <th><input type="checkbox" aria-label="Select all" /></th>
                    <th>Event</th>
                    <th>When</th>
                    <th>Site</th>
                    <th>Device</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => {
                    const [event, when, site, device, person, status] = row;
                    return (
                      <tr key={`${event}-${when}-${device}`}>
                        <td><input type="checkbox" aria-label={`Select ${event}`} defaultChecked={status === "Flagged"} /></td>
                        <td><span>{event}</span></td>
                        <td><span>{when}</span></td>
                        <td><span>{site}</span></td>
                        <td><span>{device}</span></td>
                        <td>
                          <span className="who">
                            <i className="av" style={{ background: AVATAR[person] }}>{person.split(" ").map((p) => p[0]).join("")}</i>
                            <span>{person}</span>
                          </span>
                        </td>
                        <td><span className={`badge ${TONE[status]}`} data-flag={status === "Flagged" ? "" : undefined}>{status}</span></td>
                        <td><button type="button" className="outline secondary">Open</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <footer className="pager">
              <span>Showing 1–14 of 128</span>
              <div>
                <button type="button" className="outline secondary" disabled>Prev</button>
                <button type="button" aria-current="page">1</button>
                <button type="button" className="outline secondary">2</button>
                <button type="button" className="outline secondary">3</button>
                <button type="button" className="outline secondary">Next</button>
              </div>
            </footer>
          </section>

          <aside className="rail">
            <article className="cal-card">
              <header>
                <strong>Range</strong>
                <span>Nov 2 – Nov 7</span>
              </header>
              <div className="months">
                <Month title="November 2026" year={2026} month={10} range={[2, 7]} />
                <Month title="December 2026" year={2026} month={11} />
              </div>
              <ul className="presets">
                {["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month"].map((name) => (
                  <li key={name}><button type="button" className={name === "Last 7 days" ? "" : "outline secondary"}>{name}</button></li>
                ))}
              </ul>
              <footer>
                <button type="button" className="outline secondary">Clear</button>
                <button type="button">Apply</button>
              </footer>
            </article>

            <article>
              <header><strong>Shift note</strong></header>
              <label>
                Priority
                <select defaultValue="high" aria-label="Priority">
                  <option value="low">Low</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <label>
                Note
                <textarea rows={3} defaultValue="Recheck VAN-1842 before the noon dispatch." />
              </label>
              <label className="inline">
                <input type="checkbox" role="switch" defaultChecked />
                <span>Notify the assignee</span>
              </label>
              <label>
                Confidence
                <input type="range" min={0} max={100} defaultValue={72} aria-label="Confidence" />
              </label>
              <button type="button">Save note</button>
            </article>

            <article>
              <header><strong>Activity</strong></header>
              <ul className="feed">
                {ACTIVITY.map(([time, text]) => (
                  <li key={time}>
                    <span className="when">{time}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}
