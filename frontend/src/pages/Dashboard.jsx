import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import PollList from "../components/PollList";

export default function Dashboard() {
  const { account, connectWallet } = useContext(WalletContext);
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <div>
          {account ? (
            <span className="badge bg-success me-2">{account.substring(0, 6)}...{account.substring(38)}</span>
          ) : (
            <button onClick={connectWallet} className="btn btn-warning">Connect Wallet</button>
          )}
          <Link to="/create" className="btn btn-primary">Create Poll</Link>
        </div>
      </div>

      <PollList />
    </div>
  );
}
