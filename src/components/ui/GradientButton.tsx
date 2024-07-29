import Loader from "./Loader";

const GradientButton = ({
  title,
  handleClick,
  loading,
  btnClass,
}: {
  title: string;
  handleClick: () => void;
  loading?: boolean;
  btnClass?: string;
}) => {
  return (
    <button
      className={`gradient-btn relative w-fit rounded-full px-12 py-4 flex items-center justify-center capitalize ${btnClass}`}
      onClick={() => handleClick && handleClick()}
    >
      {loading ? <Loader size="xs" /> : title}
    </button>
  );
};

export default GradientButton;
