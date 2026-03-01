import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/saved', label: 'Saved' },
  { to: '/digest', label: 'Digest' },
  { to: '/settings', label: 'Settings' },
  { to: '/proof', label: 'Proof' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`app-nav${open ? ' app-nav--open' : ''}`} aria-label="Main">
      <div className="app-nav__items">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
            }
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        className="app-nav__toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="app-nav__toggle-bar" />
      </button>
    </nav>
  );
}
