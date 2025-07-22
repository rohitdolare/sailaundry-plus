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
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <HeroSection userName={userName} />
      <StatsSection ongoing={ongoing} upcoming={upcoming} thisWeek={thisWeek} />
      <QuickActions />
      <Testimonials />
      <HighlightNote />
    </div>
  );
};

export default HomePage;
