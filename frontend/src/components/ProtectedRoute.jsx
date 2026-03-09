import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { WalletContext } from "../context/WalletContext";

export default function ProtectedRoute({ children }) {
  const { account, loading } = useContext(WalletContext);

  if (loading) return <div>Loading...</div>; // Prevent premature redirect

  return account ? children : <Navigate to="/" replace />;
}
