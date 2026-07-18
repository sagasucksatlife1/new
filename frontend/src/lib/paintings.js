// Curated public-domain classical portraits from The Met Open Access collection.
// Direct file URLs (images.metmuseum.org) — CORS-enabled, image/jpeg.
export const PAINTINGS = [
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP145921.jpg", label: "Rembrandt · Herman Doomer" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP145920.jpg", label: "Rembrandt · Hendrickje Stoffels" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-30758-001.jpg", label: "Rembrandt · Aristotle with a Bust of Homer" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP145947.jpg", label: "Rembrandt · Portrait of a Man" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-687-001.jpg", label: "Caravaggio · The Musicians" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-44524-001.jpg", label: "Pourbus · Portrait of a Young Woman" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/175442.jpg", label: "Friedrich · Portrait of a Man" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DT1502_cropped2.jpg", label: "Van Gogh · Self-Portrait with a Straw Hat" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/ep32.100.2.bw.R.jpg", label: "Brouwer · The Brawl" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-14201-001.jpg", label: "Puvis de Chavannes · The Shepherd's Song" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP123854.jpg", label: "Poussin · Midas at the Pactolus" },
  { url: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-43051-001.jpg", label: "Raphael · Madonna and Child Enthroned" },
];

export const paintingFor = (i) => PAINTINGS[i % PAINTINGS.length];
