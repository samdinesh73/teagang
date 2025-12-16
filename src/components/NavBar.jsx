const NavBar = ({ onOpen }) => {
  return (
    <nav className="fixed top-0 left-0 z-50 md:p-9 p-3 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <img
          src="/images/TGlogo@4x.png"
          alt="Tea Gang"
          className="md:w-18 lg:w-24 lg:h-24 sm:w-20 sm:h-20 w-15 h-20"
        />

        <div className="hidden md:block">
          <button
            onClick={onOpen}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-all"
          >
            Join Gang
          </button>
        </div>

        <div className="md:hidden">
          <button
            onClick={onOpen}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-3 rounded-full shadow"
            aria-label="Join Gang"
          >
            Join
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
