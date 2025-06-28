import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
  
  // Use devnet for development, can be changed to mainnet-beta for production
  const connection = new Connection(
    import.meta.env.PROD 
      ? 'https://api.mainnet-beta.solana.com' 
      : 'https://api.devnet.solana.com', 
    'confirmed'
  );

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return;
      
      const { solana } = window as any;
      if (solana && solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setPublicKey(response.publicKey);
          setConnected(true);
          // Create user when wallet is already connected
          await createUserIfNotExists(response.publicKey.toString());
        }
      }
    } catch (error) {
      console.log('Wallet not connected');
    }
  };

  const connectWallet = async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Wallet connection only available in browser');
      }

      const { solana } = window as any;
      
      if (!solana) {
        alert('Phantom wallet not found! Please install Phantom wallet.');
        return;
      }

      if (solana.isPhantom) {
        const response = await solana.connect();
        setPublicKey(response.publicKey);
        setConnected(true);
        setIsModalOpen(false);
        
        // Create user in database if doesn't exist
        await createUserIfNotExists(response.publicKey.toString());
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const createUserIfNotExists = async (walletAddress: string) => {
    try {
      // Validate wallet address
      if (!walletAddress || walletAddress.trim() === '') {
        console.error('Invalid wallet address provided');
        return;
      }

      // First check if user already exists - use maybeSingle() to handle no results gracefully
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user existence:', checkError);
        return;
      }

      // If user doesn't exist, create them
      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress.trim()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user:', insertError);
          // Provide more specific error handling
          if (insertError.code === '42501') {
            console.error('RLS policy violation - check database policies');
          }
        } else {
          console.log('User created successfully:', newUser);
        }
      } else {
        console.log('User already exists');
      }
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setConnected(false);
    
    try {
      if (typeof window !== 'undefined') {
        const { solana } = window as any;
        if (solana && solana.disconnect) {
          solana.disconnect();
        }
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
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
        connection
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}