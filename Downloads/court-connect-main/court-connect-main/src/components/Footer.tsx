import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="font-display text-lg font-bold">QuickCourt</span>
          </Link>
          <p className="text-sm text-muted-foreground">Book local sports facilities and find matches near you.</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Explore</h4>
          <div className="flex flex-col gap-2">
            <Link to="/venues" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Venues</Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Popular Sports</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">For Owners</h4>
          <div className="flex flex-col gap-2">
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">List Your Venue</Link>
            <Link to="/owner/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Owner Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Support</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">help@quickcourt.com</span>
            <span className="text-sm text-muted-foreground">+91 98765 43210</span>
          </div>
        </div>
      </div>
      <div className="border-t mt-8 pt-6 text-center">
        <p className="text-sm text-muted-foreground">© 2026 QuickCourt. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
