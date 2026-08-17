// src/contexts/AdminDataContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAllOrders } from "../services/firestore/orderService";
import { subscribeToAllCustomers } from "../services/firestore/userService";

const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [customers, setCustomers] = useState(null); // null = not yet loaded
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((data) => {
      setOrders(data);
      setOrdersLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAllCustomers((data) => {
      setCustomers(data);
      setCustomersLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = { orders, ordersLoading, customers, customersLoading };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export const useAdminData = () => useContext(AdminDataContext);
