import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [wallet, setWallet] = useState(
    localStorage.getItem("wallet")
  );

  const login = (address) => {
    setWallet(address);
    localStorage.setItem("wallet", address);
  };

  const logout = () => {
    setWallet(null);
    localStorage.removeItem("wallet");
  };

  return (
    <AuthContext.Provider value={{ wallet, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
