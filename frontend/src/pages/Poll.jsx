import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import Layout from '../components/AppNavbar';

export default function Poll() {
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) return;
    setSubmitted(true);
    // TODO: call backend API to submit vote
  };

  return (
    <Layout>
      <Card>
        <Card.Body>
          <Card.Title>Vote for Your Favorite Option</Card.Title>
          {submitted && <Alert variant="success">Vote submitted successfully!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Check 
              type="radio"
              name="poll"
              label="Option 1"
              value="option1"
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <Form.Check 
              type="radio"
              name="poll"
              label="Option 2"
              value="option2"
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <Form.Check 
              type="radio"
              name="poll"
              label="Option 3"
              value="option3"
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <Button type="submit" variant="primary" className="mt-3">Submit Vote</Button>
          </Form>
        </Card.Body>
      </Card>
    </Layout>
  );
}
