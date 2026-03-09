import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";

export default function Login() {
  const { account, connectWallet } = useContext(WalletContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      navigate("/dashboard");
    }
  }, [account, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4">Decentralized Polling System</h1>
      <p className="lead mb-4">Vote securely and transparently on the blockchain.</p>

      <button onClick={connectWallet} className="btn btn-lg btn-primary">
        Connect Wallet to Start
      </button>
    </div>
  );
}
