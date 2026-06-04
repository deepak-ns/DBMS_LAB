import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 text-center">
        {/* Changed grid-cols-3 to grid-cols-1 md:grid-cols-2 to show two items centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center">

          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About RV SportsSphere</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              Your one-stop platform for managing campus sports. Book courts, rent gear, track your team's progress, and stay updated on all sports announcements and events.
            </p>
          </div>

          {/* Project Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><a href="https://github.com/dshetty067/DBMS_SportsSphere" className="hover:underline">GitHub Repository</a></li>
             <li>
              <Link to="/about" className="hover:underline">
                About Page
              </Link>
            </li>
             <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-gray-500 text-sm">
          © 2025-2026 RV SportsSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;