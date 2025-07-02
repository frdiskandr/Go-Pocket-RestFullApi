import React, { useState } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import apiClient from '../api/axios';

interface Props {
  onSuccess: () => void;
}

export default function TransferForm({ onSuccess }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/wallet/transfer', { 
        toPhoneNumber: phoneNumber, 
        balance: Number(amount) 
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.Error || 'Transfer failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleTransfer}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="phoneNumber"
        label="Recipient Phone Number"
        name="phoneNumber"
        autoFocus
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="amount"
        label="Amount"
        name="amount"
        type="number"
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
        {loading ? 'Processing...' : 'Transfer'}
      </Button>
    </Box>
  );
}
