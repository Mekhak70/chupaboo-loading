export default function Footer() {
    return (
      <footer className="footer">
        <div className="container" style={{display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12}}>
          <span>© {new Date().getFullYear()} Chupaboo loading</span>
          <span>Built with Next.js • Made Mxo</span>
        </div>
      </footer>
    );
  }
  