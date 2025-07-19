// src/pages/ContactPage.jsx
import PageHeader from "../components/PageHeader";
import { Mail, Phone, HelpCircle } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Contact Us" />
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="mb-4 text-gray-700">Need help? Reach out to us:</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="text-sky-600" size={20} />
            <span className="text-gray-800">+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-sky-600" size={20} />
            <span className="text-gray-800">support@sailaundry.in</span>
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="text-sky-600" size={20} />
            <span className="text-gray-800">Available 9AM–9PM, All Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
