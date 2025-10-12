"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link className={`link ${active ? "active" : ""}`} href={href}>
      {label}
    </Link>
  );
};

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <Image src="/logo.svg" alt="Chupaboo" width={28} height={28} priority />
        <span>Chupaboo loading</span>
      </Link>
      <div className={`links ${open ? "open" : ""}`}>
        <NavLink href="/" label="Home" />
        <NavLink href="/about" label="About" />
        <NavLink href="/contact" label="Contact" />
      </div>
      <button className="mobileToggle" onClick={() => setOpen(v => !v)}>
        Menu
      </button>
    </nav>
  );
}
