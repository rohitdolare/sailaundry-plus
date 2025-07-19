// src/pages/ContactPage.jsx
import PageHeader from "../components/PageHeader";
import { Mail, Phone, HelpCircle } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="p-4 space-y-6">
      <PageHeader title="Contact Us" />

      <div className="rounded-2xl p-6 bg-white/80 dark:bg-gray-800/80 shadow-md border border-gray-200 dark:border-gray-700">
        <p className="mb-4 text-gray-700 dark:text-gray-300 text-sm">
          Need help? Reach out to us:
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="text-sky-600 dark:text-sky-400" size={20} />
            <span className="text-gray-900 dark:text-white text-sm">
              +91 98765 43210
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-sky-600 dark:text-sky-400" size={20} />
            <span className="text-gray-900 dark:text-white text-sm">
              support@sailaundry.in
            </span>
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="text-sky-600 dark:text-sky-400" size={20} />
            <span className="text-gray-900 dark:text-white text-sm">
              Available 9AM–9PM, All Days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
