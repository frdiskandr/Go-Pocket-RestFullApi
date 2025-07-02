import { useState } from 'react';
import { ArrowRightLeft, PlusCircle, History } from 'lucide-react';
import ActionModal from './ActionModal';
import TopupForm from './TopupForm';
import TransferForm from './TransferForm';
import TransactionHistory from './TransactionHistory';

export default function ActionButtons() {
  const [modalType, setModalType] = useState<'topup' | 'transfer' | 'history' | null>(null);

  const handleOpenModal = (type: 'topup' | 'transfer' | 'history') => setModalType(type);
  const handleCloseModal = () => setModalType(null);

  const handleSuccess = () => {
    handleCloseModal();
    window.location.reload();
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto mt-6 text-center">
        <div className="flex flex-col items-center">
          <button 
            onClick={() => handleOpenModal('transfer')}
            className="bg-blue-100 text-blue-600 p-4 rounded-full shadow-md">
            <ArrowRightLeft size={24} />
          </button>
          <p className="text-sm mt-2 font-medium">Transfer</p>
        </div>
        <div className="flex flex-col items-center">
          <button 
            onClick={() => handleOpenModal('topup')}
            className="bg-blue-100 text-blue-600 p-4 rounded-full shadow-md">
            <PlusCircle size={24} />
          </button>
          <p className="text-sm mt-2 font-medium">Top Up</p>
        </div>
        <div className="flex flex-col items-center">
          <button 
            onClick={() => handleOpenModal('history')}
            className="bg-blue-100 text-blue-600 p-4 rounded-full shadow-md">
            <History size={24} />
          </button>
          <p className="text-sm mt-2 font-medium">Riwayat</p>
        </div>
      </div>

      <ActionModal 
        open={modalType !== null}
        onClose={handleCloseModal}
        title={
          modalType === 'topup' ? 'Top Up' : 
          modalType === 'transfer' ? 'Transfer' : 'Transaction History'
        }
      >
        {modalType === 'topup' && <TopupForm onSuccess={handleSuccess} />}
        {modalType === 'transfer' && <TransferForm onSuccess={handleSuccess} />}
        {modalType === 'history' && <TransactionHistory />}
      </ActionModal>
    </>
  );
}