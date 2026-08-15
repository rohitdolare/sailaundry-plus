import PageHeader from "../components/PageHeader";
import { Mail, Phone, HelpCircle, MapPin } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <PageHeader
        title="Support"
        subtitle="We're here to help with any questions or issues."
      />

      <div className="rounded-2xl border border-white border-opacity-60 bg-white bg-opacity-60 p-6 shadow-lg backdrop-blur-xl backdrop-filter dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-60">
        <div className="space-y-6">
          <ContactItem
            icon={<Phone className="text-indigo-600 dark:text-indigo-400" size={22} />}
            label="Phone"
            value="+91 91195 47096"
          />
          <ContactItem
            icon={<Mail className="text-indigo-600 dark:text-indigo-400" size={22} />}
            label="Email"
            value="support@sailaundry.in"
          />
          <ContactItem
            icon={<HelpCircle className="text-indigo-600 dark:text-indigo-400" size={22} />}
            label="Hours"
            value="9 AM – 9 PM, all days"
          />
        </div>
      </div>

      {/* Store Location Map */}
      <div className="rounded-2xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 p-3">
          <MapPin className="text-white" size={20} />
          <h3 className="text-white text-sm font-semibold">
            Store Location
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
