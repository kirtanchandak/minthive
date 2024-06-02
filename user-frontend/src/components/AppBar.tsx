import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import axios from "axios";

function AppBar() {
  const { publicKey, signMessage } = useWallet();

  async function signAndSend() {
    if (!publicKey) {
      return;
    }
    const message = new TextEncoder().encode("Sign into minthive");
    const signature = await signMessage?.(message);

    const response = await axios.post("http://localhost:3000/v1/user/signin", {
      signature,
      publicKey: publicKey?.toString(),
    });

    localStorage.setItem("token", response.data.token);
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);

  return (
    <>
      <div className="flex justify-between py-3 px-12 border-b">
        <a href="/">
          <p className="text-2xl font-bold">minthive 🪙</p>
        </a>
        <div>
          <p className="text-2xl">
            {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
          </p>
        </div>
      </div>
    </>
  );
}

export default AppBar;
