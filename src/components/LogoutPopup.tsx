import { useWallet } from "@/context/walletContext";
import useMintStore from "@/lib/store/mint";
import { HiExclamationCircle } from "react-icons/hi";
import { text } from "stream/consumers";

const LogoutPopup = ({ onCancel }: {
  onCancel: () => void;
}) => {
  const { resetMintState } = useMintStore();
  const { walletProvider } = useWallet();

  const handleLogout = async () => {
    resetMintState();
    await walletProvider.disconnect();
  };

  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-white">Confirm Logout</p>
        <p className="text-sm font-normal text-gray-300 text-center mt-1 mx-auto">
          You will be logged out of your application and returned to the login
          screen.
        </p>
      </div>
      <div className="flex justify-center items-center grow gap-2 w-full px-5 py-3">
        <button
          className="w-1/2 py-2 rounded-full cursor-pointer border border-gray-300 text-white text-base font-medium leading-normal"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="w-1/2 py-2 bg-blue-600 rounded-full cursor-pointer border border-blue-700 text-white text-base font-medium leading-normal hover:bg-blue-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default LogoutPopup;
