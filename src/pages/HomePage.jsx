import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { HeroSection, HighlightNote, QuickActions, StatsSection, Testimonials } from "../components/home";
import { subscribeToUserOrders } from "../services/firestore/orderService";

const HomePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserOrders(user.uid, setOrders);

    return () => unsubscribe();
  }, [user?.uid]);
  
  const userName = user?.name || "Guest";

  const ongoing = orders.filter((o) => o.status !== "Completed").length;
  const upcoming = orders.filter(
    (o) => o.pickupDate && new Date(o.pickupDate) > new Date()
  ).length;
  const thisWeek = orders.filter((o) => {
    const now = new Date();
    const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
    return (now - orderDate) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 dark:from-indigo-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100 dark:from-pink-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative mx-auto max-w-5xl space-y-8 px-4 py-8">
        <HeroSection userName={userName} />
        <StatsSection ongoing={ongoing} upcoming={upcoming} thisWeek={thisWeek} />
        <QuickActions />
        <Testimonials />
        <HighlightNote />
      </div>
    </div>
  );
};

export default HomePage;
