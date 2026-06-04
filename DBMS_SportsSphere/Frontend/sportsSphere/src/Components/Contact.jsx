import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Contact() {
  return (
     <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-center">Contact Us</h1>
        <p className="text-lg leading-relaxed text-center mb-12">
            For any inquiries, support, or feedback, please reach out to us :
            <br />
            Dhanush P Shetty - dhanushpshetty.is23@rvce.edu.in
            <br />
            Deepak Kumar NS - deepakkumarn.is23@rvce.edu.in
        </p>

      </main>

      <Footer />
    </div>
  );
}
