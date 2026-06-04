import Navbar from "./Navbar";
import Footer from "./Footer";

export default function About() {
  return (
     <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-center">About RV SportsSphere</h1>
        <p className="text-lg leading-relaxed text-center mb-12">
          Your all-in-one college sports platform to view facilities, book courts,
          join events, and rent equipment — all in one place.
        </p>

        <h3 className="text-3xl font-bold mt-10 mb-4 underline">Features :</h3>
        <ul className="space-y-4 text-lg">
          <li><strong>Facility & Court Viewing:</strong> Browse and explore all sports facilities with real-time availability.</li>
          <li><strong>Court Booking System:</strong> Book courts easily with instant confirmation for 1–2 hour slots.</li>
          <li><strong>Virtual Wallet & Payments:</strong> Add funds, monitor balance, and make smooth, secure payments.</li>
          <li><strong>Sports Equipment Rental:</strong> Rent a variety of sports equipment with a simple checkout and return process.</li>
          <li><strong>Events & Notifications:</strong> Stay informed with updates on college tournaments, selections, and matches.</li>
            <li><strong>Team Management & Tracking:</strong> Coaches can manage teams, track player performance, and monitor progress over time.</li>
        </ul>
      </main>

      <Footer />
    </div>
  );
}
