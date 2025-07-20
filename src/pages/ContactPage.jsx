// src/pages/ContactPage.jsx
import PageHeader from "../components/PageHeader";
import { Mail, Phone, HelpCircle, MapPin } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <PageHeader
        title="📞 Contact Us"
        subtitle="We’re here to help. Reach out for any support or queries."
      />

      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="space-y-6">
          <ContactItem
            icon={<Phone className="text-sky-600 dark:text-sky-400" size={22} />}
            label="Phone"
            value="+91 98765 43210"
          />
          <ContactItem
            icon={<Mail className="text-sky-600 dark:text-sky-400" size={22} />}
            label="Email"
            value="support@sailaundry.in"
          />
          <ContactItem
            icon={<HelpCircle className="text-sky-600 dark:text-sky-400" size={22} />}
            label="Hours"
            value="Available 9AM–9PM, All Days"
          />
        </div>
      </div>

      {/* 🔍 Store Location Map */}
      <div className="rounded-3xl border border-gray-200 shadow-sm dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 bg-sky-100 dark:bg-sky-900 p-3">
          <MapPin className="text-sky-700 dark:text-white" size={20} />
          <h3 className="text-sky-800 dark:text-white text-sm font-semibold">
            Our Store Location
          </h3>
        </div>
        <iframe
          title="Sai Laundry Location"
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d274.9888205756917!2d74.2758630089942!3d16.742112556833074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1753037917300!5m2!1sen!2sin"
          width="100%"
          height="300"
          loading="lazy"
          style={{ border: 0 }}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      
      </div>
    </div>
  );
};

const ContactItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-base text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default ContactPage;
