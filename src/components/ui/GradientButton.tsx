import Loader from "./Loader";

const GradientButton = ({
  title,
  handleClick,
  loading,
}: {
  title: string;
  handleClick: () => void;
  loading?: boolean;
}) => {
  return (
    <button
      className="gradient-btn relative w-fit rounded-full px-12 py-4 flex items-center justify-center capitalize"
      onClick={() => handleClick && handleClick()}
    >
      {loading ? <Loader size="xs" /> : title}
    </button>
  );
};

export default GradientButton;
