// WalletProvider.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { supabase } from '../../supabase/supabase'; // Make sure this is a valid import

type WalletContextType = {
  connected: boolean;
  publicKey: PublicKey | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  connection: Connection;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setPublicKey(new PublicKey(response.publicKey));
          setConnected(true);
          await createUserIfNotExists(response.publicKey.toString());
        }
      }
    } catch (error) {
      console.log('Phantom wallet not connected:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        alert('Phantom wallet not found! Please install Phantom.');
        return;
      }

      const response = await solana.connect();
      setPublicKey(new PublicKey(response.publicKey));
      setConnected(true);
      setIsModalOpen(false);

      await createUserIfNotExists(response.publicKey.toString());
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    try {
      const { solana } = window as any;
      if (solana?.disconnect) {
        solana.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
    setPublicKey(null);
    setConnected(false);
  };

  const createUserIfNotExists = async (walletAddress: string) => {
    try {
      const { data: user, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user:', checkError);
        return;
      }

      if (!user) {
        const { error: insertError } = await supabase.from('users').insert({
          wallet_address: walletAddress,
        });

        if (insertError) {
          console.error('Error inserting user:', insertError);
        } else {
          console.log('New user created');
        }
      } else {
        console.log('User already exists');
      }
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        connectWallet,
        disconnectWallet,
        isModalOpen,
        openModal,
        closeModal,
        connection,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
