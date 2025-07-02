import React, { useState } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import apiClient from '../api/axios';

interface Props {
  onSuccess: () => void;
}

export default function TopupForm({ onSuccess }: Props) {
  const [amount, setAmount] = useState<number | string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/wallet/topup', { balance: Number(amount) });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.Message || 'Top-up failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleTopup}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="amount"
        label="Amount"
        name="amount"
        type="number"
        autoFocus
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? 'Processing...' : 'Top Up'}
      </Button>
    </Box>
  );
}
