"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SmokeCanvas } from "./smoke-canvas";

type Variant = "primary" | "secondary";
type SectionId = "about" | "founder" | "projects" | "contact";

const copy = {
  about: "Space Pug Games is a game label that focuses on developing atmospheric and story-driven games with an emphasis on horror, mystery, role-playing, and immersive gameplay. Project development is carried out through a proven network of freelance specialists in the fields of programming, graphics, animation, audio, and game design.",
  founder: "Founded by a producer and game designer with over 18 years of experience in the gaming industry, who worked for companies like Crytek, SpilGames, Gameforge, SneakyBox and on projects for Atari, Netflix, Sega, etc.",
};

const sections: Array<{ id: SectionId; label: string }> = [
  { id: "about", label: "About" },
  { id: "founder", label: "Founder" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const secondaryMedia: Record<SectionId, string> = {
  about: "/designs/secondary/about.png",
  founder: "/designs/secondary/founder.png",
  projects: "/designs/secondary/projects.png",
  contact: "/designs/secondary/contact.png",
};

export function SpacePugSite({ variant }: { variant: Variant }) {
  const [active, setActive] = useState<string>("hero");
  const [revealed, setRevealed] = useState<string[]>(["hero"]);

  useEffect(() => {
    const ids = ["hero", ...sections.map((section) => section.id)];
    const observer = new IntersectionObserver((entries) => {
      const best = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (best) setActive(best.target.id);
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => setRevealed((seen) => seen.includes(entry.target.id) ? seen : [...seen, entry.target.id]));
    }, { threshold: [0.35, 0.55, 0.75] });
    ids.forEach((id) => document.getElementById(id) && observer.observe(document.getElementById(id)!));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      document.documentElement.style.setProperty("--primary-parallax", `${Math.min(window.scrollY, 280) * -0.022}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const classes = `site variant-${variant}`;
  return <main className={classes}>
    <ScrollRail active={active} />
    <section id="hero" className="hero scene is-revealed">
      {variant === "secondary" && <Image src="/designs/secondary/hero.png" alt="Space Pug Games planet horizon" fill priority className="scene-image" />}
      <div className="hero-content"><div className="logo-shell"><Image src="/brand/space-pug-games-transparent.png" alt="Space Pug Games" width={1200} height={854} priority className="brand-logo" /></div><h1 className="hero-claim">Indie Games with Heart and Bite</h1></div>
    </section>
    <section id="about" className={`content-section scene ${revealed.includes("about") ? "is-revealed" : ""} ${active === "about" ? "is-active" : ""}`}><SceneImage variant={variant} id="about" /><SmokeCanvas /><div className="copy about-copy"><p className="eyebrow">About Space Pug Games</p><TechText text={copy.about} /></div></section>
    <section id="founder" className={`content-section scene ${revealed.includes("founder") ? "is-revealed" : ""} ${active === "founder" ? "is-active" : ""}`}><SceneImage variant={variant} id="founder" /><div className="founder-galaxy" aria-hidden="true" /><div className="founder-galaxy-arms" aria-hidden="true" /><div className="founder-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div><div className="copy founder-copy"><p className="eyebrow">Founder</p><TechText text={copy.founder} /></div></section>
    <section id="projects" className={`content-section scene ${revealed.includes("projects") ? "is-revealed" : ""} ${active === "projects" ? "is-active" : ""}`}><SceneImage variant={variant} id="projects" /><div className="copy projects-copy tech-reveal"><p className="eyebrow">Projects</p><h2>Will follow soon.</h2><span>In development</span></div></section>
    <section id="contact" className={`content-section scene ${revealed.includes("contact") ? "is-revealed" : ""} ${active === "contact" ? "is-active" : ""}`}><SceneImage variant={variant} id="contact" /><div className="copy contact-copy"><div className="tech-reveal"><p className="eyebrow">Get in touch</p><h2>Send your message into the void, we listen.</h2></div><a className="mail-action tech-mail-reveal" href="mailto:nils@spacepuggames.de" aria-label="Send mail to Space Pug Games"><span aria-hidden="true">✉</span><b>Send mail</b></a></div></section>
    <footer><div className="logo-shell footer-logo"><Image src="/brand/space-pug-games-transparent.png" alt="Space Pug Games" width={1200} height={854} /></div><a href="/imprint">Imprint</a></footer>
  </main>;
}

function SceneImage({ variant, id }: { variant: Variant; id: SectionId }) {
  if (variant === "primary") return <div className={`primary-art primary-${id}`} aria-hidden="true" />;
  return <Image src={secondaryMedia[id]} alt="" fill className="scene-image" />;
}

function TechText({ text }: { text: string }) {
  return <p className="tech-copy">{text}</p>;
}

function ScrollRail({ active }: { active: string }) {
  return <nav className="scroll-rail" aria-label="Page sections"><a href="#hero" className={active === "hero" ? "active" : ""}><span>Hero</span></a>{sections.map((section) => <a key={section.id} href={`#${section.id}`} className={active === section.id ? "active" : ""}><span>{section.label}</span></a>)}</nav>;
}
