interface ILoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const Loader: React.FC<ILoaderProps> = ({ size = "xs" }) => {
  const loaderSizeClass = () => {
    let sizeClass = "w-6 h-6 border-[1.5px] border-t-[1.5px]";
    if (size === "sm") {
      sizeClass = "w-10 h-10";
    }
    if (size === "md") {
      sizeClass = "w-14 h-14";
    }
    if (size === "lg") {
      sizeClass = "w-20 h-20";
    }
    if (size === "xl") {
      sizeClass = "w-24 h-24";
    }
    if (size === "2xl") {
      sizeClass = "w-28 h-28";
    }
    if (size === "3xl") {
      sizeClass = "w-32 h-32";
    }
    return sizeClass;
  };

  return (
    <>
      <div className="flex-col items-center justify-center bg-opacity-50">
        <div
          className={`
        loader ease-linear rounded-full border-[4px] border-t-[4px] border-gray-300
        ${loaderSizeClass()}`}
        >
          <p></p>
        </div>
      </div>
    </>
  );
};

export default Loader;
