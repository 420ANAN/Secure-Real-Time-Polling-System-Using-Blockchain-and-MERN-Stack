import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const { wallet, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>Secure Polling</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {wallet && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
            {wallet && <Nav.Link as={Link} to="/results">Results</Nav.Link>}
          </Nav>
          {wallet && (
            <Button variant="outline-light" size="sm" onClick={logout}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
