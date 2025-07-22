import { Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import laundryImg from "../../assets/laundry-hero.svg";

export const HeroSection = ({ userName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col-reverse items-center gap-6 rounded-3xl bg-gradient-to-r from-blue-50 to-purple-100 p-6 shadow-inner dark:from-gray-800 dark:to-gray-900 md:flex-row">
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-white sm:text-3xl">
          Welcome, {userName} 👋
        </h1>
        <p className="mx-auto mt-2 max-w-md text-gray-700 dark:text-gray-300 md:mx-0">
          Your personal laundry assistant is here. Smart pickup. Fast
          delivery. Impeccable care.
        </p>
        <button
          onClick={() => navigate("/place-order")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-md transition hover:bg-indigo-700"
        >
          <Shirt size={18} />
          Place New Order
        </button>
      </div>
      <img
        src={laundryImg}
        alt="Laundry Illustration"
        className="w-52 drop-shadow-md sm:w-64"
      />
    </div>
  );
};

